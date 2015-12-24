/* @ngInject */
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
shopApplication.controller('SearchController', SearchController);