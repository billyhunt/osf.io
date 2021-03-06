# -*- coding: utf-8 -*-
import pytz
import markdown
from datetime import datetime
from flask import request
from modularodm import Q

from framework.auth.decorators import must_be_logged_in
from framework.guid.model import Guid

from website.addons.base.signals import file_updated
from website.files.models import FileNode
from website.notifications.constants import PROVIDERS
from website.notifications.emails import notify
from website.models import Comment
from website.project.decorators import must_be_contributor_or_public
from website.project.model import Node
from website.project.signals import comment_added
from website import settings


@file_updated.connect
def update_file_guid_referent(self, node, event_type, payload, user=None):
    if event_type == 'addon_file_moved' or event_type == 'addon_file_renamed':
        source = payload['source']
        destination = payload['destination']
        source_node = Node.load(source['node']['_id'])
        destination_node = node
        file_guids = FileNode.resolve_class(source['provider'], FileNode.ANY).get_file_guids(
            materialized_path=source['materialized'] if source['provider'] != 'osfstorage' else source['path'],
            provider=source['provider'],
            node=source_node)

        if event_type == 'addon_file_renamed' and source['provider'] in settings.ADDONS_BASED_ON_IDS:
            return
        if event_type == 'addon_file_moved' and (source['provider'] == destination['provider'] and
                                                 source['provider'] in settings.ADDONS_BASED_ON_IDS) and source_node == destination_node:
            return

        for guid in file_guids:
            obj = Guid.load(guid)
            if source_node != destination_node and Comment.find(Q('root_target', 'eq', guid)).count() != 0:
                update_comment_node(guid, source_node, destination_node)

            if source['provider'] != destination['provider'] or source['provider'] != 'osfstorage':
                obj.referent = create_new_file(obj, source, destination, destination_node)
                obj.save()


def create_new_file(obj, source, destination, destination_node):
    if not source['path'].endswith('/'):
        data = dict(destination)
        new_file = FileNode.resolve_class(destination['provider'], FileNode.FILE).get_or_create(destination_node, destination['path'])
        if destination['provider'] != 'osfstorage':
            new_file.update(revision=None, data=data)
    else:
        new_file = find_and_create_file_from_metadata(destination.get('children', []), source, destination, destination_node, obj)
        if not new_file:
            if source['provider'] == 'box':
                new_path = obj.referent.path
            else:
                new_path = obj.referent.materialized_path.replace(source['materialized'], destination['materialized'])
            new_file = FileNode.resolve_class(destination['provider'], FileNode.FILE).get_or_create(destination_node, new_path)
            new_file.name = new_path.split('/')[-1]
            new_file.materialized_path = new_path
            new_file.save()
    return new_file


def find_and_create_file_from_metadata(children, source, destination, destination_node, obj):
    """ Given a Guid obj, recursively search for the metadata of its referent (a file obj)
    in the waterbutler response. If found, create a new addon FileNode with that metadata
    and return the new file.
    """
    for item in children:
        if item['kind'] == 'folder':
            return find_and_create_file_from_metadata(item.get('children', []), source, destination, destination_node, obj)
        elif item['kind'] == 'file' and item['materialized'].replace(destination['materialized'], source['materialized']) == obj.referent.materialized_path:
            data = dict(item)
            new_file = FileNode.resolve_class(destination['provider'], FileNode.FILE).get_or_create(destination_node, item['path'])
            if destination['provider'] != 'osfstorage':
                new_file.update(revision=None, data=data)
            return new_file


def update_comment_node(root_target_id, source_node, destination_node):
    Comment.update(Q('root_target', 'eq', root_target_id), data={'node': destination_node})
    source_node.save()
    destination_node.save()


@comment_added.connect
def send_comment_added_notification(comment, auth):
    node = comment.node
    target = comment.target

    context = dict(
        gravatar_url=auth.user.profile_image_url(),
        content=markdown.markdown(comment.content, ['del_ins', 'markdown.extensions.tables', 'markdown.extensions.fenced_code']),
        page_type='file' if comment.page == Comment.FILES else node.project_or_component,
        page_title=comment.root_target.referent.name if comment.page == Comment.FILES else '',
        provider=PROVIDERS[comment.root_target.referent.provider] if comment.page == Comment.FILES else '',
        target_user=target.referent.user if is_reply(target) else None,
        parent_comment=target.referent.content if is_reply(target) else "",
        url=comment.get_comment_page_url()
    )
    time_now = datetime.utcnow().replace(tzinfo=pytz.utc)
    sent_subscribers = notify(
        event="comments",
        user=auth.user,
        node=node,
        timestamp=time_now,
        **context
    )

    if is_reply(target):
        if target.referent.user and target.referent.user not in sent_subscribers:
            notify(
                event='comment_replies',
                user=auth.user,
                node=node,
                timestamp=time_now,
                **context
            )


def is_reply(target):
    return isinstance(target.referent, Comment)


def _update_comments_timestamp(auth, node, page=Comment.OVERVIEW, root_id=None):
    if node.is_contributor(auth.user):
        user_timestamp = auth.user.comments_viewed_timestamp
        node_timestamp = user_timestamp.get(node._id, None)
        if not node_timestamp:
            user_timestamp[node._id] = dict()
        timestamps = auth.user.comments_viewed_timestamp[node._id]

        # update node timestamp
        if page == Comment.OVERVIEW:
            timestamps[Comment.OVERVIEW] = datetime.utcnow()
            auth.user.save()
            return {node._id: auth.user.comments_viewed_timestamp[node._id][Comment.OVERVIEW].isoformat()}

        # set up timestamp dictionary for files page
        if not timestamps.get(page, None):
            timestamps[page] = dict()

        # if updating timestamp on a specific file page
        timestamps[page][root_id] = datetime.utcnow()
        auth.user.save()
        return {node._id: auth.user.comments_viewed_timestamp[node._id][page][root_id].isoformat()}
    else:
        return {}

@must_be_logged_in
@must_be_contributor_or_public
def update_comments_timestamp(auth, node, **kwargs):
    timestamp_info = request.get_json()
    page = timestamp_info.get('page')
    root_id = timestamp_info.get('rootId')
    return _update_comments_timestamp(auth, node, page, root_id)
