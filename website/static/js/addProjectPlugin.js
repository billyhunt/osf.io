/**
 * UI and function to add project
 */
'use strict';

require('css/add-project-plugin.css');
var $ = require('jquery');
var m = require('mithril');
var $osf = require('js/osfHelpers');

// XHR configuration to get apiserver connection to work
var xhrconfig = function (xhr) {
    xhr.withCredentials = true;
};


var AddProject = {
    controller : function (options) {
        var self = this;
        self.defaults = {
            buttonTemplate : m('.btn.btn-primary[data-toggle="modal"][data-target="#addProjectModal"]', 'Create new project'),
            parentID : null,
            title: 'Create new project',
            modalID : 'addProjectModal',
            stayCallback :null, // Function to call when user decides to stay after project creation
            categoryList : []
        };

        self.viewState = m.prop('form'); // 'processing', 'success', 'error';
        self.options = $.extend({}, self.defaults, options);
        self.nodeType = self.options.parentID === null ? 'project' : 'component';
        self.defaultCat = self.options.parentID === null ? 'project' : '';
        self.showMore = m.prop(false);
        self.newProjectName = m.prop('');
        self.newProjectDesc = m.prop('');
        self.newProjectCategory = m.prop(self.defaultCat);
        self.newProjectTemplate = m.prop('');
        self.goToProjectLink = m.prop('');
        self.saveResult = m.prop({});
        self.errorMessageType = m.prop('unknown');
        self.errorMessage = {
            'unknown' : 'There was an unknown error. Please try again later.'
        };
        self.userProjects =  []; // User nodes

        // Validation
        self.isValid = m.prop(false);
        self.checkValid = function _checkValid() {
            self.isValid(self.newProjectName().trim().length > 0);
        };

        self.mapTemplates = function() {
            self.userProjects = [];
            options.templates().map(function(node){
                self.userProjects.push({title: node.attributes.title, id: node.id});
            });
            return self.userProjects;

        };

        self.add = function _add () {
            var url;
            var data;
            self.viewState('processing');
            if(self.options.parentID) {
                url = $osf.apiV2Url('nodes/' + self.options.parentID + '/children/', { query : {}});
            } else {
                url = $osf.apiV2Url('nodes/', { query : {}});
            }
            data = {
                    'data' : {
                        'type': 'nodes',
                        'attributes': {
                            'title': self.newProjectName(),
                            'category': self.newProjectCategory(),
                            'description' : self.newProjectDesc()
                        }
                    }
                };

            if (self.newProjectTemplate()) {
                data.data.attributes.template_from = self.newProjectTemplate();
            }

            var success = function _success (result) {
                self.viewState('success');
                self.goToProjectLink(result.data.links.html);
                self.saveResult(result);
            };
            var error = function _error (result) {
                self.viewState('error');
            };
            m.request({method : 'POST', url : url, data : data, config : xhrconfig})
                .then(success, error);
            self.newProjectName('');
            self.isValid(false);
        };
        self.reset = function _reset(){
            self.newProjectName('');
            self.viewState('form');
            self.newProjectDesc('');
            self.newProjectCategory(self.defaultCat);
            $('.modal').modal('hide');
            self.isValid(false);
        };
    },
    view : function (ctrl, options) {
        var templates = {
            form : m('.modal-content', [
                m('.modal-header', [
                    m('button.close[data-dismiss="modal"][aria-label="Close"]',{ onclick : function() {
                        ctrl.reset();
                        $osf.trackClick(options.trackingCategory, options.trackingAction, 'click-close-add-project-modal');
                    }}, [
                        m('span[aria-hidden="true"]','×')
                    ]),
                    m('h3.modal-title', ctrl.options.title)
                ]),
                m('.modal-body', [
                    m('.text-left', [
                        m('.form-group.m-v-sm', [
                            m('label[for="projectName].f-w-lg.text-bigger', 'Title'),
                            m('input[type="text"].form-control', {
                                onkeyup: function(ev){
                                    if (ev.which === 13) {
                                         ctrl.add();
                                    }
                                    ctrl.newProjectName($(this).val());
                                    ctrl.checkValid();
                                },
                                onchange: function() {
                                    $osf.trackClick(options.trackingCategory, options.trackingAction, 'type-project-name');
                                },
                                value : ctrl.newProjectName(),
                                placeholder : 'Enter ' + ctrl.nodeType + ' title'
                            })
                        ]),
                        m('.text-muted.pointer', { onclick : function(){
                            ctrl.showMore(!ctrl.showMore());
                            $osf.trackClick(options.trackingCategory, options.trackingAction, 'show-more-or-less');
                        }},[
                            ctrl.showMore() ? m('i.fa.fa-caret-down', { style: 'width: 10px;'}) : m('i.fa.fa-caret-right', { style: 'width: 10px;'}),
                            ' More'
                        ]),
                        ctrl.showMore() ? [
                            m('.form-group.m-v-sm', [
                                m('label[for="projectDesc].f-w-lg.text-bigger', 'Description'),
                                m('input[type="text"].form-control.noresize', {
                                    onkeyup: function (ev){
                                        ctrl.newProjectDesc($(this).val());
                                    },
                                    onchange: function() {
                                        $osf.trackClick(options.trackingCategory, options.trackingAction, 'type-project-description');
                                    },
                                    value : ctrl.newProjectDesc(),
                                    placeholder : 'Enter ' + ctrl.nodeType + ' description'
                                })
                            ]),
                            ctrl.options.parentID !== null ? [
                                m('.f-w-lg.text-bigger','Category'),
                                m('.category-radio.p-h-md', [
                                    ctrl.options.categoryList.map(function(cat){
                                        return m('.radio', m('label', [  m('input', {
                                            type: 'radio',
                                            name: 'projectCategory',
                                            value: cat.value,
                                            checked: ctrl.newProjectCategory() === cat.value,
                                            onchange : function(event) {
                                                ctrl.newProjectCategory(cat.value);
                                                $osf.trackClick(options.trackingCategory, options.trackingAction, 'select-project-category');
                                            }
                                        }), cat.display_name|| m('i.text-muted', '(Empty category)') ]));

                                    })
                                ])
                            ] : '',
                             ctrl.options.parentID === null ? m('.form-group.m-v-md', [
                                m('label[for="projectTemplate].f-w-lg.text-bigger', 'Template (optional)'),
                                m('p.f-w-xs.help-text', 'Start typing to search your projects. Selecting project as template will duplicate its ' +
                                    'structure in the new project without importing the content of that project.'),
                                m.component(Select2Template, {
                                    value: ctrl.newProjectTemplate,
                                    trackingCategory: options.trackingCategory,
                                    trackingAction: options.trackingAction,
                                    mapTemplates: ctrl.mapTemplates
                                })
                            ]) : ''
                        ] : ''
                    ])
                ]),
                m('.modal-footer', [
                    m('button[type="button"].btn.btn-default[data-dismiss="modal"]', { onclick : function(){
                        ctrl.reset();
                        $osf.trackClick(options.trackingCategory, options.trackingAction, 'click-cancel-button');
                    }},  'Cancel'),
                    ctrl.isValid() ? m('button[type="button"].btn.btn-success', { onclick : function(){
                        ctrl.add();
                        $osf.trackClick(options.trackingCategory, options.trackingAction, 'click-create-button');
                    }},'Create') : m('button[type="button"].btn.btn-success[disabled]','Create')
                ])
            ]),
            processing : m('.modal-content',
                m('.modal-content',
                    m('.modal-header', [
                        m('button.close[data-dismiss="modal"][aria-label="Close"]',{ onclick : ctrl.reset}, [
                            m('span[aria-hidden="true"]','×')
                        ])
                    ]),
                    m('.modal-body.text-left', [
                            m('.add-project-processing', 'Saving your ' + ctrl.nodeType + '...')
                        ]
                    )
                )
            ),
            success : m('.modal-content', [
                m('.modal-content',
                    m('.modal-body.text-left', [
                            m('button.close[data-dismiss="modal"][aria-label="Close"]',{ onclick : function() {
                                ctrl.reset();
                                $osf.trackClick(options.trackingCategory, options.trackingAction, 'click-close-success-modal');
                            }}, [
                                m('span[aria-hidden="true"]','×')
                            ]),
                            m('h4.add-project-success.text-success', 'New ' + ctrl.nodeType + ' created successfully!')
                        ]
                    ),
                    m('.modal-footer', [
                        m('button[type="button"].btn.btn-default[data-dismiss="modal"]', {
                            onclick : function() {
                                ctrl.reset();
                                ctrl.options.stayCallback.call(ctrl); // results are at ctrl.saveResult
                                $osf.trackClick(options.trackingCategory, options.trackingAction, 'keep-working-here');
                            }
                        },  'Keep working here'),
                        m('a.btn.btn-success', {
                            href : ctrl.goToProjectLink(),
                            onclick: function(){
                            $osf.trackClick(options.trackingCategory, options.trackingAction, 'go-to-new-project');
                            }
                        },'Go to new ' + ctrl.nodeType + '')
                    ])
                )
            ]),
            error : m('.modal-content', [
                m('.modal-content',
                    m('.modal-body.text-left', [
                            m('button.close[data-dismiss="modal"][aria-label="Close"]',{ onclick : function() {
                                ctrl.reset();
                                $osf.trackClick(options.trackingCategory, options.trackingAction, 'close-couldn\'t-create-your-project');
                                }}, [
                                m('span[aria-hidden="true"]','×')
                            ]),
                            m('h4.add-project-error.text-danger', 'Couldn\'t create your ' + ctrl.nodeType + ''),
                            m('p', ctrl.errorMessage[ctrl.errorMessageType()])
                        ]
                    ),
                    m('.modal-footer', [
                        m('button[type="button"].btn.btn-default[data-dismiss="modal"]', {onclick: function() {
                            $osf.trackClick(options.trackingCategory, options.trackingAction, 'click-OK-couldn\'t-create-your-project');
                        }},  'OK')
                    ])
                )
            ])
        };

        return  m('span', [
            ctrl.options.buttonTemplate,
            m('#' + ctrl.options.modalID + '.modal.fade[tabindex=-1][role="dialog"][aria-labelledby="addProject"][aria-hidden="true"]',
                m('.modal-dialog.text-left',
                    templates[ctrl.viewState()]
                )
            )
        ]);
    }
};

var Select2Template = {
    view: function(ctrl, options) {
        return m('select', {config: Select2Template.config(options), onchange: function(){
            $osf.trackClick(options.trackingCategory, options.trackingAction, 'select-project-template');
        }}, [
            m('option', {value: ''}, ''),
            options.mapTemplates().map(function(node) {
                var args = {value: node.id};
                return m('option', args, node.title);
            })
        ]);
    },
    /**Select2 config factory - adapted from https://lhorie.github.io/mithril/integration.html **/
    config: function(ctrl) {
        return function(element, isInitialized) {
            var $el = $(element);
            if (!isInitialized) {
                $el.select2({placeholder: 'Select a project to use as a template', allowClear: true, width: '100%'}).on('change', function(e) {
                    var id = $el.select2('val');
                    m.startComputation();
                    //Set the value to the selected option
                    ctrl.mapTemplates().map(function(node){
                        if(node.id === id) {
                            ctrl.value(node.id);
                        }
                    });
                    m.endComputation();
                });
            }
        };
    }
};

module.exports = AddProject;