from rest_framework import serializers as ser

from api.base.serializers import JSONAPISerializer, LinksField, Link


class UserSerializer(JSONAPISerializer):
    filterable_fields = frozenset([
        'fullname',
        'given_name',
        'middle_name',
        'family_name',
        'id'
    ])
    id = ser.CharField(read_only=True, source='_id')
    fullname = ser.CharField()
    given_name = ser.CharField()
    middle_name = ser.CharField(source='middle_names')
    family_name = ser.CharField()
    suffix = ser.CharField()
    date_registered = ser.DateTimeField(read_only=True)
    gravatar_url = ser.CharField()
    employment_institutions = ser.ListField(source='jobs')
    educational_institutions = ser.ListField(source='schools')
    social_accounts = ser.DictField(source='social')

    links = LinksField({
        'html': 'absolute_url',
        'nodes': {
            'relation': Link('users:user-nodes', kwargs={'pk': '<pk>'})
        }
    })

    class Meta:
        type_ = 'users'

    def absolute_url(self, obj):
        return obj.absolute_url

    def update(self, instance, validated_data):
        # TODO
        pass


class ContributorSerializer(UserSerializer):

    local_filterable = frozenset(['bibliographic'])
    filterable_fields = frozenset.union(UserSerializer.filterable_fields, local_filterable)

    bibliographic = ser.SerializerMethodField()

    def get_bibliographic(self, obj):
        node = self.context['view'].get_node()
        return obj._id in node.visible_contributor_ids