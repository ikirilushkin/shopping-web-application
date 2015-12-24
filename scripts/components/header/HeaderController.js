/* @ngInject */
function HeaderController(ModalService, cartService){
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
shopApplication.controller('HeaderController', HeaderController);