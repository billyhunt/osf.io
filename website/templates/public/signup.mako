<%inherit file="base.mako"/>

<%def name="title()">Sign up</%def>

<%def name="content()">


<div class="col-sm-6 col-sm-offset-3 existing-user-signin p-b-md m-b-m">

##         <form
##             id="logInForm"
##             class="form-horizontal"
##             action="${login_url}"
##             method="POST"
##             data-bind="submit: submit"
##         >
##                 <h3 class=${'m-b-lg' if not existing_user else 'm-b-lg m-l-md'}> Login </h3>
##             <div class="form-group">
##                 <label for="inputEmail3" class="col-sm-3 control-label">Email</label>
##                 <div class="col-sm-9">
##                     <input
##                         ${'autofocus' if not sign_up and not existing_user else ''}
##                         type="email"
##                         class="form-control"
##                         data-bind="value: username"
##                         name="username"
##                         id="inputEmail3"
##                         placeholder="Email"
##                     >
##                 </div>
##             </div>
##             <div class="form-group">
##                 <label for="inputPassword3" class="col-sm-3 control-label">Password</label>
##                     <div class="col-sm-9">
##                     <input
##                         ${'autofocus' if existing_user else ''}
##                         type="password"
##                         class="form-control"
##                         id="inputPassword3"
##                         placeholder="Password"
##                         data-bind="value: password"
##                         name="password"
##                     >
##                     </div>
##                 </div>
##             %if existing_user:
##                 <div class="row">
##                     <div class="col-md-3">
##                         <div class="form-group">
##                             <div class="m-l-md checkbox">
##                                 <label><input type="checkbox"> Remember me</label>
##                             </div>
##                         </div>
##                     </div>
##                     <div class="col-md-9">
##                         <div class="form-group existing-user-signin-button">
##                             <button type="submit" class="btn pull-right btn-success ">Sign in</button>
##                         </div>
##                     </div>
##                 </div>
##                 <div class="row m-l-xs">
##                     <a href="/forgotpassword/">Forgot password?</a>
##                 </div>
##             %else:
##             <div class="form-group">
##                 <div class="col-sm-offset-3 col-sm-9">
##                     <div class="checkbox">
##                     <label><input type="checkbox"> Remember me</label>
##                     </div>
##                 </div>
##             </div>
##             <div class="form-group">
##                 <div class="col-sm-offset-3 col-sm-9">
##                     <button type="submit" class="btn btn-success pull-right">Sign in</button>
##                 </div>
##             </div>
##             %endif
##         </form>
##     </div>
##     %if not existing_user:
##         %if sign_up:
##             <div id="signUpScope" class="col-sm-5 toggle-box toggle-box-right toggle-box-active p-h-lg" style="height: auto;">
##         %else:
##             <div id="signUpScope" class="col-sm-5 toggle-box toggle-box-right toggle-box-muted p-h-lg" style="height: auto;">
##         %endif
        <form data-bind="submit: submit" class="form-horizontal">
            <h3 class="m-b-lg"> Create a free account </h3>
                <div
                    class="form-group"
                    data-bind="
                        css: {
                            'has-error': fullName() && !fullName.isValid(),
                            'has-success': fullName() && fullName.isValid()
                        }"
                >
                    <label for="inputName" class="col-sm-4 control-label">Full Name</label>
                    <div class="col-sm-8">
                        <input
                            ${'autofocus' if sign_up else ''}
                            type="text"
                            class="form-control"
                            id="inputName"
                            placeholder="Name"
                            data-bind="
                                value: fullName, disable: submitted(),
                                event: {
                                    blur: trim.bind($data, fullName)
                                }"
                        >
                        <p class="help-block" data-bind="validationMessage: fullName" style="display: none;"></p>
                    </div>
                </div>
            <div
                class="form-group"
                data-bind="
                    css: {
                        'has-error': email1() && !email1.isValid(),
                        'has-success': email1() && email1.isValid()
                    }"
            >
                <label for="inputEmail" class="col-sm-4 control-label">Email</label>
                <div class="col-sm-8">
                    <input
                        type="text"
                        class="form-control"
                        id="inputEmail"
                        placeholder="Email"
                        data-bind="
                            value: email1,
                            disable: submitted(),
                            event: {
                                blur: trim.bind($data, email1)
                            }"
                    >
                    <p class="help-block" data-bind="validationMessage: email1" style="display: none;"></p>
                </div>
            </div>
            <div
                class="form-group"
                data-bind="
                    css: {
                        'has-error': email2() && !email2.isValid(),
                        'has-success': email2() && email2.isValid()
                    }"
            >
                <label for="inputEmail2" class="col-sm-4 control-label">Confirm Email</label>
                <div class="col-sm-8">
                    <input
                        type="text"
                        class="form-control"
                        id="inputEmail2"
                        placeholder="Re-enter email"
                        data-bind="
                            value: email2,
                            disable: submitted(),
                            event: {
                                blur: trim.bind($data, email2)
                            }"
                    >
                    <p class="help-block" data-bind="validationMessage: email2" style="display: none;"></p>
                </div>
            </div>
            <div
                class="form-group"
                data-bind="
                    css: {
                        'has-error': password() && !password.isValid(),
                        'has-success': password() && password.isValid()
                    }"
            >
                <label for="inputPassword3" class="col-sm-4 control-label">Password</label>
                <div class="col-sm-8">
                    <input
                        type="password"
                        class="form-control"
                        id="inputPassword3"
                        placeholder="Password"
                        data-bind="
                            value: password,
                            disable: submitted(),
                            event: {
                                blur: trim.bind($data, password)
                            }"
                    >
                    <p class="help-block" data-bind="validationMessage: password" style="display: none;"></p>
                </div>
            </div>
            <!-- Flashed Messages -->
            <div class="help-block" >
                <p data-bind="html: flashMessage, attr: {class: flashMessageClass}"></p>
            </div>
            <div>
                <p> By clicking "Create account", you agree to our <a href="https://github.com/CenterForOpenScience/centerforopenscience.org/blob/master/TERMS_OF_USE.md">Terms</a> and that you have read our <a href="https://github.com/CenterForOpenScience/centerforopenscience.org/blob/master/PRIVACY_POLICY.md">Privacy Policy</a>, including our information on <a href="https://github.com/CenterForOpenScience/centerforopenscience.org/blob/master/PRIVACY_POLICY.md#f-cookies">Cookie Use</a>.</p>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-4 col-sm-8">
                    <button type="submit" class="btn pull-right btn-success" data-bind="disable: submitted()">Create account</button>
                </div>
            </div>
        </form>
    </div>
    %else:
        <div id="signUpScope"></div>
    %endif
        %if redirect_url:
            <div class="text-center m-b-sm col-sm-12" style="padding-top: 15px"> <a href="${domain}login/?campaign=institution&redirect_url=${redirect_url}">Login through your institution  <i class="fa fa-arrow-right"></i></a></div>
        %else:
            <div class="text-center m-b-sm col-sm-12" style="padding-top: 15px"> <a href="${domain}login/?campaign=institution">Login through your institution  <i class="fa fa-arrow-right"></i></a></div>
        %endif
    %endif
</div>

</%def>

<%def name="javascript_bottom()">
    ${parent.javascript_bottom()}
    <script type="text/javascript">
        window.contextVars = $.extend(true, {}, window.contextVars, {
            'campaign': ${ campaign or '' | sjson, n },
            'institution_redirect': ${ institution_redirect or '' | sjson, n }
        });
    </script>
    <script src=${"/static/public/js/login-page.js" | webpack_asset}></script>
</%def>

<%def name="stylesheets()">
    ${parent.stylesheets()}

    <link rel="stylesheet" href="/static/css/pages/login-page.css">
</%def>
