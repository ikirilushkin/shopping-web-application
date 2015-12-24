/* @ngInject */
function SignupController(authService, $state, utils, toaster) {
    this.account = {
        email: '',
        password: '',
        passwordConfirm: ''
    };
    this.submit = function(form){
        var self = this;
        if (form.$valid){
            if (this.account.password === this.account.passwordConfirm){
                authService.signIn({
                    email: self.account.email,
                    password: utils.hashCode(self.account.password)
                }).then(function(){
                    $state.go('search')
                });
            } else {
                toaster.pop({
                    type: 'error',
                    body: 'Password fields are not the same'
                });
            }
        } else {
            toaster.pop({
                type: 'error',
                body: 'Form is invalid'
            });
        }
    };
}
shopApplication.controller('SignupController',SignupController);