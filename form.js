
bm.formHandler = {


    /**
     * readonly bind control
     */
    bindReadonly : function( element, o ){
        var target = o.target;

        this.bindReadonlyDefaultControl( element, target );

        if( !this.bindReadonlyList[target] ){
            this.bindReadonlyList[target] = [];
        }
        this.bindReadonlyList[target].push( element );

        var _this = this;
        var targetType = $(target).attr('type') ? $(target).attr('type') : "";
        
        if( targetType == "checkbox" ){
        	$(target).off("change");
            $(target).on("change", function(e){
                _this.bindReadonlyHandler( element, target );
            })
        }else{
        	$("input[name='"+$(target).attr("name") +"']").off("change");
            $("input[name='"+$(target).attr("name") +"']").on("change", {element: element, target: target}, function(e){
                _this.bindReadonlyHandler( e.data.element, e.data.target );
            })
        }
    }

    ,bindReadonlyList : {}

    ,bindReadonlyDefaultControl : function( element, target ){
        if( $(target).is(":checked") ){
            $(element).removeAttr( "readonly" );
            $(element).removeClass("disabled");
        }else{
            $(element).attr( "readonly", "readonly" );
            $(element).addClass("disabled");
        }
    }


    ,bindReadonlyHandler : function( element, target ){
        var list = this.bindReadonlyList[ target ];
        bm.each( list, function( key, value ){
            if( $(target).is(":checked") ){
                $(this).removeAttr( "readonly" );
                $(element).removeClass("disabled");
            }else{
                $(this).attr( "readonly", "readonly" );
                $(element).addClass("disabled");
            }
        });
    }


	,bindReadonlyNum : function( element, o ){
		var _this = this;
		
		_this.bindReadonly( element, o );
		_this.onlyNum( element );
	}


    ,validAvoidOne : function( target ){
        var validStr = $(target).attr("data-wv-valid");
        $(target).attr( "data-wv-valid-save", validStr );
        $(target).removeAttr( "data-wv-valid" );
    }


    ,validRestoreOne : function( target ){
        var validStr = $(target).attr("data-wv-valid-save");
        $(target).attr( "data-wv-valid", validStr );
        $(target).removeAttr( "data-wv-valid-save" );
    }

    

    ,validAvoid : function( container ){
        $(container).find("[data-wv-valid]").each(function(){
            var validStr = $(this).attr("data-wv-valid");
            $(this).attr( "data-wv-valid-save", validStr );
            $(this).removeAttr( "data-wv-valid" );
        });
    }


    ,validRestore : function( container ){
        $(container).find("[data-wv-valid-save]").each(function(){
            var validStr = $(this).attr("data-wv-valid-save");
            $(this).attr( "data-wv-valid", validStr );
            $(this).removeAttr( "data-wv-valid-save" );
        });
    }

    /**
     * select 의 값 선택
     */
    ,selectValue : function( element, o ){
        $(element).val(o.value);
    }

    /**
     * 라인 추가
     * @param element
     * @param o
     */
    ,addLineHandler : {}
    ,addLine : function( element, o ){
    	
//    	console.log("1 : ", element);
//    	console.log("2 : ", o);
//    	console.log("3 : ", o.container);
//    	console.log("4 : ", o.target);
    	
        var template = $(o.container).find(o.target)[0].outerHTML;
        
//        console.log(template);

        if( this.addLineHandler[element] ){
            $(element).off( "click", this.addLineHandler[element] );
        }

        this.addLineHandler[element] = function(e){
            var regExpDelimiter = /{delimiter}/gi;
            var delimiter = bm.getDelimiter();
            var newTemplate = template.replace(regExpDelimiter, delimiter);

            var newChild = $(newTemplate).appendTo( o.container );
            $(newChild).show();
            bm.formUtil.reset( newChild );
            app.wvHandlerCrawling( newChild );
            app.additionalCrawling( newChild );
        }

        $(element).on( "click", this.addLineHandler[element] );

        if(o.removeTemplate === true || o.removeTemplate === "true"){
        	$(o.container).find(o.target).remove();
        }
    }

    /**
     * 라인 삭제
     * @param element
     * @param o
     */
    ,minusLineHandler : {}
    ,minusLine : function( element, o ){

        if( this.minusLineHandler[element] ){
            $(element).off( "click", this.minusLineHandler[element] );
        }

        this.minusLineHandler[element] = function(e){
            $(this).closest(o.target).remove();
        }

        $(element).on( "click", this.minusLineHandler[element] );
    }


    /**
     * 한글만 입력 가능 체크
     * @param element
     */
    ,onlyKrHandler : {}
    ,onlyKr : function( element ){

        if( this.onlyKrHandler[element] ){
            $(element).off( "keyup", this.onlyKrHandler[element] );
            $(element).off( "blur", this.onlyKrHandler[element] );
        }

        this.onlyKrHandler[element] = function(e){
            if( bm.valid.isOnlyKr( element.value ) == false ){
                alert( "한글만 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyKrRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyKrHandler[element] );
        $(element).blur( this.onlyKrHandler[element] );
    }


    /**
     * 한글만 빼고 입력 가능 체크
     * @param element
     */
    ,onlyNotKrHandler : {}
    ,onlyNotKr : function( element ){

        if( this.onlyKrHandler[element] ){
            $(element).off( "keyup", this.onlyNotKrHandler[element] );
            $(element).off( "blur", this.onlyNotKrHandler[element] );
        }

        this.onlyNotKrHandler[element] = function(e){
            if( bm.valid.isOnlyNotKr( element.value ) == false ){
                alert( "한글을 제외하고 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyNotKrRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyNotKrHandler[element] );
        $(element).blur( this.onlyNotKrHandler[element] );
    }

    /**
     * 영문만 입력 가능 체크
     * @param element
     */
    ,onlyEnHandler : {}
    ,onlyEn : function( element ){

        if( this.onlyEnHandler[element] ){
            $(element).off( "keyup", this.onlyEnHandler[element] );
            $(element).off( "blur", this.onlyEnHandler[element] );
        }

        this.onlyEnHandler[element] = function(e){
            if( bm.valid.isOnlyEn( element.value ) == false ){
                alert( "영문만 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyEnRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyEnHandler[element] );
        $(element).blur( this.onlyEnHandler[element] );
    }

    /**
     * 영어만 빼고 입력 가능 체크
     * @param element
     */
    ,onlyNotEnHandler : {}
    ,onlyNotEn : function( element ){

        if( this.onlyEnHandler[element] ){
            $(element).off( "keyup", this.onlyNotEnHandler[element] );
            $(element).off( "blur", this.onlyNotEnHandler[element] );
        }

        this.onlyNotEnHandler[element] = function(e){
            if( bm.valid.isOnlyNotEn( element.value ) == false ){
                alert( "한글을 제외하고 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyNotEnRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyNotEnHandler[element] );
        $(element).blur( this.onlyNotEnHandler[element] );
    }
    
    
    /**
     * 숫자만 입력 가능 체크
     * @param element
     */
    ,onlyNumHandler : {}
    ,onlyNum : function( element ){

        if( this.onlyNumHandler[element] ){
            $(element).off( "keyup", this.onlyNumHandler[element] );
            $(element).off( "blur", this.onlyNumHandler[element] );
        }

        this.onlyNumHandler[element] = function(e){
            if( bm.valid.isOnlyNum( element.value ) == false ){
                alert( "숫자만 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyNumRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyNumHandler[element] );
        $(element).blur( this.onlyNumHandler[element] );
    }




    /**
     * 실수만 입력 가능 체크
     * @param element
     */
    ,onlyNumDotHandler : {}
    ,onlyNumDot : function( element ){

        if( this.onlyNumDotHandler[element] ){
            $(element).off( "keyup", this.onlyNumDotHandler[element] );
            $(element).off( "blur", this.onlyNumDotHandler[element] );
        }

        this.onlyNumDotHandler[element] = function(e){
            if( bm.valid.isOnlyNumDot( element.value ) == false ){
                alert( "숫자와 소수점까지만 입력할 수 있습니다." );
                element.value = element.value.replace(bm.valid.onlyNumDotRegex, "");
            }
        }

        $(element).on( "keyup", this.onlyNumDotHandler[element] );
        $(element).blur( this.onlyNumDotHandler[element] );
    }

    
    /**
     * 숫자만 입력, 3자리마다 comma
     * @param element
     */
    ,onlyNumCommaHandler : {}
    ,onlyNumComma : function( element ){
    	
    	if( this.onlyNumHandler[element] ){
    		$(element).off( "keyup", this.onlyNumCommaHandler[element] );
    		$(element).off( "blur", this.onlyNumCommaHandler[element] );
    	}
    	
    	this.onlyNumCommaHandler[element] = function(e){
    		
    		var result = element.value.replace(/,/g, "");
    		
    		if( bm.valid.isOnlyNum( result ) == false ){
    			alert( "숫자만 입력할 수 있습니다." );
    			result = result.replace(bm.valid.onlyNumRegex, "");
    		}
    		// 값이 없을때 0이 찍혀 입력이 불편하여 0일때는 빈값이 되도록 변경
    		var val = bm.valid.addComma(result);
    		if(val == 0) element.value = "";
    		if(result) element.value = val;
    	}
    	
    	$(element).on( "keyup", this.onlyNumCommaHandler[element] );
    	$(element).blur( this.onlyNumCommaHandler[element] );
    }
    
    
    /**
     * 문자만 입력 가능 체크
     * @param element
     */
    ,onlyTextHandler : {}
    ,onlyText : function( element ){
    	if( this.onlyTextHandler[element] ){
    		$(element).off( "keyup", this.onlyTextHandler[element] );
    		$(element).off( "blur", this.onlyTextHandler[element] );
    	}
    	
    	this.onlyTextHandler[element] = function(e){
    		if( bm.valid.isOnlyText( element.value ) == false ){
    			alert( "문자만 입력할 수 있습니다." );
    			element.value = element.value.replace(bm.valid.onlyTextRegex, "");
    		}
    	}
    	
    	$(element).on( "keyup", this.onlyTextHandler[element] );
    	$(element).blur( this.onlyTextHandler[element] );
    }
    
    
    /**
     * 영문, 숫자만 입력 가능 체크
     * @param element
     */
    ,onlyNumAndEnHandler : {}
    ,onlyNumAndEn : function( element ){
    	if( this.onlyNumAndEnHandler[element] ){
    		$(element).off( "keyup", this.onlyNumAndEnHandler[element] );
    		$(element).off( "blur", this.onlyNumAndEnHandler[element] );
    	}
    	
    	this.onlyNumAndEnHandler[element] = function(e){
    		if( bm.valid.isOnlyNumAndEn( element.value ) == false ){
    			alert( "영문, 숫자만 입력할 수 있습니다." );
    			element.value = element.value.replace(bm.valid.onlyNumAndEnRegex, "");
    		}
    	}
    	
    	$(element).on( "keyup", this.onlyNumAndEnHandler[element] );
    	$(element).blur( this.onlyNumAndEnHandler[element] );
    }
    
    
    /**
     * 한글, 숫자만 입력 가능 체크
     * @param element
     */
    ,onlyNumAndKrHandler : {}
    ,onlyNumAndKr : function( element ){
    	if( this.onlyNumAndKrHandler[element] ){
    		$(element).off( "keyup", this.onlyNumAndKrHandler[element] );
    		$(element).off( "blur", this.onlyNumAndKrHandler[element] );
    	}
    	
    	this.onlyNumAndKrHandler[element] = function(e){
    		if( bm.valid.isOnlyNumAndKr( element.value ) == false ){
    			alert( "한글, 숫자만 입력할 수 있습니다." );
    			element.value = element.value.replace(bm.valid.onlyNumAndKrRegex, "");
    		}
    	}
    	
    	$(element).on( "keyup", this.onlyNumAndKrHandler[element] );
    	$(element).blur( this.onlyNumAndKrHandler[element] );
    }
    

    /**
     * 최대 길이 체크
     * @param element
     * @param maxbyte
     */
    ,maxbyteHandler : {}
    ,maxbyte : function( element, maxbyte ){

        if( this.maxbyteHandler[element] ){
            $(element).off( "keyup", this.maxbyteHandler[element] );
            $(element).off( "blur", this.maxbyteHandler[element] );
        }

        this.maxbyteHandler[element] = function(e){
        	if( parseInt(maxbyte) < bm.string.getByte( element.value ) ){
                element.value = bm.string.cutByteUtf8( element.value, parseInt(maxbyte), "" );
            }
        }
        
        $(element).on( "keyup", this.maxbyteHandler[element] );
        $(element).blur( this.maxbyteHandler[element] );
    }

}


/**
 * @param url
 * @param data
 * @param fn
 */
bm.httpSendJsonPost = function(
    url /* url */
    , data /* object 파라미터들 */
    , fn /* complete handler */
){
    bm.httpSend( url, data, fn, "json", "post" );
}


/**

 * User: kjh
 * Date: 13. 7. 4
 * Time: 오후 2:58
 * 아래의 소스는 bluestream의 저작권이 있으므로 무단 사용 및 재 배포를 금합니다.
 */
bm.httpSend = function(
    url /* url */
    , data /* object 파라미터들 */
    , fn /* complete handler */
    , dataType /* jsonp , json, text, html, and so on : default is jsonp */
    , method /* get, post - default is get */
    , timeoutDelay /* 전송 타이머 기본 10000 밀리초 */
    , reload /* reload 여부. 기본값 : false */
    , isAlertMsg /* 얼럿 메시지 띄울지 여부 */
    , customAlertMsg /* 전송 성공시 얼럿 메시지 사용자 정의 */
)
{

    timeoutDelay = timeoutDelay === undefined ? 100000 : timeoutDelay;
    dataType = dataType === undefined ? 'jsonp' : dataType;
    method = method === undefined ? 'get' : method;
    isAlertMsg = isAlertMsg === undefined ? true : isAlertMsg;

    data = data || {};

    var param = bm.makeQueryString( data );

    reload = reload ? reload : false;
    Progress.ON();
    data.dataType = data.dataType ? data.dataType : "json";
    $.ajax({
        url : url
        ,dataType : dataType
        ,data : param
        ,type : method
//        ,timeout : timeoutDelay
        ,timeout : 90000
        ,success : function(msg){
            Progress.OFF();
            if( fn ) fn( msg );
            else{
                if( msg.result === true || msg.result === "true" ) {
                    if( isAlertMsg ) {
                        if( customAlertMsg ) alert( customAlertMsg );
                        else alert("정상적으로 처리되었습니다.");
                    }
                    if( reload === true || reload === "true" ) window.location.reload();
                }
                else {
                    if( isAlertMsg ) alert( "처리되지 않았습니다. 다시 시도해주세요.");
                }
            }
        }
        ,error : function( msg, t ){
            Progress.OFF();

            if( t === "timeout" ){
                alert( "시간이 경과되어 데이터를 불러오지 못했습니다. 다시 시도해주세요." );
            }else{
            	
            	if( !msg.responseText || msg.responseText == "" || msg.responseText.indexOf( "formLogin") > -1 ){
            		alert( "시스템에 장애가 발생하였습니다. 관리자에게 문의해주세요." );
            		window.top.location = WEB_ROOT+"login";
            	}else{
            		alert( "일시적으로 데이터를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요." );
            	}
            	
            }
        }
    });
}



bm.form = function( formName /* attribute name value */
    ,extraData /* 추가로 전송할 데이터. */
    ,chkList /* check 해야할 input 의 name 배열.*/
    ,compareValue /* 비교할 기본값. 기본값과 같으면 fail */
    ,invalidMsgList /* check 해야할 input 에 대응되는 fail 메시지 */
    ,onSend /* 전송 전 호출 */
    ,onSendComplete /* 전송 완료 메시지 수신 후 호출 */
    ,autoEventBind /* 자동 이벤트 바인딩 */
){
    useFormCheck = chkList && chkList.length>0 ? true : false;
    return new Form( formName, chkList, compareValue, extraData, invalidMsgList, useFormCheck ,onSend, onSendComplete, autoEventBind );
}

bm.formMultipart = function( formName /* attribute name value */
    ,extraData /* 추가로 전송할 데이터. */
    ,chkList /* check 해야할 input 의 name 배열.*/
    ,compareValue /* 비교할 기본값. 기본값과 같으면 fail */
    ,invalidMsgList /* check 해야할 input 에 대응되는 fail 메시지 */
    ,onSend /* 전송 전 호출 */
    ,onSendComplete /* 전송 완료 메시지 수신 후 호출 */
    ,autoEventBind /* 자동 이벤트 바인딩 */
){
    useFormCheck = chkList && chkList.length>0 ? true : false;
    return new FormMultipart( formName, chkList, compareValue, extraData, invalidMsgList, useFormCheck, onSend, onSendComplete, autoEventBind );
}

Form = function( formName /* attribute name value */
    ,chkList /* check 해야할 input 의 name 배열.*/
    ,compareValue /* 비교할 기본값. 기본값과 같으면 fail */
    ,extraData /* 추가로 전송할 데이터. */
    ,invalidMsgList /* check 해야할 input 에 대응되는 fail 메시지 */
    ,useFormCheck /* 폼 체크 여부 */
    ,onSend /* 전송 전 호출 */
    ,onSendComplete  /* 전송 완료 메시지 수신 후 호출 */
    ,autoEventBind /* 자동 이벤트 바인딩 */
){

    this.extraData = extraData;
    this.onSubmit = onSend; // submit 시에 콜백 핸들러. ( true / false 반환 )
    this.onSubmitComplete = onSendComplete; // submit 시에 콜백 핸들러. ( true / false 반환 )
    this.async = true; // 비동기 방식으로 처리할 것인지.
    this.confirmReturnValue = 'true'; // 성공시 리턴받아 비교할 값.
    this.confirmUrl = '';
    this.confirmMsg = '';
    this.useFormCheck = useFormCheck === undefined ? true : useFormCheck;
    this.failMsg = ''; // 통신 fail 메시지
    this.invalidMsgList = [];
    this.defaultInvalidMsg = "";
    this.onSubmitMsg = "";
    this.status = true; // 전송여부.
    this.autoEventBind = autoEventBind === undefined ? true : autoEventBind;
    chkList = chkList || [];

    var _this = this;

    this.resetForm = function( formName ){
        if( _this.form ){
            $(_this.form).find( 'input[type="submit"], input[type="image"], button[type="submit"]').off( 'click' );
        }

        _this.form = document[formName];

        if( _this.autoEventBind  ){
            $(_this.form).find( 'input[type="submit"], input[type="image"], button[type="submit"]').on( 'click', function(){
                if(_this.onSubmitMsg){
                    if(confirm(_this.onSubmitMsg)) return _this.start();
                    else return false;
                }else return _this.start();
            });
        }
    }


    this.resetForm( formName );


    this.cancelSubmit = function(){
        _this.status = false;
    }

    if( this.autoEventBind  ){
        $(_this.form).find( 'input[type="submit"], input[type="image"], button[type="submit"]').on( 'click', function(){
            if(_this.onSubmitMsg){
                if(confirm(_this.onSubmitMsg)) return _this.start();
                else return false;
            }else return _this.start();
        });
    }

    this.start = function( forceStart ){
    	if( !forceStart ){
    		_this.status = true;
    		if( _this.onSubmit ) _this.onSubmit();
    		if( _this.status == false ) return false;
    	}


        Progress.ON();

        var result = _this.useFormCheck === false ? true : bm.formCheck( formName, chkList, compareValue, _this.invalidMsgList, _this.defaultInvalidMsg );

        if( result && _this.async ) {

            var o = {};

            var inputList = $(_this.form).find('input, textarea, select').not('input[type="radio"], input[type="checkbox"]');
            var len = inputList.length;
            var input;
            for( var i = 0; i<len; i++ ){
                input = inputList[ i ];
                if( /submit|image/i.test( input.type ) ) continue;
                o[input.name] = input.value;
            }

            inputList = $(_this.form).find('input[type="radio"], input[type="checkbox"]');
            len = inputList.length;
            for( i = 0; i<len; i++ ){
                input = inputList[ i ];
                if( input.checked ) o[input.name] = input.value;
            }
            // [hjd-2016.10.20] 새 프레임워크에서는 아래 루틴을 사용하지 않음--------------------------------------start
            /*
            o.async = 'true';
            */
            // [hjd-2016.10.20] 새 프레임워크에서는 아래 루틴을 사용하지 않음--------------------------------------end
            if( _this.extraData ){
                for( var key in _this.extraData ) o[key] = _this.extraData[key];
            }

            _this.extraData = bm.radioAndCheckboxDefaultValueCheck( f, o );

            $.ajax({
                url : _this.form.action,
                type: "POST",
                dataType : 'json',
                data : o,
                success:function(msg){
                    Progress.OFF();
                    if( _this.onSubmitComplete ) _this.onSubmitComplete( msg );
                    if( ( Object.prototype.toString.call( msg ) == '[object String]' && msg.indexOf( _this.confirmReturnValue ) > -1 ) || msg.result == _this.confirmReturnValue ){
                        _this.confirmMsg && alert( _this.confirmMsg );
                        if( _this.confirmUrl ) window.location.href = _this.confirmUrl;
                    }else{
                        _this.failMsg && alert( _this.failMsg );
                    }
                }
                ,error : function( msg ){
                    Progress.OFF();
                    alert( "전송에러 입니다 \n statusCode : " + err.status + "\n statusText : " + err.statusText );
                    trace( msg );
                }
            });
            return false;
        }
        else {
            Progress.OFF();
            return result;
        }
    }
}


FormMultipart = function( formName /* attribute name value */
    ,chkList /* check 해야할 input 의 name 배열.*/
    ,compareValue /* 비교할 기본값. 기본값과 같으면 fail */
    ,extraData /* 추가로 전송할 데이터. */
    ,invalidMsgList /* check 해야할 input 에 대응되는 fail 메시지 */
    ,useFormCheck /* 폼 체크 여부 */
    ,onSend /* 전송 완료 후 호출 */
    ,onSendComplete /* 전송 완료 메시지 수신 후 호출 */
    ,autoEventBind /* 자동 이벤트 바인딩 */
){

    this.extraData = extraData;
    this.onSubmit = onSend; // submit 시에 콜백 핸들러. ( true / false 반환 )
    this.onSubmitComplete = onSendComplete; // submit 시에 콜백 핸들러. ( true / false 반환 )
    this.async = true; // 비동기 방식으로 처리할 것인지.
    this.confirmReturnValue = 'true'; // 성공시 리턴받아 비교할 값.
    this.confirmUrl = '';
    this.confirmMsg = '';
    this.useFormCheck = useFormCheck === undefined ? true : useFormCheck;
    this.failMsg = ''; // 통신 fail 메시지
    this.invalidMsgList = invalidMsgList || [];
    this.defaultInvalidMsg = "";
    this.onSubmitMsg = "";
    this.status = true; // 전송여부.
    this.isReady = true;
    this.autoEventBind = autoEventBind === undefined ? true : autoEventBind;

    this.onProgress = null;
    
    chkList = chkList || [];

    this.tempList = [];
    this.tempNameList = [];

    var _this = this;



    this.resetForm = function( formName ){
        if( _this.form ){
            $(_this.form).find( 'input[type="submit"], input[type="image"], button[type="submit"]').off( 'click' );
        }

        _this.form = document[formName];

        if( _this.autoEventBind  ){
            $(_this.form).find( 'input[type="submit"], input[type="image"], button[type="submit"]').on( 'click', function(){
                if(_this.onSubmitMsg){
                    if(confirm(_this.onSubmitMsg)) return _this.start();
                    else return false;
                }else return _this.start();
            });
        }
    }



    this.resetForm( formName );



    this.cancelSubmit = function(){
        _this.status = false;
    }



    this.start = function(forceStart){
    	if( !forceStart ){
    		_this.status = true;
    		if( _this.onSubmit ) _this.onSubmit();
    		
    		if( _this.status == false ) return false;
    		if( _this.isReady == false ) return false; // 전송 대기상태가 아니면 막기. ( 사용자 관점 )
    	}
        _this.isReady = false;

        _this.tempList = [];
        _this.tempNameList = [];

        Progress.ON();
        var result = _this.useFormCheck === false ? true : bm.formCheck( formName, chkList, compareValue, _this.invalidMsgList, _this.defaultInvalidMsg );
        if( result && _this.async ) {

            if( _this.form.async && _this.form.async.value == 'false' ) _this.form.async.value = 'true';

            var o = {};
            if( _this.extraData ){
                for( var key in _this.extraData ) o[key] = _this.extraData[key];
            }
            _this.extraData = bm.radioAndCheckboxDefaultValueCheck( _this.form, o );
            // [hjd-2016.10.20] 새 프레임워크에서는 아래 루틴을 사용하지 않음--------------------------------------start
            /*
            var fileIndex = [];
            $(_this.form).find( '[type=file]').each( function(){
                var key = this.name;
                var isArrFile = false;
                if( key.indexOf("[") > -1 ){
                    isArrFile = true;
                    key = key.substring( 0, key.indexOf("[") );
                }
                key += "_index";

                if( !fileIndex[key] ) fileIndex[key] = 0;

                if( o[key] ) o[key] += "|";
                else  o[key] = "";
                if(this.value) {
                    o[key] += "0";                                  // 등록 파일이 있으면 "0" 담기 (신규등록/수정등록)
                } else {
                    var arrMarker = "";
                    if(isArrFile) arrMarker = "[]";
                    var tmpKey = key.substring(0, key.length-6);
                    var origId = $(_this.form).find("[name='"+ tmpKey + "_id" + arrMarker + "']:eq(" + fileIndex[key] + ")").val();  // 원래 파일 id
                    if(origId != null && origId != "" && origId > 0) {
                        o[key] += origId;                                 // 등록 파일이 없고, 원래 파일 id가 있으면 원래 파일 id 담기 (원래파일있고, 수정/삭제하지 않은 경우)
                    } else {
                        o[key] += " ";                                  // 등록 파일도 없고, 원래 파일 ID도 없으면 공백 (" ") 담기 (원래파일,신규파일 모두 없거나, 원래파일이 있었는데 삭제한경우)
                    }

                    _this.tempNameList.push( $(this).attr( 'name' ) );
                    $(this).attr( 'name', "temp_userfile[]" );
                    _this.tempList.push( this );
                }

                fileIndex[key]++;
            });

            o["async"] = "true";
            */
            // [hjd-2016.10.20] 새 프레임워크에서는 아래 루틴을 사용하지 않음--------------------------------------end
            $(_this.form).ajaxForm( {
                data : o,
                dataType : 'json',
                uploadProgress: function(event, position, total, percentComplete) {
                	
                	if( _this.onProgress ){ 
                		_this.onProgress( event, position, total, percentComplete );
                	}
                },
                complete : function(msg){
                    Progress.OFF();

                    msg = msg.responseText; // ajaxForm 에서는 이곳에 return value 를 넣어준다.
                    if( msg.indexOf( "{") == 0 ){
                        msg = $.parseJSON(msg);
                    }

                    var len = _this.tempList.length;
                    for( var i=0; i<len; i++ ){
                        $(_this.tempList[i]).attr( 'name', _this.tempNameList[i] );
                    }

                    _this.isReady = true;

                    if( _this.onSubmitComplete ) _this.onSubmitComplete( msg );
                    if( ( Object.prototype.toString.call( msg ) == '[object String]' && msg.indexOf( _this.confirmReturnValue ) > -1 ) || msg.result == _this.confirmReturnValue ){
                        _this.confirmMsg && alert( _this.confirmMsg );
                        if( _this.confirmUrl ) window.location.href = _this.confirmUrl;
                    }else{
                        _this.failMsg && alert( _this.failMsg );
                    }

                    return false;
                },
                error : function( err ){
                    Progress.OFF();
                    _this.isReady = true;
                    alert( "전송에러 입니다 \n statusCode : " + err.status + "\n statusText : " + err.statusText );
                }
            } );

            $(_this.form).submit();

            return false;
        }
        else{
            _this.isReady = true;
            Progress.OFF();
            return result;
        }
    }
}


/**
 * [chojw] 도큐먼트에 가상의 form 을 만들어 POST 방식으로 전송
 * @param url // 전송 url
 * @param param // 전송 파라미터
 */
bm.formSendPost = function( url, param ){
    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", url);
    // //input type hidden name(key) value(params[key]);
    for(var key in param) {
        var hf = document.createElement("input");
        hf.setAttribute("type", "hidden");
        hf.setAttribute("name", key);
        hf.setAttribute("value", param[key]);
        form.appendChild(hf);
    }
    document.body.appendChild(form);
    form.submit();
};


