(function (modul) {
    var selectAutocomplete = function ($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope:{
                delay:"@",
                selectedValue:"=",
                api:"="
            },
            link: function (scope, element, attr, ngModel) {
                $timeout(function(){
                    $(element).find("option").eq(0).remove(); // angular set first empty option but this hack remove it
                    $(element).evmrSelect({
                        overflow_length: 10,
                        delay: parseInt(scope.delay),
                        dataMask: false,
                        ajax:{
                            url: scope.api.url,
                            
                            data:function(){
                            const query = {};
                            
                            if(typeof scope.linked !== 'undefined'){
                                if($.isArray(scope.linked)){
                                    for(var link of scope.linked){
                                        if(link.value){
                                        query[link.field] = link.value;
                                        }
                                    }
                                }else{
                                    query[scope.linked.field] = scope.linked.value;
                                } 
                            }

                            query['access_token'] = localStorage.getItem('id_token');

                            return query;
                            },
                            processResults: function(response){
                                var response = $.map(response, function( n ) {
                                    return {
                                        text:n[scope.api.name],
                                        value:n[scope.api.id],
                                        obj:n
                                    }
                                });
                                return response;
                            }
                        },
                        onChange: function(data){
                            if(typeof data.value === "string"){
                               data.value = data.value.replace("string:", "");
                            }
                            ngModel.$setViewValue(parseInt(data.value));
            
                        }
                    });
                
                    if(!scope.selectedValue){
                        $(element).data('plugin_evmrSelect').setData("");
                    } else {
                        $(element).data('plugin_evmrSelect').setData(scope.selectedValue);
                    }
                }, 0);
                
            }
        }

    };
    selectAutocomplete.$inject = ['$timeout'];
    modul.directive('selectAutocomplete', selectAutocomplete);
})(angular.module('app'));