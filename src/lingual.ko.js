(function(Lingual, ko){

    if(!(Lingual && ko)){
        return;
    }

    Lingual.prototype.plugins.push(function(){

        var self = this;

        ko.bindingHandlers[self.defaults.selectorKey] = {
            init: function(element, valueAccessor){
                var $el = $(element);
                var val = valueAccessor();

                // The user specified a translate key, translate this element only
                if(val){
                    $el.attr('data-' + self.defaults.selectorKey, valueAccessor());
                    self.translate( $el.parent() );
                } else {
                    // Translate all the children
                    self.translate( $el );
                }
            },
            preprocess: function(val) {
                return val || 'false';
            }
        };
    });

})(Lingual, ko);
