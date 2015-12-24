/* @ngInject */
function headerDirective(){
    return {
        restrict: 'E',
        bindToController: true,
        controllerAs: 'header',
        controller: HeaderController,
        templateUrl: 'scripts/components/header/header.html'
    };
}
shopApplication.directive('header', headerDirective);