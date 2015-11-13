<link rel="stylesheet" href='/static/css/pages/remove-contributor-page.css'>
<div id="removeContributor" class="modal fade">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title" data-bind="text:pageTitle"></h3>
            </div>

            <div class="modal-body">

                <!-- remove page -->
                <div data-bind='if:page() === "remove"'>
                        <div class="form-group" data-bind="if:contributorToRemove">
                           <span>Do you want to remove {{contributorToRemove()["fullname"]}} from  <span class="f-w-lg" data-bind="text: title"></span>, or from <span class="f-w-lg" data-bind="text: title"></span> and every project and component underneath it.</span>
                        </div>
                </div><!-- end remove page -->

                <!-- remove page -->
                <div data-bind='if:page() === "removeAll"'>
                        <div class="form-group" data-bind="if:contributorToRemove">
                            Word Up
                           <span>Do you want to remove {{contributorToRemove()["fullname"]}} from  <span class="f-w-lg" data-bind="text: title"></span>, or from <span class="f-w-lg" data-bind="text: title"></span> and every project and component underneath it.</span>
                        </div>
                </div><!-- end invite user page -->

            </div><!-- end modal-body -->

            <div class="modal-footer">
                    <span data-bind="if: page() === 'remove'">
                    <div>
                        <div class="row">
                        <div id="remove-page-radio-buttons" data-bind="if:contributorToRemove" class="col-md-8" align="left">
                            <div class="radio" data-bind="visible:nodeHasChildren">
                                <label><input type="radio" name="radioBoxGroup" data-bind="checked:deleteAll, checkedValue: false" checked>Remove  <span class="f-w-lg" >{{contributorToRemove()["fullname"]}}</span> from  <span class="f-w-lg" data-bind="text: title"></span></label>
                            </div>
                            <div class="radio" data-bind="visible:nodeHasChildren">
                                <label><input  type="radio" name="radioBoxGroup" data-bind="checked: deleteAll, checkedValue: true" >Remove <span class="f-w-lg" >{{contributorToRemove()["fullname"]}}</span> from <span class="f-w-lg" data-bind="text: title"></span> and everything underneath it</label>
                            </div>
                        </div>
                            <div  class="col-md-4 remove-page-buttons">
                                <a href="#" class="btn btn-default" data-bind="click: clear" data-dismiss="modal">Cancel</a>
                                <a class="btn btn-danger" data-bind="click:deleteOneNode, visible: !deleteAll()">
                                    <i class="fa fa-trash-o fa-lg"></i> Remove
                                </a>
                                <a class="btn btn-danger" data-bind="click:deleteAllNodes, visible: deleteAll">
                                    <i class="fa fa-trash-o fa-lg"></i> Remove
                                </a>
                            </div>
                    </div>
                    </div>
                </span>
                </div>

            </div><!-- end modal-footer -->
        </div><!-- end modal-content -->
</div><!-- end modal -->

