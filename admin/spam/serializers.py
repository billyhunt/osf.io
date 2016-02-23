from website.settings import DOMAIN as OSF_DOMAIN
from website.project.model import User
from furl import furl


def serialize_comment(comment, full=False):
    reports = serialize_reports(comment.reports)
    author_abs_url = furl(OSF_DOMAIN)
    author_abs_url.path.add(comment.user.url)

    return {
        'id': comment._id,
        'author': User.load(comment.user._id),
        'author_path': author_abs_url.url,
        'date_created': comment.date_created,
        'date_modified': comment.date_modified,
        'content': comment.content,
        'has_children': bool(getattr(comment, 'commented', [])),
        'modified': comment.modified,
        'is_deleted': comment.is_deleted,
        'reports': reports,
        'node': comment.node,
        'category': reports[0]['category'],
    }


def serialize_reports(reports):
    return [
        serialize_report(user, report)
        for user, report in reports.iteritems()
    ]


def serialize_report(user, report):
    return {
        'reporter': User.load(user),
        'category': report.get('category', None),
        'reason': report.get('text', None),
    }
