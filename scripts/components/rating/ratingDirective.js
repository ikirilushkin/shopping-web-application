/* @ngInject */
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
shopApplication.directive('rating', ratingDirective);