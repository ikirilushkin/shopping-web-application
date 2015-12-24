/* @ngInject */
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
    .factory('utils', utils);