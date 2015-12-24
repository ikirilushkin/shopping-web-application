
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
        if (self.filter.color && item.color.toLocaleLowerCase() !== self.filter.color.toLocaleLowerCase()){
            return;
        }
        return item;
    };
    this.addToCart = function(index){
        cartService.addToCart(this.items[index]);
    }
}
shopApplication.controller('SearchController', SearchController);;/* @ngInject */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImhlYWRlci9IZWFkZXJDb250cm9sbGVyLmpzIiwiaGVhZGVyL2hlYWRlckRpcmVjdGl2ZS5qcyIsImxvZ2luL0xvZ2luQ29udHJvbGxlci5qcyIsInJhdGluZy9yYXRpbmdEaXJlY3RpdmUuanMiLCJzZWFyY2gvU2VhcmNoQ29udHJvbGxlci5qcyIsInNpZ251cC9TaWdudXBDb250cm9sbGVyLmpzIiwiZmFjdG9yaWVzLmpzIiwiZmlsdGVycy5qcyIsInNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0MxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY29uZmlnLiRpbmplY3QgPSBbXCIkdXJsUm91dGVyUHJvdmlkZXJcIiwgXCIkc3RhdGVQcm92aWRlclwiXTtcclxucnVuLiRpbmplY3QgPSBbXCIkcm9vdFNjb3BlXCIsIFwicm9sZVNlcnZpY2VcIiwgXCJhdXRoU2VydmljZVwiLCBcImNhcnRTZXJ2aWNlXCJdO3ZhciBzaG9wQXBwbGljYXRpb24gPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xyXG4gICAgJ3VpLnJvdXRlcicsXHJcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcclxuICAgICc3MjBrYi5kYXRlcGlja2VyJyxcclxuICAgICd0b2FzdGVyJyxcclxuICAgICduZ0FuaW1hdGUnLFxyXG4gICAgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnXHJcbl0pXHJcbiAgICAuY29uZmlnKGNvbmZpZylcclxuICAgIC5ydW4ocnVuKTtcclxuXHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBjb25maWcoJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcil7XHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2xvZ2luXCIpO1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2xvZ2luJywge1xyXG4gICAgICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInNjcmlwdHMvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IExvZ2luQ29udHJvbGxlcixcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnbG9naW4nXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9zaWdudXBcIixcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwic2NyaXB0cy9jb21wb25lbnRzL3NpZ251cC9zaWdudXAuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBTaWdudXBDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzaWdudXAnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ3NlYXJjaCcsIHtcclxuICAgICAgICAgICAgdXJsOiBcIi9zZWFyY2hcIixcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwic2NyaXB0cy9jb21wb25lbnRzL3NlYXJjaC9zZWFyY2guaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBTZWFyY2hDb250cm9sbGVyLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdzZWFyY2gnLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICByb2xlOiBbJ2F1dGhPbmx5J11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBydW4oJHJvb3RTY29wZSwgcm9sZVNlcnZpY2UsIGF1dGhTZXJ2aWNlLCBjYXJ0U2VydmljZSl7XHJcbiAgICAkcm9vdFNjb3BlLmF1dGggPSBhdXRoU2VydmljZTtcclxuICAgICRyb290U2NvcGUuY2FydCA9IGNhcnRTZXJ2aWNlO1xyXG4gICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gZmFsc2U7XHJcbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcclxuICAgICAgICBpZih0b1N0YXRlLmRhdGEgJiYgdG9TdGF0ZS5kYXRhLnJvbGUpe1xyXG4gICAgICAgICAgICBpZiAoISRyb290U2NvcGUuaXNSZWRpcmVjdCl7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJvbGVTZXJ2aWNlLnByb2Nlc3ModG9TdGF0ZS5kYXRhLnJvbGUsIHRvU3RhdGUsIHRvUGFyYW1zKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNSZWRpcmVjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5pc1JlZGlyZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuIiwiLyogQG5nSW5qZWN0ICovXHJcbkhlYWRlckNvbnRyb2xsZXIuJGluamVjdCA9IFtcIk1vZGFsU2VydmljZVwiLCBcImNhcnRTZXJ2aWNlXCJdO1xyXG5mdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKE1vZGFsU2VydmljZSwgY2FydFNlcnZpY2Upe1xyXG4gICAgTW9kYWxDb250cm9sbGVyLiRpbmplY3QgPSBbXCJjbG9zZVwiLCBcImNhcnRcIl07XHJcbiAgICB0aGlzLnNob3dBTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwibW9kYWwuaHRtbFwiLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiBNb2RhbENvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxyXG4gICAgICAgICAgICBpbnB1dHM6IHtcclxuICAgICAgICAgICAgICAgIGNhcnQ6IGNhcnRTZXJ2aWNlLmNhcnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24obW9kYWwpIHtcclxuICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHt9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICAvKiBAbmdJbmplY3QgKi9cclxuICAgIGZ1bmN0aW9uIE1vZGFsQ29udHJvbGxlcihjbG9zZSwgY2FydCl7XHJcbiAgICAgICAgdGhpcy5jYXJ0ID0gY2FydDtcclxuICAgICAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBIZWFkZXJDb250cm9sbGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gaGVhZGVyRGlyZWN0aXZlKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICdoZWFkZXInLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IEhlYWRlckNvbnRyb2xsZXIsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzY3JpcHRzL2NvbXBvbmVudHMvaGVhZGVyL2hlYWRlci5odG1sJ1xyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uZGlyZWN0aXZlKCdoZWFkZXInLCBoZWFkZXJEaXJlY3RpdmUpOyIsIi8qIEBuZ0luamVjdCAqL1xyXG5Mb2dpbkNvbnRyb2xsZXIuJGluamVjdCA9IFtcImF1dGhTZXJ2aWNlXCIsIFwiJHN0YXRlXCIsIFwidG9hc3RlclwiXTtcclxuZnVuY3Rpb24gTG9naW5Db250cm9sbGVyKGF1dGhTZXJ2aWNlLCAkc3RhdGUsIHRvYXN0ZXIpIHtcclxuICAgIHRoaXMudXNlciA9IHtcclxuICAgICAgICBlbWFpbDogJycsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcnXHJcbiAgICB9O1xyXG4gICAgdGhpcy5zdWJtaXQgPSBmdW5jdGlvbihmb3JtKXtcclxuICAgICAgICBpZiAoZm9ybS4kdmFsaWQpe1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5sb2dJbih7XHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy51c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMudXNlci5wYXNzd29yZFxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3NlYXJjaCcpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdG9hc3Rlci5wb3Aoe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogJ0luY29ycmVjdCBlbWFpbCBvciBwYXNzd29yZCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b2FzdGVyLnBvcCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgYm9keTogJ0luY29ycmVjdCBlbWFpbCBvciBwYXNzd29yZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgTG9naW5Db250cm9sbGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gcmF0aW5nRGlyZWN0aXZlKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgcmF0ZVZhbHVlOiAnQCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAncmF0aW5nVmlldycsXHJcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJhdGVMaXN0ID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2NyaXB0cy9jb21wb25lbnRzL3JhdGluZy9yYXRpbmcuaHRtbCdcclxuICAgIH07XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uLmRpcmVjdGl2ZSgncmF0aW5nJywgcmF0aW5nRGlyZWN0aXZlKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuU2VhcmNoQ29udHJvbGxlci4kaW5qZWN0ID0gW1wiaXRlbXNTZXJ2aWNlXCIsIFwiY2FydFNlcnZpY2VcIl07XHJcbmZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoaXRlbXNTZXJ2aWNlLCBjYXJ0U2VydmljZSl7XHJcbiAgICB0aGlzLmZpbHRlciA9IHtcclxuICAgICAgICBpblN0b2NrOiBmYWxzZSxcclxuICAgICAgICBjb2xvcjogXCJcIixcclxuICAgICAgICBwcmljZSA6IHtcclxuICAgICAgICAgICAgbWluOiBcIlwiLFxyXG4gICAgICAgICAgICBtYXg6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGVzIDoge1xyXG4gICAgICAgICAgICBtaW5EYXRlIDogbW9tZW50KCkuc3RhcnRPZigneWVhcicpLmZvcm1hdChcIk1NLkRELllZWVlcIiksXHJcbiAgICAgICAgICAgIG1heERhdGU6IG1vbWVudCgpLmZvcm1hdChcIk1NLkRELllZWVlcIilcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5jb2xvcnMgPSBbJ1JlZCcsICdXaGl0ZScsICdCbGFjaycsICdCbHVlJywgJ1llbGxvdycsICdHcmVlbiddO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgaXRlbXNTZXJ2aWNlLmdldEl0ZW1zKCkudGhlbihmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgIHNlbGYuaXRlbXMgPSByZXM7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaXNJblN0b2NrRmlsdGVyID0gZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgaWYgKHNlbGYuZmlsdGVyLmluU3RvY2sgJiYgIWl0ZW0uaW5TdG9jayl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICB9O1xyXG4gICAgdGhpcy5jb2xvckZpbHRlciA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgIGlmIChzZWxmLmZpbHRlci5jb2xvciAmJiBpdGVtLmNvbG9yLnRvTG9jYWxlTG93ZXJDYXNlKCkgIT09IHNlbGYuZmlsdGVyLmNvbG9yLnRvTG9jYWxlTG93ZXJDYXNlKCkpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfTtcclxuICAgIHRoaXMuYWRkVG9DYXJ0ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIGNhcnRTZXJ2aWNlLmFkZFRvQ2FydCh0aGlzLml0ZW1zW2luZGV4XSk7XHJcbiAgICB9XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBTZWFyY2hDb250cm9sbGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuU2lnbnVwQ29udHJvbGxlci4kaW5qZWN0ID0gW1wiYXV0aFNlcnZpY2VcIiwgXCIkc3RhdGVcIiwgXCJ1dGlsc1wiLCBcInRvYXN0ZXJcIl07XHJcbmZ1bmN0aW9uIFNpZ251cENvbnRyb2xsZXIoYXV0aFNlcnZpY2UsICRzdGF0ZSwgdXRpbHMsIHRvYXN0ZXIpIHtcclxuICAgIHRoaXMuYWNjb3VudCA9IHtcclxuICAgICAgICBlbWFpbDogJycsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcnLFxyXG4gICAgICAgIHBhc3N3b3JkQ29uZmlybTogJydcclxuICAgIH07XHJcbiAgICB0aGlzLnN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pe1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpZiAoZm9ybS4kdmFsaWQpe1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hY2NvdW50LnBhc3N3b3JkID09PSB0aGlzLmFjY291bnQucGFzc3dvcmRDb25maXJtKXtcclxuICAgICAgICAgICAgICAgIGF1dGhTZXJ2aWNlLnNpZ25Jbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHNlbGYuYWNjb3VudC5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdXRpbHMuaGFzaENvZGUoc2VsZi5hY2NvdW50LnBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc2VhcmNoJylcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9hc3Rlci5wb3Aoe1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogJ1Bhc3N3b3JkIGZpZWxkcyBhcmUgbm90IHRoZSBzYW1lJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b2FzdGVyLnBvcCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgYm9keTogJ0Zvcm0gaXMgaW52YWxpZCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5zaG9wQXBwbGljYXRpb24uY29udHJvbGxlcignU2lnbnVwQ29udHJvbGxlcicsU2lnbnVwQ29udHJvbGxlcik7IiwiLyogQG5nSW5qZWN0ICovXHJcbnV0aWxzLiRpbmplY3QgPSBbXCIkaHR0cFwiXTtcclxuZnVuY3Rpb24gdXRpbHMoJGh0dHApe1xyXG4gICAgZnVuY3Rpb24gbG9hZEpTT04odXJsKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGhhc2hDb2RlKHN0cil7XHJcbiAgICAgICAgdmFyIGhhc2ggPSAwLCBpLCBjaHIsIGxlbjtcclxuICAgICAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhhc2g7XHJcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNociAgID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaHI7XHJcbiAgICAgICAgICAgIGhhc2ggfD0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhc2g7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxvYWRKU09OOiBsb2FkSlNPTixcclxuICAgICAgICBoYXNoQ29kZTogaGFzaENvZGVcclxuICAgIH1cclxufVxyXG5zaG9wQXBwbGljYXRpb25cclxuICAgIC5mYWN0b3J5KCd1dGlscycsIHV0aWxzKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuZnVuY3Rpb24gZGF0ZVJhbmdlRmlsdGVyKCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oaXRlbXMsIHN0YXJ0RGF0ZSwgZW5kRGF0ZSlcclxuICAgIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIHN0YXJ0RGF0ZSA9IHN0YXJ0RGF0ZSA/IG1vbWVudChzdGFydERhdGUsIFwiTU0uREQuWVlZWVwiKS52YWx1ZU9mKCkgOiAwO1xyXG4gICAgICAgIHZhciBlbmREYXRlID0gZW5kRGF0ZSA/IG1vbWVudChlbmREYXRlLCBcIk1NLkRELllZWVlcIikudmFsdWVPZigpIDogbW9tZW50KCkudmFsdWVPZigpO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbURhdGUgPSAgbW9tZW50KGl0ZW0uaXNzdWVEYXRlLCBcIk1NLkRELllZWVlcIikudmFsdWVPZigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtRGF0ZSA+PSBzdGFydERhdGUgJiYgaXRlbURhdGUgPD0gZW5kRGF0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuLyogQG5nSW5qZWN0ICovXHJcbmZ1bmN0aW9uIHN1bVJhbmdlRmlsdGVyKCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oaXRlbXMsIG1pbiwgbWF4KVxyXG4gICAge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIG1pbiA9IG1pbiA/IHBhcnNlRmxvYXQobWluKSA6IDA7XHJcbiAgICAgICAgdmFyIG1heCA9IG1heCA/IHBhcnNlRmxvYXQobWF4KSA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuXHJcblxyXG4gICAgICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByaWNlID0gaXRlbS5wcmljZTtcclxuICAgICAgICAgICAgICAgIGlmIChtaW4gPD0gcHJpY2UgJiYgbWF4ID49IHByaWNlKXtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcbn1cclxuc2hvcEFwcGxpY2F0aW9uXHJcbiAgICAuZmlsdGVyKCdkYXRlUmFuZ2UnLCBkYXRlUmFuZ2VGaWx0ZXIpXHJcbiAgICAuZmlsdGVyKCdzdW1SYW5nZScsIHN1bVJhbmdlRmlsdGVyKTsiLCIvKiBAbmdJbmplY3QgKi9cclxuUm9sZVNlcnZpY2UuJGluamVjdCA9IFtcIiRxXCIsIFwiJHN0YXRlXCIsIFwiYXV0aFNlcnZpY2VcIl07XHJcbkF1dGhTZXJ2aWNlLiRpbmplY3QgPSBbXCJsb2NhbFN0b3JhZ2VTZXJ2aWNlXCIsIFwiJHFcIiwgXCJ1dGlsc1wiXTtcclxuSXRlbXNTZXJ2aWNlLiRpbmplY3QgPSBbXCIkcVwiLCBcInV0aWxzXCJdO1xyXG5mdW5jdGlvbiBSb2xlU2VydmljZSgkcSwgJHN0YXRlLCBhdXRoU2VydmljZSl7XHJcbiAgICB0aGlzLnJvbGVzID0ge1xyXG4gICAgICAgIGF1dGhPbmx5OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoYXV0aFNlcnZpY2UuaXNMb2dnZWRJbigpKXtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnbG9naW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5wcm9jZXNzID0gZnVuY3Rpb24ocm9sZXMsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIHByb21pc2VzID0gW10sXHJcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJvbGVzLmZvckVhY2goZnVuY3Rpb24ocm9sZSl7XHJcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gc2VsZi5yb2xlc1tyb2xlXSgpO1xyXG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZSwgdG9QYXJhbXMpXHJcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVkaXJlY3Qpe1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28ocmVkaXJlY3QsIHt9LCB7cmVsb2FkOiB0cnVlfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLyogQG5nSW5qZWN0ICovXHJcbmZ1bmN0aW9uIEF1dGhTZXJ2aWNlKGxvY2FsU3RvcmFnZVNlcnZpY2UsICRxLCB1dGlscyl7XHJcbiAgICB0aGlzLnVzZXIgPSBudWxsO1xyXG4gICAgdGhpcy5pc0xvZ2dlZEluID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcy51c2VyO1xyXG4gICAgfTtcclxuICAgIHRoaXMubG9nSW4gPSBmdW5jdGlvbih1c2VyKXtcclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICBzdG9yZWQgPSBudWxsLFxyXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcclxuICAgICAgICBpZiAoIXVzZXIpe1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RvcmVkID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldCgndXNlcicpKTtcclxuICAgICAgICBpZiAoIXN0b3JlZCl7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VyLmVtYWlsID09PSBzdG9yZWQuZW1haWwgJiYgdXRpbHMuaGFzaENvZGUodXNlci5wYXNzd29yZCkgPT09IHN0b3JlZC5wYXNzd29yZCl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnVzZXIgPSBzdG9yZWQ7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHNlbGYudXNlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH07XHJcbiAgICB0aGlzLnNpZ25JbiA9IGZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgaWYgKCF1c2VyKXtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXNlciA9IHVzZXI7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJ3VzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyKSk7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG59XHJcbi8qIEBuZ0luamVjdCAqL1xyXG5mdW5jdGlvbiBJdGVtc1NlcnZpY2UoJHEsIHV0aWxzKXtcclxuICAgIHZhciB1cmwgPSAnaXRlbXMuanNvbic7XHJcbiAgICB0aGlzLml0ZW1zID0gbnVsbDtcclxuICAgIHRoaXMuZ2V0SXRlbXMgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXRlbXMpe1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRoaXMuaXRlbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHV0aWxzLmxvYWRKU09OKHVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH07XHJcbn1cclxuLyogQG5nSW5qZWN0ICovXHJcbmZ1bmN0aW9uIENhcnRTZXJ2aWNlKCl7XHJcbiAgICB0aGlzLmNhcnQgPSBbXTtcclxuICAgIHRoaXMuYWRkVG9DYXJ0ID0gZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jYXJ0Lm1hcChmdW5jdGlvbihlbGVtZW50KXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaWQ7XHJcbiAgICAgICAgfSkuaW5kZXhPZihpdGVtLmlkKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSl7XHJcbiAgICAgICAgICAgIHRoaXMuY2FydFtpbmRleF0uY291bnQgKz0gMTtcclxuICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuY2FydC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgY291bnQ6IDFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5pdGVtc0NvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5jYXJ0LmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICAgICAgICAgIGNvdW50ICs9IGVsZW1lbnQuY291bnQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfVxyXG59XHJcbnNob3BBcHBsaWNhdGlvblxyXG4gICAgLnNlcnZpY2UoJ3JvbGVTZXJ2aWNlJywgUm9sZVNlcnZpY2UpXHJcbiAgICAuc2VydmljZSgnYXV0aFNlcnZpY2UnLCBBdXRoU2VydmljZSlcclxuICAgIC5zZXJ2aWNlKCdpdGVtc1NlcnZpY2UnLCBJdGVtc1NlcnZpY2UpXHJcbiAgICAuc2VydmljZSgnY2FydFNlcnZpY2UnLCBDYXJ0U2VydmljZSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
