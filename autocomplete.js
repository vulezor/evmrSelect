/**
 * jQuery Widget name: evmrSelect
 * Version: 1.0.0
 * Author: Zoran Vulanovic
 * Company: TNation
 * Email: vulezor@gmail.com
 * */
( function( $, window, document, undefined ) {
    "use strict";
    var pluginName = "evmrSelect",
        defaults = {
            delay: 300,
            overflow_length: 10,
            ajax_load_icon:'<i class="evmrAutocomplete_loader fa fa-circle-o-notch fa-spin fa-fw margin-bottom"></i>',
            dataMask: "",
            ajax:{
                url: null,
                datatype: 'json',
                method: "GET",
                data: function(){
                    return {};
                },
                processResults: function(){}
            },
            data:[],
            onChange: function(data){}
        };

        // The actual plugin constructor
        function Plugin ( element, options ) {

            this.select = $(element);
             
            var input = $('<input type="text" class="form-control edit-info" />'); 
            this.select.hide();
            this.select.after(input);

            this.element = input;
            this.options = $.extend( {}, defaults, options );

            // add placeholder
            this.element.attr('placeholder',this.select.attr('placeholder'));
            this._defaults = defaults;
            this._name = pluginName;
            this.init();
        }

        //----------------------------------------------------------------------------------------------------------------------------------------------
         
        // Avoid Plugin.prototype conflicts
        $.extend( Plugin.prototype, {

        init: function() {
             console.log('INIT', this.options.data.length);
            this.element.wrap('<div class="evmrAutocomplete input-group"></div>');
            this.element.after('<span class="input-group-btn search-btn"><button tabindex="-1" class="btn btn-default" type="button"><i class="fa fa-search" aria-hidden="true"></i></button></span>');
             
             this._checkStaticData();  //checking in select if option exists set this.options.data
            console.log('INIT', this.options.data.length);
            if(this.options.data.length === 0){
                //dynamic ajax data init section
                console.log('server')
                this._serverInit();
            } else {
                console.log('call static data');
                //static data init section
                console.log('client')
                this._staticInit();
            }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * Description: this.options.data set array of objects from options value text
        */
        _checkStaticData: function(){
            var self = this, value, text, obj;
            if(this.select.find('option').length > 0){
                this.options.data = [];
                this.select.find('option').each(function() 
                {
                    value = $(this).val();
                    text  = $(this).text();
                    obj = {
                        text:text,
                        value:value
                    };
                    self.options.data.push(obj);
                });
                this.options.filter_data = self.options.data;
            } else {
                this.options.data = [];
            }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * Description: Ajax section init
        */
        _serverInit:function(){
            var self = this;

            this.element.closest('.input-group').find('.search-btn button').on('click', this, function(){
                    self.element.focus();
                    self.element.trigger('keyup');
                    self.element.trigger('keydown');
                    self._initAjax.call(self);
                });

                if(this.options.dataMask!=""){
                    console.log('Init datamask....');
                    this.element.attr('data-inputmask',this.options.dataMask);
                    this.element.inputmask();
                }
                

                this.select.on('change',this, this._updateInputText.bind(this));

                this.element.on('change',function(){
                    if($(this).val().length==0){
                        self.select.html('<option value="" selected></option>');
                        self.select.val("");
                        self.select.change();
                        console.log('deleteing');
                    }
                    self.select.show().focus().blur().hide(); // triger "blur" event on select to trigger validation errors
                });

                this.element
                .on('focus', this, function(){$(this).select()})
                .on('blur', this, this._destroyAutocompleteBox.bind(this,'blur'))
                .on('blur', function(){
                    self.element.change();
                });
                this.element.on('keyup', this, this._initAjax.bind(this))
                .on('keydown', this, this._actionToInput.bind(this));  
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * Description: Static set of data init
        */
        _staticInit:function(){
            var self = this;
            this.element.closest('.input-group').find('.search-btn button').on('click', this, function(){
                    self.element.focus();
                    self.element.trigger('keyup');
                    self.element.trigger('keydown');
                });

                this.element.on('change',function(){
                    if($(this).val().length==0){
                        self.select.html('<option value="" selected></option>');
                        self.select.val("");
                        self.select.change();
                    }
                });

                this.element.on('keydown', this, this._actionToInput.bind(this))
                            .on('blur', this, this._destroyAutocompleteBox.bind(this,'blur'))
                            .on('keyup', this, this._staticAction.bind(this));
           
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * Description: Build action for static data set
        */
        _staticAction:function(e){
            var values = this.element.val();
            var event = window.event ? window.event : e;
            this.options.data = this._filterStaticData(this.options.filter_data, values);
            if($('#autocomplete_box').length === 0){
                if( event.keyCode != 13 ){
                    this._buildAutocompleteBox();
                    this._buildListItems();
                }
            } else{
                if(event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 39 && event.keyCode != 37 &&  event.keyCode !== 13 && event.keyCode !== 9){
                    console.log('no build');
                    this._buildListItems();
                }
            }    
        }, 

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * @param arr expect to set array
        * @param regex expect to be string search term
        * return mixed
        * Description: filtering static data method 
        */
        _filterStaticData: function(arr, regex){
                var matches=[], i;
                if( regex.replace(/\s+/g, '').length !== 0 ){
                    for (i in arr) {
                        if(arr[i].text.toLowerCase().indexOf(regex.toLowerCase()) === 0 ) { 
                            matches.push(arr[i]);
                        }
                    }
                    if(matches.length === 0){
                      return '<div style="padding:5px;font-weight:bold">No search result data!</div>';        
                    } else {
                       return matches; 
                    }
                } else {
                        return this.options.filter_data;
                }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------
        /**
        * @param e for event
        * Description: initiation of ajax
        */
        _initAjax:function(e){ 
            var event = window.event ? window.event : e;
            if(event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 38 || event.keyCode === 13 || event.keyCode === 9 || ( $('#autocomplete_box').length>0 && event.keyCode === 40)) return false; //stop calling ajax on keyup up and down
            if(this.element.val() === 0) return false;
            if(!this.element.next().hasClass('evmrAutocomplete_load')){
                this.element.after('<div class="evmrAutocomplete_load">'+this.options.ajax_load_icon+'</div>');
            }
            this._abortAjax();
            this.timeout = window.setTimeout(this._newAjaxCall.bind(this), this.options.delay); 
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        /**
        * Description: initiation of ajax
        */
        _abortAjax: function(){
            clearTimeout(this.timeout);
            if(this.xhr && this.xhr.readyState != 4){
                this.xhr.abort();
            }
        },
        
        //----------------------------------------------------------------------------------------------------------------------------------------------

        _newAjaxCall:function(){
            var self = this;
            var ajaxData = this.options.ajax.data();
            ajaxData.q = this.element.val();
            this.xhr = $.ajax({
                        method: this.options.ajax.method,
                        url: this.options.ajax.url,
                        dataType: this.options.ajax.datatype,
                        data: ajaxData,
                        success:function(msg){
                            console.log(msg);
                            self.element.parent().find('.evmrAutocomplete_load').remove();
                            if(msg.length !== 0 ){
                                self.options.data = self.options.ajax.processResults(msg);
                                self._destroyAutocompleteBox();
                                self._buildAutocompleteBox();
                            } else {

                                self._destroyAutocompleteBox();
                            }
                        },
                        error:function(error){
                        self.element.next().remove();
                        console.log(error);
                    }
                    });
        },  

        //----------------------------------------------------------------------------------------------------------------------------------------------  

        _buildAutocompleteBox:function(){
            var template = '<div class="auto-complete-box" id="autocomplete_box" style="background-color:#fff;"><ul style="positionrelative"></ul></div>';
            $('body').prepend(template);
            this._buildListItems();
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------  
 
        _buildListItems:function(){
           //static data hack
           $('#autocomplete_box ul').html('');
           var offset = this.element.offset();

                if(typeof this.options.data !== 'object'){
                    console.log('no results data');
                    $('#autocomplete_box ul').html(this.options.data);
                    $('#autocomplete_box').css({'top':top_side_controll+'px', 'left':offset.left+'px', 'width':this.element.outerWidth(), 'height':'30px','overflow-x':'none','overflow-y':'none'});
                    return false;
                }
                
                for(var i = 0; i<this.options.data.length; i++){
                    var li = $('<li>'+this.options.data[i]['text']+'</li>');
                    li.data('value',this.options.data[i]['value']);
                    li.data('obj',this.options.data[i]['obj']);
                    $('#autocomplete_box ul').append(li);
                }


                // in aoutocomplete box set first list item active with adding auto
                if($('#autocomplete_box ul li').length>0){
                    $('#autocomplete_box ul li:first').addClass('auto-complete-active');
                };

                
                var  check_overflow_height = parseInt($('#autocomplete_box').find('li:last').outerHeight()) * parseInt(this.options.overflow_length);

                if(parseInt($('#autocomplete_box').height()) >= parseInt(check_overflow_height)){
                    console.log('fetch')
                    $('#autocomplete_box').css({'height':check_overflow_height+'px','overflow-x':'hidden','overflow-y':'auto'});
                }else{
                    console.log('fetch auto')
                    $('#autocomplete_box').css({'height':'auto','overflow-x':'none','overflow-y':'none'});
                }

                var thisset = this.element.offset();
                var top_side_controll = 0;
                var height_doc = $(window).height() - ($(window).height() / 3 );
                console.log(height_doc+', '+thisset.top);
                if(offset.top>=height_doc){
                        top_side_controll = thisset.top - ($('#autocomplete_box').outerHeight() + this.element.outerHeight() + 2); 
                } else {
                   top_side_controll = thisset.top;  
                }

                $('#autocomplete_box').css({'top':top_side_controll+'px', 'left':thisset.left+'px', 'width':this.element.outerWidth()});
            
            this._eachListItemAction();
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _eachListItemAction:function(){
            var self = this;
            $('#autocomplete_box').mousemove(function(){
                    $(this).removeClass('key_up');
            });
            $('#autocomplete_box li').mouseenter(function(){
                if(!$('#autocomplete_box').hasClass('key_up')){
                    $('#autocomplete_box li').each(function(i, item){
                        $(this).removeClass('auto-complete-active')
                    });
                   $(this).addClass('auto-complete-active');

                  /* self.setData({
                        text: $(this).html(),
                        value: $(this).data('value'),
                        obj: $(this).data('obj')
                   });*/
                   
                }
            }).mouseleave(function(){
                $(this).removeClass('auto-complete-active')
            }).mousedown(function(){
                self.setData({
                        text: $(this).html(),
                        value: $(this).data('value'),
                        obj: $(this).data('obj')
                   });
                self._destroyAutocompleteBox()
            })
        
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _actionToInput:function(e){
            var self = this
            var event = window.event ? window.event : e;  
            $('#autocomplete_box').addClass('key_up');  
            //keypress down
            if(event.keyCode === 40){
               
                if($('.auto-complete-active').length===0){
                    $('#autocomplete_box li:first').addClass('auto-complete-active');
                    var text = $('.auto-complete-active').html();
                  
                } else{
                     var activeItem = $('.auto-complete-active:not(:last-child)');
                if($('.auto-complete-active:not(:last-child)').length){
                    activeItem.removeClass('auto-complete-active')
                    .next()
                    .addClass('auto-complete-active');
                } else{
                   $('.auto-complete-active').removeClass('auto-complete-active');
                   
                   $('#autocomplete_box li:first')
                    .addClass('auto-complete-active');
                    $('#autocomplete_box').scrollTop(0);
                }

                }
            }

            //keypress up
            if(event.keyCode === 38){
                var activeItem = $('.auto-complete-active:not(:first-child)');
                if($('.auto-complete-active:not(:first-child)').length){
                    activeItem.removeClass('auto-complete-active')
                    .prev()
                    .addClass('auto-complete-active');
                }else{
                    $('.auto-complete-active').removeClass('auto-complete-active');
                   
                   $('#autocomplete_box li:last')
                    .addClass('auto-complete-active');
                    $('#autocomplete_box').scrollTop($('#autocomplete_box').height());
                }
            }

            //if enter or tab key
            if(event.keyCode === 9 || event.keyCode === 13){
                if($('#autocomplete_box').length>=1){
                    self.setData({
                        text: $('.auto-complete-active').html(),
                        value: $('.auto-complete-active').data('value'),
                        obj: $('.auto-complete-active').data('obj')
                   });
                    this._destroyAutocompleteBox();
                }
            }

            //keypress keyup or keydown
            if(event.keyCode === 38 || event.keyCode === 40){
               
               if($('#autocomplete_box').length>0){
                    $('#autocomplete_box').scrollTop(0);
                    $('#autocomplete_box').scrollTop(($('.auto-complete-active:first').position().top + $('.auto-complete-active:first').outerHeight()) - $('#autocomplete_box').height());
                    if($('.auto-complete-active').length >0){
                        /*self.setData({
                            text: $('.auto-complete-active').html(),
                            value: $('.auto-complete-active').data('value'),
                            obj: $('.auto-complete-active').data('obj')
                       });*/
                    }
                }
            }
        
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        setData: function(obj){
            console.log("OBJJJJJ",obj);
               this.select.html('<option selected value="'+obj.value+'">'+obj.text+'</option>');
                this.element.val(obj.text)
                this.element.data('value', obj.value);
                this.element.data('obj', obj.obj);
                this.options.onChange(obj);
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        getData: function(){
                return {
                    value: this.element.data('value'),
                    text: this.element.val(),
                    obj: this.element.data('obj'),
                }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _updateInputText: function(){
            if(this.select.find('option:selected').length>0){
                this.element.val(this.select.find('option:selected').text());
                console.log('update select....,'+this.element.val());
                this.options.onChange({value:this.select.val(),text:this.select.find('option:selected').text()});
            }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _destroyAutocompleteBox:function(eventType){

           if(eventType==='blur'){
               //if is set no search result to destroy
                if(typeof this.options.data === 'string'){
                    $('#autocomplete_box').remove();
                    this.select.val('');
                    this.element.val('');
                    this.options.onChange({value:'',text:''});
                    return false;
                }

                 // stop ajax if in process
                this._abortAjax();
                if(this.options.data.length>0){
                    //console.log('BLUR',this.options.data);
                    var clearValue = true;
                    var index = -1;
                    var self = this;
                    $.each(this.options.data,function(i,el){
                        if(el.text.toLowerCase()==self.element.val().toLowerCase()){
                            index = i;
                            clearValue = false;
                        }
                    });

                    if(clearValue){
                        this.select.val('');
                        this.element.val('');
                        this.options.onChange({value:'',text:''});
                    }else{
                       /* if(index>=0){
                            this.setData(this.options.data[index]);
                        }*/
                    }
                }
            }
            // remove loading on destroy
            this.element.parent().find('.evmrAutocomplete_load').remove();

            $('#autocomplete_box').remove();
        }
    });


     $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };


} )( jQuery, window, document );
