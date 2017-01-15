/**
 * jQuery plugin name: evmrSelect
 * Version: 1.0.0
 * Author: Zoran Vulanovic
 * Company: TNation
 * Email: vulezor@gmail.com
 * */

( function( $, window, document, undefined ) {
    "use strict";
    var pluginName = "evmrSelect",
        defaults = {
            timeout_remove: 500,
            delay: 300,
            overflow_length: 10,
            ajax_load_icon:'<i class="tnDropdown-loader fa fa-circle-o-notch fa-spin fa-fw margin-bottom"></i>',
            ajax:null,
            data:[],
            onChange: function(data){}
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = $(element);
        this.el_width = this.element.outerWidth();
        this.el_height = this.element.outerHeight();
        this.el_left = this.element.offset().left;
        this.el_top = this.element.offset().top;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init:function(){
            this._createFakeSelect();
            this.element.parent().find('div.evmrSelect_fake_select').on('focus', this, this._buildDropdownMainContainer.bind(this));
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _createFakeSelect:function(){
            //prepare elements
            this.container = $('<div class="evmrSelect"></div>');
            this.fake_select = $('<div tabindex=0, autofocus=true class="evmrSelect_fake_select" style="width:'+this.el_width+'px;">Select somethig</div>');
            //wrap and add elements
            this.element.wrap(this.container);
            this.element.css({'display':'none'});
            this.element.before(this.fake_select);
            this.element.parent().on('mouseleave', this, this._mouseLeaveEvent.bind(this))
                                 .on('mouseenter', this, this._clearTimeOutBoxRemove.bind(this));

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _mouseLeaveEvent:function(){
            var self = this;
            self.timeout_box_remove = window.setTimeout(function(){
                console.log('done');
                self._destroyMineContainer();
            }, self.options.timeout_remove);
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _clearTimeOutBoxRemove:function(){
            window.clearTimeout(this.timeout_box_remove);
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _buildDropdownMainContainer: function(){
            if($('.evmrSelect_main_container').length<1){
                this._main_container = $('<div class="evmrSelect_main_container" style="padding:5px"></div>');
                $('body').append(this._main_container);
                this._main_container.css({'left':this.el_left+'px', 'top':this.el_top+'px', 'width':this.el_width+'px', 'margin-top':(this.el_height + 4)+'px'});
                this._main_container.mouseleave(this._mouseLeaveEvent.bind(this))
                                    .mouseenter(this._clearTimeOutBoxRemove.bind(this));
                this._buildSearchInput();
            } else {
                this._destroyMineContainer();
                this._clearTimeOutBoxRemove();
            }
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _buildSearchInput:function(){
            this.search = $('<input type="text" class="form-control" />');
            this._main_container.append(this.search);
            this.search.focus();
            this.search.keyup(this._initAjax.bind(this))
                       .keydown(this._actionToInput.bind(this));
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _initAjax:function(e){
            var event = window.event ? window.event : e;
            if(event.keyCode === 40 || event.keyCode === 38 || event.keyCode === 13 || event.keyCode === 9) return false; //stop calling ajax on keyup up and down
            if(this.element.val() === 0) return false;
            if(!this.element.next().hasClass('TN_dropdown_load')){
                this.element.after('<div class="TN_dropdown_load" style="position:absolute;z-index:3;right:0%;margin-right:27px;margin-top:13px">'+this.options.ajax_load_icon+'</div>');
            }
            clearTimeout(this.timeout);
            if(this.xhr && this.xhr.readyState != 4){
                this.xhr.abort();
            }
            this.timeout = window.setTimeout(this._newAjaxCall.bind(this), this.options.delay);
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _newAjaxCall:function(){
            var self = this;

            //var ajaxData = this.options.ajax.data();
            this.options.ajax.data.q = this.search.val();

            this.xhr = $.ajax({
                method: this.options.ajax.method,
                url: this.options.ajax.url,
                dataType: this.options.ajax.datatype,
                data: this.options.ajax.data,//ajaxData;
                success:function(msg){
                    console.log(typeof msg)
                    console.log("Message", msg.length)
                    self.element.next().remove();
                    if(msg.length !== 0 ){
                        self.options.data = self.options.ajax.processResults(msg);
                        self._destroyAutocompleteBox();
                        self._buildAutocompleteBox();
                    } else {
                        self._destroyAutocompleteBox();
                    }
                },
                error:function(error){
                    console.log(error);
                }
            });
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _buildAutocompleteBox:function(){
            var template = $('<div class="evmrSelect_auto-complete-select-box" id="autocomplete_box" ><ul style="position:relative"></ul></div>');
            this._main_container.append(template);
            this.element.find('option').remove();
            for(var i = 0; i<this.options.data.length; i++){
                var option = $('<option value="'+this.options.data[i]['value']+'">'+this.options.data[i]['text']+'</option>');
                var li = $('<li>'+this.options.data[i]['text']+'</li>');
                li.data('value',this.options.data[i]['value']);
                li.data('obj',this.options.data[i]['obj']);
                this.element.append(option);
                $('#autocomplete_box ul').append(li);
            }
            var check_overflow_height = parseInt($('#autocomplete_box').find('li').outerHeight()) * parseInt(this.options.overflow_length);
            if($('#autocomplete_box').outerHeight()>=check_overflow_height){
                $('#autocomplete_box').css({'height':check_overflow_height+'px','overflow-x':'hidden','overflow-y':'auto'});
            }else{
                $('#autocomplete_box').css({'height':'auto','overflow-x':'none','overflow-y':'none'});
            }
            this._eachListItemAction();
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _eachListItemAction:function(){
            var self = this;
            $('#autocomplete_box').mousemove(function(){
                $(this).removeClass('key_up')
            });
            $('#autocomplete_box').find('li').mouseenter(function(){
                if(!$('#autocomplete_box').hasClass('key_up')){
                    $('#autocomplete_box').find('li').each(function(i, item){
                        $(this).removeClass('auto-complete-active')
                    });
                    $(this).addClass('auto-complete-active');

                    self.setData({
                        text: $(this).html(),
                        value: $(this).data('value'),
                        obj: $(this).data('obj')
                    });
                    self.search.val($('.auto-complete-active').html());
                }
            }).mouseleave(function(){
                $(this).removeClass('auto-complete-active')
            }).click(this._adjustData.bind(this));
        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _adjustData:function(){
            this.setData({
                text: $('.auto-complete-active').html(),
                value: $('.auto-complete-active').data('value'),
                obj: $('.auto-complete-active').data('obj')
            });
            this.fake_select.html($('.auto-complete-active').html());

            this.element.val($('.auto-complete-active').data('value'));
            /*if($('#autocomplete_box').length>=1){*/
                this.fake_select.focus();
                this._destroyAutocompleteBox();
                this._destroyMineContainer();
            /*}*/
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
                } else{
                    var activeItem = $('.auto-complete-active:not(:last-child)');
                    if($('.auto-complete-active:not(:last-child)').length){
                        activeItem.removeClass('auto-complete-active')
                                  .next()
                                  .addClass('auto-complete-active');
                    } else{
                        $('.auto-complete-active').removeClass('auto-complete-active');
                        $('#autocomplete_box li:first').addClass('auto-complete-active');
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
                    $('#autocomplete_box li:last').addClass('auto-complete-active');
                    $('#autocomplete_box').scrollTop($('#autocomplete_box').height());
                }
            }

            //if enter or tab key
            if(event.keyCode === 9 || event.keyCode === 13){
                console.log(event.keyCode);
                this._adjustData()
            }

            //keypress keyup or keydown
            if(event.keyCode === 38 || event.keyCode === 40){
                $('#autocomplete_box').scrollTop(0);
                $('#autocomplete_box').scrollTop(($('.auto-complete-active:first').position().top + $('.auto-complete-active:first').outerHeight()) - $('#autocomplete_box').height()+5);
               /* this.search.val($('.auto-complete-active').html());
                this.search.select();*/
            }

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        setData: function(obj){
            console.log("OBJ", obj);
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
        _destroyAutocompleteBox:function(){
            $('#autocomplete_box').remove();

        },

        //----------------------------------------------------------------------------------------------------------------------------------------------

        _destroyMineContainer: function(){
            $('.evmrSelect_main_container').remove();

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
