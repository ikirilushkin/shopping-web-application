/* @ngInject */
function LoginController(authService, $state, toaster) {
    this.user = {
        email: '',
        password: ''
    };
    this.submit = function(form){
        if (form.$valid){
            authService.logIn({
                email: this.user.email,
                password: this.user.password
            }).then(function(){
                $state.go('search');
            }, function(){
                toaster.pop({
                    type: 'error',
                    body: 'Incorrect email or password'
                });
            });
        } else {
            toaster.pop({
                type: 'error',
                body: 'Incorrect email or password'
            });
        }
    };
}
shopApplication.controller('LoginController', LoginController);