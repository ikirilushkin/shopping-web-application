/* @ngInject */
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