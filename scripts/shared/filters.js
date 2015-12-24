/* @ngInject */
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
    .filter('sumRange', sumRangeFilter);