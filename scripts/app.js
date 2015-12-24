var shopApplication = angular.module('app', [
    'ui.router',
    'LocalStorageModule',
    '720kb.datepicker',
    'toaster',
    'ngAnimate',
    'angularModalService'
])
    .config(config)
    .run(run);

/* @ngInject */
function config($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise("/login");
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "scripts/components/login/login.html",
            controller: LoginController,
            controllerAs: 'login'
        })
        .state('signup', {
            url: "/signup",
            templateUrl: "scripts/components/signup/signup.html",
            controller: SignupController,
            controllerAs: 'signup'
        })
        .state('search', {
            url: "/search",
            templateUrl: "scripts/components/search/search.html",
            controller: SearchController,
            controllerAs: 'search',
            data: {
                role: ['authOnly']
            }
        });
}
/* @ngInject */
function run($rootScope, roleService, authService, cartService){
    $rootScope.auth = authService;
    $rootScope.cart = cartService;
    $rootScope.isRedirect = false;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
        if(toState.data && toState.data.role){
            if (!$rootScope.isRedirect){
                event.preventDefault();
                $rootScope.isRedirect = true;
                roleService.process(toState.data.role, toState, toParams);
            } else {
                $rootScope.isRedirect = false;
            }
        } else {
            $rootScope.isRedirect = false;
        }
    });
}
