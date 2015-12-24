
config.$inject = ["$urlRouterProvider", "$stateProvider"];
run.$inject = ["$rootScope", "roleService", "authService", "cartService"];var shopApplication = angular.module('app', [
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
;/* @ngInject */
HeaderController.$inject = ["ModalService", "cartService"];
function HeaderController(ModalService, cartService){
    ModalController.$inject = ["close", "cart"];
    this.showAModal = function() {
        ModalService.showModal({
            templateUrl: "modal.html",
            controller: ModalController,
            controllerAs: 'ctrl',
            inputs: {
                cart: cartService.cart
            }
        }).then(function(modal) {
            modal.close.then(function(result) {});
        });
    };
    /* @ngInject */
    function ModalController(close, cart){
        this.cart = cart;
        this.close = function(){
            close();
        }
    }
}
shopApplication.controller('HeaderController', HeaderController);;/* @ngInject */
function headerDirective(){
    return {
        restrict: 'E',
        bindToController: true,
        controllerAs: 'header',
        controller: HeaderController,
        templateUrl: 'scripts/components/header/header.html'
    };
}
shopApplication.directive('header', headerDirective);;/* @ngInject */
LoginController.$inject = ["authService", "$state", "toaster"];
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
shopApplication.controller('LoginController', LoginController);;/* @ngInject */
function ratingDirective(){
    return {
        restrict: 'E',
        scope: {
            rateValue: '@'
        },
        bindToController: true,
        controllerAs: 'ratingView',
        controller: function () {
            this.rateList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        },
        templateUrl: 'scripts/components/rating/rating.html'
    };
}
shopApplication.directive('rating', ratingDirective);;/* @ngInject */
SignupController.$inject = ["authService", "$state", "utils", "toaster"];
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
shopApplication.controller('SignupController',SignupController);;/* @ngInject */
SearchController.$inject = ["itemsService", "cartService"];
function SearchController(itemsService, cartService){
    this.filter = {
        inStock: false,
        color: "",
        price : {
            min: "",
            max: ""
        },
        dates : {
            minDate : moment().startOf('year').format("MM.DD.YYYY"),
            maxDate: moment().format("MM.DD.YYYY")
        }
    };
    this.colors = ['Red', 'White', 'Black', 'Blue', 'Yellow', 'Green'];
    var self = this;
    itemsService.getItems().then(function(res){
        self.items = res;
    });
    this.isInStockFilter = function(item){
        if (self.filter.inStock && !item.inStock){
            return;
        }
        return item;
    };
    this.colorFilter = function(item){
        if (self.filter.color && item.color !== self.filter.color.toLocaleLowerCase()){
            return;
        }
        return item;
    };
    this.addToCart = function(index){
        cartService.addToCart(this.items[index]);
    }
}
shopApplication.controller('SearchController', SearchController);;/* @ngInject */
utils.$inject = ["$http"];
function utils($http){
    function loadJSON(url) {
        return $http.get(url)
            .then(function(response){
                return response.data;
            }, function(data){
                console.log(data);
            });
    }
    function hashCode(str){
        var hash = 0, i, chr, len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }
    return {
        loadJSON: loadJSON,
        hashCode: hashCode
    }
}
shopApplication
    .factory('utils', utils);;/* @ngInject */
function dateRangeFilter(){
    return function(items, startDate, endDate)
    {
        var result = [];
        var startDate = startDate ? moment(startDate, "MM.DD.YYYY").valueOf() : 0;
        var endDate = endDate ? moment(endDate, "MM.DD.YYYY").valueOf() : moment().valueOf();


        if (items && items.length > 0)
        {
            items.forEach(function (item)
            {
                var itemDate =  moment(item.issueDate, "MM.DD.YYYY").valueOf();

                if (itemDate >= startDate && itemDate <= endDate)
                {
                    result.push(item);
                }
            });

            return result;
        }
    };
}
/* @ngInject */
function sumRangeFilter(){
    return function(items, min, max)
    {
        var result = [];

        var min = min ? parseFloat(min) : 0;
        var max = max ? parseFloat(max) : Number.POSITIVE_INFINITY;


        if (items && items.length > 0)
        {
            items.forEach(function (item)
            {
                var price = item.price;
                if (min <= price && max >= price){
                    result.push(item);
                }
            });
            return result;
        }

    };
}
shopApplication
    .filter('dateRange', dateRangeFilter)
    .filter('sumRange', sumRangeFilter);;/* @ngInject */
RoleService.$inject = ["$q", "$state", "authService"];
AuthService.$inject = ["localStorageService", "$q", "utils"];
ItemsService.$inject = ["$q", "utils"];
function RoleService($q, $state, authService){
    this.roles = {
        authOnly: function(){
            var deferred = $q.defer();
            if (authService.isLoggedIn()){
                deferred.resolve();
            } else {
                deferred.reject('login');
            }
            return deferred.promise;
        }
    };
    this.process = function(roles, toState, toParams) {
        var promises = [],
            self = this;
        roles.forEach(function(role){
            var promise = self.roles[role]();
            promises.push(promise);
        });
        $q.all(promises).then(function(){
            $state.go(toState, toParams)
        }, function(redirect){
            $state.go(redirect, {}, {reload: true});
        });
    }
}
/* @ngInject */
function AuthService(localStorageService, $q, utils){
    this.user = null;
    this.isLoggedIn = function(){
        return this.user;
    };
    this.logIn = function(user){
        var deferred = $q.defer(),
            stored = null,
            self = this;
        if (!user){
            deferred.reject();
        }
        stored = JSON.parse(localStorageService.get('user'));
        if (!stored){
            deferred.reject();
        } else {
            if (user.email === stored.email && utils.hashCode(user.password) === stored.password){
                self.user = stored;
                deferred.resolve(self.user);
            } else {
                deferred.reject();
            }
        }
        return deferred.promise;
    };
    this.signIn = function(user){
        var deferred = $q.defer();
        if (!user){
            deferred.reject();
        }
        this.user = user;
        localStorageService.set('user', JSON.stringify(user));
        deferred.resolve();
        return deferred.promise;
    }
}
/* @ngInject */
function ItemsService($q, utils){
    var url = 'items.json';
    this.items = null;
    this.getItems = function(){
        var deferred = $q.defer();
        if (this.items){
            deferred.resolve(this.items);
        } else {
            utils.loadJSON(url).then(function(response){
                this.items = response;
                deferred.resolve(response);
            }, function(){
                deferred.reject();
            })
        }
        return deferred.promise;
    };
}
/* @ngInject */
function CartService(){
    this.cart = [];
    this.addToCart = function(item){
        var index = this.cart.map(function(element){
            return element.id;
        }).indexOf(item.id);
        if (index > -1){
            this.cart[index].count += 1;
        } else{
            this.cart.push({
                id: item.id,
                name: item.name,
                count: 1
            })
        }
    };
    this.itemsCount = function () {
        var count = 0;
        this.cart.forEach(function(element){
            count += element.count;
        });
        return count;
    }
}
shopApplication
    .service('roleService', RoleService)
    .service('authService', AuthService)
    .service('itemsService', ItemsService)
    .service('cartService', CartService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImhlYWRlci9IZWFkZXJDb250cm9sbGVyLmpzIiwiaGVhZGVyL2hlYWRlckRpcmVjdGl2ZS5qcyIsImxvZ2luL0xvZ2luQ29udHJvbGxlci5qcyIsInJhdGluZy9yYXRpbmdEaXJlY3RpdmUuanMiLCJzaWdudXAvU2lnbnVwQ29udHJvbGxlci5qcyIsInNlYXJjaC9TZWFyY2hDb250cm9sbGVyLmpzIiwiZmFjdG9yaWVzLmpzIiwiZmlsdGVycy5qcyIsInNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0MxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY29uZmlnLiRpbmplY3QgPSBbXCIkdXJsUm91dGVyUHJvdmlkZXJcIiwgXCIkc3RhdGVQcm92aWRlclwiXTtcclxucnVuLiRpbmplY3QgPSBbXCIkcm9vdFNjb3BlXCIsIFwicm9sZVNlcnZpY2VcIiwgXCJhdXRoU2VydmljZVwiLCBcImNhcnRTZXJ2aWNlXCJdO3ZhciBzaG9wQXBwbGljYXRpb24gPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xyXG4gICAgJ3VpLnJvdXRlcicsXHJcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcclxuICAgICc3MjBrYi5kYXRlcGlja2VyJyxcclxuICAgICd0b2FzdGVyJyxcclxuICAgICduZ0FuaW1hdGUnLFxyXG4gICAgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnXHJcbl0pXHJcbiAgICAuY29uZmlnKGNvbmZpZylcclxuICAgIC5ydW4ocnVuKTtcclxuXHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBjb25maWcoJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcil7XHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2xvZ2luXCIpO1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2xvZ2luJywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInNjcmlwdHMvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IExvZ2luQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnbG9naW4nXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9zaWdudXBcIixcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwic2NyaXB0cy9jb21wb25lbnRzL3NpZ251cC9zaWdudXAuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBTaWdudXBDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzaWdudXAnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ3NlYXJjaCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9zZWFyY2hcIixcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwic2NyaXB0cy9jb21wb25lbnRzL3NlYXJjaC9zZWFyY2guaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBTZWFyY2hDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzZWFyY2gnLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICByb2xlOiBbJ2F1dGhPbmx5J11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgcm9sZVNlcnZpY2UsIGF1dGhTZXJ2aWNlLCBjYXJ0U2VydmljZSl7XHJcbiAgICAkcm9vdFNjb3BlLmF1dGggPSBhdXRoU2VydmljZTtcclxuICAgICRyb290U2NvcGUuY2FydCA9IGNhcnRTZXJ2aWNlO1xyXG4gICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gZmFsc2U7XHJcbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcclxuICAgICAgICBpZih0b1N0YXRlLmRhdGEgJiYgdG9TdGF0ZS5kYXRhLnJvbGUpe1xyXG4gICAgICAgICAgICBpZiAoISRyb290U2NvcGUuaXNSZWRpcmVjdCl7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJvbGVTZXJ2aWNlLnByb2Nlc3ModG9TdGF0ZS5kYXRhLnJvbGUsIHRvU3RhdGUsIHRvUGFyYW1zKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNSZWRpcmVjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuIiwiLyogQG5nSW5qZWN0ICovXHJcbkhlYWRlckNvbnRyb2xsZXIuJGluamVjdCA9IFtcIk1vZGFsU2VydmljZVwiLCBcImNhcnRTZXJ2aWNlXCJdO1xyXG5mdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKE1vZGFsU2VydmljZSwgY2FydFNlcnZpY2Upe1xyXG4gICAgTW9kYWxDb250cm9sbGVyLiRpbmplY3QgPSBbXCJjbG9zZVwiLCBcImNhcnRcIl07XHJcbiAgICB0aGlzLnNob3dBTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwibW9kYWwuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBNb2RhbENvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxyXG4gICAgICAgICAgICBpbnB1dHM6IHtcclxuICAgICAgICAgICAgICAgIGNhcnQ6IGNhcnRTZXJ2aWNlLmNhcnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24obW9kYWwpIHtcclxuICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHt9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICAvKiBAbmdJbmplY3QgKi9cclxuICAgIGZ1bmN0aW9uIE1vZGFsQ29udHJvbGxlcihjbG9zZSwgY2FydCl7XHJcbiAgICAgICAgdGhpcy5jYXJ0ID0gY2FydDtcclxuICAgICAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gaGVhZGVyRGlyZWN0aXZlKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdoZWFkZXInLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IEhlYWRlckNvbnRyb2xsZXIsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzY3JpcHRzL2NvbXBvbmVudHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uZGlyZWN0aXZlKCdoZWFkZXInLCBoZWFkZXJEaXJlY3RpdmUpOyIsIi8qIEBuZ0luamVjdCAqL1xyXG5Mb2dpbkNvbnRyb2xsZXIuJGluamVjdCA9IFtcImF1dGhTZXJ2aWNlXCIsIFwiJHN0YXRlXCIsIFwidG9hc3RlclwiXTtcclxuZnVuY3Rpb24gTG9naW5Db250cm9sbGVyKGF1dGhTZXJ2aWNlLCAkc3RhdGUsIHRvYXN0ZXIpIHtcclxuICAgIHRoaXMudXNlciA9IHtcclxuICAgICAgICBlbWFpbDogJycsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcnXHJcbiAgICB9O1xyXG4gICAgdGhpcy5zdWJtaXQgPSBmdW5jdGlvbihmb3JtKXtcclxuICAgICAgICBpZiAoZm9ybS4kdmFsaWQpe1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5sb2dJbih7XHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy51c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMudXNlci5wYXNzd29yZFxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3NlYXJjaCcpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdG9hc3Rlci5wb3Aoe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogJ0luY29ycmVjdCBlbWFpbCBvciBwYXNzd29yZCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b2FzdGVyLnBvcCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgYm9keTogJ0luY29ycmVjdCBlbWFpbCBvciBwYXNzd29yZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgTG9naW5Db250cm9sbGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gcmF0aW5nRGlyZWN0aXZlKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgcmF0ZVZhbHVlOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAncmF0aW5nVmlldycsXHJcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJhdGVMaXN0ID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2NyaXB0cy9jb21wb25lbnRzL3JhdGluZy9yYXRpbmcuaHRtbCdcclxuICAgIH07XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uLmRpcmVjdGl2ZSgncmF0aW5nJywgcmF0aW5nRGlyZWN0aXZlKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuU2lnbnVwQ29udHJvbGxlci4kaW5qZWN0ID0gW1wiYXV0aFNlcnZpY2VcIiwgXCIkc3RhdGVcIiwgXCJ1dGlsc1wiLCBcInRvYXN0ZXJcIl07XHJcbmZ1bmN0aW9uIFNpZ251cENvbnRyb2xsZXIoYXV0aFNlcnZpY2UsICRzdGF0ZSwgdXRpbHMsIHRvYXN0ZXIpIHtcclxuICAgIHRoaXMuYWNjb3VudCA9IHtcclxuICAgICAgICBlbWFpbDogJycsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcnLFxyXG4gICAgICAgIHBhc3N3b3JkQ29uZmlybTogJydcclxuICAgIH07XHJcbiAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pe1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpZiAoZm9ybS4kdmFsaWQpe1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hY2NvdW50LnBhc3N3b3JkID09PSB0aGlzLmFjY291bnQucGFzc3dvcmRDb25maXJtKXtcclxuICAgICAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHNlbGYuYWNjb3VudC5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdXRpbHMuaGFzaENvZGUoc2VsZi5hY2NvdW50LnBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc2VhcmNoJylcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9hc3Rlci5wb3Aoe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogJ1Bhc3N3b3JkIGZpZWxkcyBhcmUgbm90IHRoZSBzYW1lJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b2FzdGVyLnBvcCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgYm9keTogJ0Zvcm0gaXMgaW52YWxpZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uY29udHJvbGxlcignU2lnbnVwQ29udHJvbGxlcicsU2lnbnVwQ29udHJvbGxlcik7IiwiLyogQG5nSW5qZWN0ICovXHJcblNlYXJjaENvbnRyb2xsZXIuJGluamVjdCA9IFtcIml0ZW1zU2VydmljZVwiLCBcImNhcnRTZXJ2aWNlXCJdO1xyXG5mdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKGl0ZW1zU2VydmljZSwgY2FydFNlcnZpY2Upe1xyXG4gICAgdGhpcy5maWx0ZXIgPSB7XHJcbiAgICAgICAgaW5TdG9jazogZmFsc2UsXHJcbiAgICAgICAgY29sb3I6IFwiXCIsXHJcbiAgICAgICAgcHJpY2UgOiB7XHJcbiAgICAgICAgICAgIG1pbjogXCJcIixcclxuICAgICAgICAgICAgbWF4OiBcIlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRlcyA6IHtcclxuICAgICAgICAgICAgbWluRGF0ZSA6IG1vbWVudCgpLnN0YXJ0T2YoJ3llYXInKS5mb3JtYXQoXCJNTS5ERC5ZWVlZXCIpLFxyXG4gICAgICAgICAgICBtYXhEYXRlOiBtb21lbnQoKS5mb3JtYXQoXCJNTS5ERC5ZWVlZXCIpXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMuY29sb3JzID0gWydSZWQnLCAnV2hpdGUnLCAnQmxhY2snLCAnQmx1ZScsICdZZWxsb3cnLCAnR3JlZW4nXTtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGl0ZW1zU2VydmljZS5nZXRJdGVtcygpLnRoZW4oZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICBzZWxmLml0ZW1zID0gcmVzO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmlzSW5TdG9ja0ZpbHRlciA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgIGlmIChzZWxmLmZpbHRlci5pblN0b2NrICYmICFpdGVtLmluU3RvY2spe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfTtcclxuICAgIHRoaXMuY29sb3JGaWx0ZXIgPSBmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICBpZiAoc2VsZi5maWx0ZXIuY29sb3IgJiYgaXRlbS5jb2xvciAhPT0gc2VsZi5maWx0ZXIuY29sb3IudG9Mb2NhbGVMb3dlckNhc2UoKSl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICB9O1xyXG4gICAgdGhpcy5hZGRUb0NhcnQgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgY2FydFNlcnZpY2UuYWRkVG9DYXJ0KHRoaXMuaXRlbXNbaW5kZXhdKTtcclxuICAgIH1cclxufVxyXG5zaG9wQXBwbGljYXRpb24uY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFNlYXJjaENvbnRyb2xsZXIpOyIsIi8qIEBuZ0luamVjdCAqL1xyXG51dGlscy4kaW5qZWN0ID0gW1wiJGh0dHBcIl07XHJcbmZ1bmN0aW9uIHV0aWxzKCRodHRwKXtcclxuICAgIGZ1bmN0aW9uIGxvYWRKU09OKHVybCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQodXJsKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBoYXNoQ29kZShzdHIpe1xyXG4gICAgICAgIHZhciBoYXNoID0gMCwgaSwgY2hyLCBsZW47XHJcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPT09IDApIHJldHVybiBoYXNoO1xyXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBjaHIgICA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hyO1xyXG4gICAgICAgICAgICBoYXNoIHw9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYXNoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsb2FkSlNPTjogbG9hZEpTT04sXHJcbiAgICAgICAgaGFzaENvZGU6IGhhc2hDb2RlXHJcbiAgICB9XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uXHJcbiAgICAuZmFjdG9yeSgndXRpbHMnLCB1dGlscyk7IiwiLyogQG5nSW5qZWN0ICovXHJcbmZ1bmN0aW9uIGRhdGVSYW5nZUZpbHRlcigpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zLCBzdGFydERhdGUsIGVuZERhdGUpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBzdGFydERhdGUgPSBzdGFydERhdGUgPyBtb21lbnQoc3RhcnREYXRlLCBcIk1NLkRELllZWVlcIikudmFsdWVPZigpIDogMDtcclxuICAgICAgICB2YXIgZW5kRGF0ZSA9IGVuZERhdGUgPyBtb21lbnQoZW5kRGF0ZSwgXCJNTS5ERC5ZWVlZXCIpLnZhbHVlT2YoKSA6IG1vbWVudCgpLnZhbHVlT2YoKTtcclxuXHJcblxyXG4gICAgICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1EYXRlID0gIG1vbWVudChpdGVtLmlzc3VlRGF0ZSwgXCJNTS5ERC5ZWVlZXCIpLnZhbHVlT2YoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbURhdGUgPj0gc3RhcnREYXRlICYmIGl0ZW1EYXRlIDw9IGVuZERhdGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBzdW1SYW5nZUZpbHRlcigpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zLCBtaW4sIG1heClcclxuICAgIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgIHZhciBtaW4gPSBtaW4gPyBwYXJzZUZsb2F0KG1pbikgOiAwO1xyXG4gICAgICAgIHZhciBtYXggPSBtYXggPyBwYXJzZUZsb2F0KG1heCkgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcblxyXG5cclxuICAgICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IGl0ZW0ucHJpY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAobWluIDw9IHByaWNlICYmIG1heCA+PSBwcmljZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59XHJcbnNob3BBcHBsaWNhdGlvblxyXG4gICAgLmZpbHRlcignZGF0ZVJhbmdlJywgZGF0ZVJhbmdlRmlsdGVyKVxyXG4gICAgLmZpbHRlcignc3VtUmFuZ2UnLCBzdW1SYW5nZUZpbHRlcik7IiwiLyogQG5nSW5qZWN0ICovXHJcblJvbGVTZXJ2aWNlLiRpbmplY3QgPSBbXCIkcVwiLCBcIiRzdGF0ZVwiLCBcImF1dGhTZXJ2aWNlXCJdO1xyXG5BdXRoU2VydmljZS4kaW5qZWN0ID0gW1wibG9jYWxTdG9yYWdlU2VydmljZVwiLCBcIiRxXCIsIFwidXRpbHNcIl07XHJcbkl0ZW1zU2VydmljZS4kaW5qZWN0ID0gW1wiJHFcIiwgXCJ1dGlsc1wiXTtcclxuZnVuY3Rpb24gUm9sZVNlcnZpY2UoJHEsICRzdGF0ZSwgYXV0aFNlcnZpY2Upe1xyXG4gICAgdGhpcy5yb2xlcyA9IHtcclxuICAgICAgICBhdXRoT25seTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKGF1dGhTZXJ2aWNlLmlzTG9nZ2VkSW4oKSl7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2xvZ2luJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMucHJvY2VzcyA9IGZ1bmN0aW9uKHJvbGVzLCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG4gICAgICAgIHZhciBwcm9taXNlcyA9IFtdLFxyXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcclxuICAgICAgICByb2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHJvbGUpe1xyXG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IHNlbGYucm9sZXNbcm9sZV0oKTtcclxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkcS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUsIHRvUGFyYW1zKVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlZGlyZWN0KXtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKHJlZGlyZWN0LCB7fSwge3JlbG9hZDogdHJ1ZX0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBBdXRoU2VydmljZShsb2NhbFN0b3JhZ2VTZXJ2aWNlLCAkcSwgdXRpbHMpe1xyXG4gICAgdGhpcy51c2VyID0gbnVsbDtcclxuICAgIHRoaXMuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlcjtcclxuICAgIH07XHJcbiAgICB0aGlzLmxvZ0luID0gZnVuY3Rpb24odXNlcil7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgc3RvcmVkID0gbnVsbCxcclxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF1c2VyKXtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0b3JlZCA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ3VzZXInKSk7XHJcbiAgICAgICAgaWYgKCFzdG9yZWQpe1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodXNlci5lbWFpbCA9PT0gc3RvcmVkLmVtYWlsICYmIHV0aWxzLmhhc2hDb2RlKHVzZXIucGFzc3dvcmQpID09PSBzdG9yZWQucGFzc3dvcmQpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi51c2VyID0gc3RvcmVkO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzZWxmLnVzZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5zaWduSW4gPSBmdW5jdGlvbih1c2VyKXtcclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIGlmICghdXNlcil7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KCd1c2VyJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxufVxyXG4vKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gSXRlbXNTZXJ2aWNlKCRxLCB1dGlscyl7XHJcbiAgICB2YXIgdXJsID0gJ2l0ZW1zLmpzb24nO1xyXG4gICAgdGhpcy5pdGVtcyA9IG51bGw7XHJcbiAgICB0aGlzLmdldEl0ZW1zID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIGlmICh0aGlzLml0ZW1zKXtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLml0ZW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1dGlscy5sb2FkSlNPTih1cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9O1xyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBDYXJ0U2VydmljZSgpe1xyXG4gICAgdGhpcy5jYXJ0ID0gW107XHJcbiAgICB0aGlzLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuY2FydC5tYXAoZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmlkO1xyXG4gICAgICAgIH0pLmluZGV4T2YoaXRlbS5pZCk7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpe1xyXG4gICAgICAgICAgICB0aGlzLmNhcnRbaW5kZXhdLmNvdW50ICs9IDE7XHJcbiAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLmNhcnQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGNvdW50OiAxXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMuaXRlbXNDb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuY2FydC5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpe1xyXG4gICAgICAgICAgICBjb3VudCArPSBlbGVtZW50LmNvdW50O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBjb3VudDtcclxuICAgIH1cclxufVxyXG5zaG9wQXBwbGljYXRpb25cclxuICAgIC5zZXJ2aWNlKCdyb2xlU2VydmljZScsIFJvbGVTZXJ2aWNlKVxyXG4gICAgLnNlcnZpY2UoJ2F1dGhTZXJ2aWNlJywgQXV0aFNlcnZpY2UpXHJcbiAgICAuc2VydmljZSgnaXRlbXNTZXJ2aWNlJywgSXRlbXNTZXJ2aWNlKVxyXG4gICAgLnNlcnZpY2UoJ2NhcnRTZXJ2aWNlJywgQ2FydFNlcnZpY2UpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
