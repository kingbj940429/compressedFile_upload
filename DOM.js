/**
 * User: kjh
 * Date: 13. 6. 27
 * Time: 오후 8:09
 * 아래의 소스는 bluestream의 저작권이 있으므로 무단 사용 및 재 배포를 금합니다.
 */

bm.__foo = document.createElement('div');

bm.html = function( str ) {
    this.__foo.innerHTML = str;
    var el = this.__foo.children[0].cloneNode(true);
    this.__foo.removeChild( this.__foo.children[0] );
    return el;
}

bm.addChild = function( element, parent ) { parent.insertBefore( element, parent.childNodes[0] ); }
bm.addChildAt = function( element, parent, index ){ parent.insertBefore( element, parent.childNodes[index] ); }



bm.dom = {
    listInterpreter : function( data, template, parentContainer, type ){
        var len = data.length;
        for( var i=0; i<len; i++ ){
            var el = $( this.convertVariables( data[i], template ) );
            this.checkAutoForm( data[i], el );
            if( el.length > 0 ) el.appendTo( parentContainer).show();
        }
    }

    ,singleInterpreter : function( data, template, parentContainer, isEmptyView, templateAppenIndex ){
        // templateAppenIndex : 렌더링된 template 이 append 될 index
        var el = $( this.convertVariables( data, template, templateAppenIndex ) ); // 변수변환

        if( el.length && el.length > 0 ) {
            this.checkAutoForm( data, el ); // binding
            el.appendTo( parentContainer).show(); // add child
            if(templateAppenIndex != undefined && templateAppenIndex > -1){
                el.insertBefore(parentContainer.children().eq(templateAppenIndex));
            }else{
                el.appendTo( parentContainer).show(); // add child
            }
        }
        else if( isEmptyView ){
            el = $( this.convertVariables( {}, template, templateAppenIndex ) ); // 변수제거
            if(templateAppenIndex != undefined && templateAppenIndex > -1){
                el.insertBefore(parentContainer.children().eq(templateAppenIndex));
            }else{
                el.appendTo( parentContainer).show(); // add child
            }
        }

        return el;
    }

    ,checkAutoForm : function( o, el ){
        el.find('[binding]').each(function(){

            var key = $(this).attr( "binding" );
            var name;

            if( o[key] === 0 || o[key] ){
                if( this.type.indexOf( "text") > -1 ){
                    $(this).val( o[key] );
                }
                else if( this.type.indexOf( "radio") > -1 ){
                    name = $(this).attr( 'name' );
                    $(el).find("input[name="+name+"]:radio[value='"+o[key]+"']").attr('checked', 'checked');
                }
                else if( this.type.indexOf( "checkbox") > -1 ){
                    name = $(this).attr( 'name' );
                    $(el).find("input[name='"+name+"']:checkbox").each(function(){
                        if( o[key].indexOf( this.value ) > -1 ){
                            $(this).attr('checked', 'checked');
                        }else{
                            // 체크박스 체크상태 리무브
                            //                            $(this).attr('checked', false);
                        }
                    });
                }
                else if( this.type.indexOf( "select" ) > -1 ){
                    this.value = o[key];
                }
            }
        });
    }

    // remove
    ,removeVariables : function( template ){
        while( template.indexOf("{{") > -1 ){
            var currIdx =  template.indexOf("{{");
            var key = template.slice( currIdx + 2 , template.indexOf("}}", currIdx) );
            template = template.replace( "{{"+key+"}}", "" );
        }
        return template;
    }

    // auto setting
    , convertVariables: function ( o, template, index ) {


        // 전부 소문자로 변환
        var originObject = o;
        o = bm.object.toKeyLowerCase( o );



        // data-wv-print 제거
        while( template.indexOf( "data-wv-print=") > -1 ){
            var currIdx =  template.indexOf("data-wv-print=");
            var lastIdx = template.indexOf("\"", currIdx + 15 )+1;
            var currentPrint = template.slice( currIdx , lastIdx );

            template = template.replace( currentPrint, template.slice( currIdx + 15, lastIdx - 1 ) );
        }


        if( o == null ) return;

        // 순번 기록
        o.index = index;

        // key : replacePattern
        // value : script
        var scriptList = {};
        var scriptStartIndex, scriptLastIndex;
        var i = 0;
        var maxCount;
        maxCount = 1000;
        while( template.indexOf("{{") > -1 ){
            if(--maxCount == 0){
                throw new Error("최대 반복 횟수를 초과하였습니다.");
            }
            var currIdx =  template.indexOf("{{");
            var key = template.slice( currIdx + 2 , template.indexOf("}}", currIdx) );
            var isRadio, compareValue, value;
            var tempKey = key;

            if( tempKey.indexOf( "::" ) > -1 ){
                tempKey = bm.string.trim( tempKey.slice( 0, tempKey.indexOf("::") ) );
            }

            if( tempKey.indexOf( "textarea:" ) == 0 ){
                // 텍스트 에어리어일 경우 <br/> 넣지 않음
                var tempKey2 = tempKey.slice( 9 , tempKey.length );
                value = this.getWvParseValue( tempKey2, o );
                template = template.replace( "{{"+key+"}}" , value ? value : "" );

            } else if( tempKey.indexOf( "src:" ) == 0 ){

                var tempKey2 = tempKey.slice( 4 , tempKey.length );
                var prefixStr = "", postfixStr="";
                if( tempKey2.indexOf( "+" ) > 0 ){
                    prefixStr = bm.string.trim( tempKey2.slice( 0, tempKey2.indexOf( "+" ) ) );
                    tempKey2 = bm.string.trim( tempKey2.slice( prefixStr.length+1, tempKey2.length ) );

                    if( tempKey2.indexOf("+") > 0 ){
                        postfixStr = bm.string.trim( tempKey2.slice( tempKey2.indexOf("+")+1, tempKey2.length ) );
                        tempKey2 = bm.string.trim( tempKey2.slice( 0, tempKey2.indexOf("+") ) );
                    }
                }

                value = this.getWvParseValue( tempKey2, o );
                template = template.replace( "{{"+key+"}}" , value ? "src='"+prefixStr+value+postfixStr+"'" : "" );

            } else if ( tempKey.indexOf( "-&gt;" ) > -1 || tempKey.indexOf( "->" ) > -1 ){

                // -> 는 속성의 키값 검색으로 처리.
                template = template.replace( "{{"+key+"}}" , this.getWvParseValue( key, o ) );
            } else if ( tempKey.indexOf( "comma:" ) == 0 ){

                var tempKey2 = tempKey.slice( 6 , tempKey.length );
                value = this.getWvParseValue( tempKey2, o );
                value = value ? bm.string.comma( value ) : "";

                template = template.replace( "{{"+key+"}}" , value );

            } else if ( tempKey.indexOf( "date:" ) == 0 ){

                var tempKey2 = tempKey.slice( 5 , tempKey.length );
                var tempKeyArr = tempKey2.split("|");

                value = this.getWvParseValue( tempKeyArr[0], o );
                if( value ){
                    function parseDate(strDate) {
                        var _strDate = strDate;
                        var _dateObj = new Date(_strDate);
                        if (_dateObj.toString() == 'Invalid Date') {
                            _strDate = _strDate.split('.').join('-');
                            _dateObj = new Date(_strDate);
                        }
                        if (_dateObj.toString() == 'Invalid Date') {
                            var _parts = _strDate.split(' ');

                            var _dateParts = _parts[0];
                            _dateObj = new Date(_dateParts);

                            if (_parts.length > 1) {
                                var _timeParts = _parts[1].split(':');
                                _dateObj.setHours(_timeParts[0]);
                                _dateObj.setMinutes(_timeParts[1]);
                                if (_timeParts.length > 2) {
                                    _dateObj.setSeconds(_timeParts[2]);
                                }
                            }
                        }

                        return _dateObj;
                    }
                    value = new Date( parseDate(value) );
                    value = ( function date2str(x, y) {
                        var z = {
                            m: x.getMonth() + 1,
                            d: x.getDate(),
                            H: x.getHours(),
                            M: x.getMinutes(),
                            S: x.getSeconds()
                        };
                        y = y.replace(/(m+|d+|H+|M+|S+)/g, function(v) {
                            return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
                        });
                        return y.replace(/(y+)/g, function(v) {
                            return x.getFullYear().toString().slice(-v.length)
                        });
                    })( value, tempKeyArr[1] );
                }else{
                    value = "";
                }

                template = template.replace( "{{"+key+"}}" , value );

            } else if ( tempKey.indexOf( "formatter:" ) == 0 ){ // 함수 호출하기 ex) {{KEY|function}} key | 함수명

                var tempKey2 = tempKey.slice( 10 , tempKey.length );
                var fnString = null;
                if( tempKey.indexOf("|") > -1 ){ // 구분자가 있을경우와 없을경우로 나눔
                    var tempKeyArr = tempKey2.split("|");
                    if( tempKeyArr[1] ) fnString = tempKeyArr[1];
                    tempKey2 = tempKeyArr[0];

                    var value2;
                    value = this.getWvParseValue( tempKey2, o );
                    if( fnString && fnString !== "" ){
                        if( fnString.indexOf(".") > 0 ){ // Object function 일경우
                            if( $.isFunction( new Function('return '+fnString) ) ){
                                var fn = new Function('a', 'b', 'c', 'd', 'e', 'return '+fnString+ '.call( window, a, b, c, d, e )' );
                                value2 = fn( index, tempKey2, value, originObject, $(template)[0] );
                            }
                        }else{
                            var fn = window[fnString];
                            if( typeof fn === "function" ){ // Global Function 일 경우
                                value2 = fn.call( window, index, tempKey2, value, originObject, $(template)[0] ); // data, KEY 에 대한 값, keyString
                            }
                        }
                    }
                    if( value2 !== null && value2 !== undefined ) value = value2;
                    template = template.replace( "{{"+key+"}}" , value );
                } else { // 구분자가 없을 경우 index, data, row 리턴
                    fnString = tempKey.slice( 10 , tempKey.length );
                    value = "";
                    if( fnString && fnString !== "" ){
                        if( fnString.indexOf(".") > 0 ){ // Object function 일경우
                            if( $.isFunction( new Function('return '+fnString) ) ){
                                var fn = new Function('a', 'b', 'c', 'return '+fnString+ '.call( window, a, b, c )' );
                                value = fn( index, originObject, $(template)[0] );
                            }
                        }else{
                            var fn = window[fnString];
                            if( typeof fn === "function" ){ // Global Function 일 경우
                                value = fn.call( window, index, originObject, $(template)[0] ); // data, KEY 에 대한 값, keyString
                            }
                        }
                    }
                    template = template.replace( "{{"+key+"}}" , value );
                }

            } else {
                // 나머지..
                if( o[tempKey] ) {
                    if (Object.prototype.toString.call(o[tempKey]) === "[object String]" ){
//                        o[tempKey] = o[tempKey].replace(/\n|\r/g, "<br/>");
                        o[tempKey] = o[tempKey].replace(/(?:\r\n|\r|\n)/g, "<br/>"); //  개행 정규식 수정 150518
                    }
                }
                var _v = this.getWvParseValue( key, o );

                if( window.version != -1 && window.version <= 8 ){
                    var preTxt = template.slice( currIdx-6, currIdx );
                    if( preTxt == "value=" ){
                        _v = '"'+_v+'"';
                    }
                }

                // kjh 2017.09.15
                _v = _v === undefined || _v === null ? "" : _v;
                //template = template.replace( "{{"+key+"}}", o[tempKey] == undefined ? "" : _v );
                template = template.replace( "{{"+key+"}}", _v );

            }
        }

        // script 에도 interpreter 처리가 필요 함
        //maxCount = 1000;
        //while( template.indexOf("<script") > -1 ){
        //	if(--maxCount == 0){
        //		throw new Error("최대 반복 횟수를 초과하였습니다.");
        //	}
        //	scriptStartIndex = template.indexOf("<script");
        //	scriptLastIndex = template.indexOf("</script>", scriptStartIndex )+"</script>".length;
        //	var scriptPosition = parseInt(Math.random()*1000)+"_"+(i++);
        //	var scriptPositionTempDom = "<div data-script-position='"+scriptPosition+"'></div>";
        //	var scriptNode = template.slice(scriptStartIndex, scriptLastIndex );
        //	scriptList[scriptPosition] = scriptNode;
        //	template = template.substring( 0, scriptStartIndex ) + scriptPositionTempDom + template.substring( scriptLastIndex );
        //}

        // 스크립트가 있을 경우 치환때문에 실행
        //if( template.indexOf( "script") > -1 ){
        //    var $template = $(template);
        //    if( $template.length > 0 ){
        //        this.replaceScriptNode($template, scriptList);
        //        return $template;
        //    }
        //}

        return template;

    }

    ,getWvParseValue : function( key, o ){
    	var originKey = key;
        key = key.toLowerCase();
        var val, originTempKey = originKey, tempKey = key;

        var isN2br = false;
        if( key.indexOf( "n2br:") == 0 ){
            tempKey = key = key.substring( 5 );
            originTempKey = originKey = originTempKey.substring(5);
            isN2br = true;
        }



        if( key.indexOf( "::" ) > -1 ){
            // 다항 switch case 처리문
            var compareList, realValList, splitVal;
            key = bm.string.trim( tempKey.slice( 0, tempKey.indexOf("::") ) );
            val = bm.string.trim( originTempKey.slice( originTempKey.indexOf("::")+2, originTempKey.length ) );
            splitVal = val.split("?");

            compareList = splitVal[0].split("|");
            realValList = splitVal[1].split("|");

            compareList = bm.string.trimList( compareList );
            realValList = bm.string.trimList( realValList );

            var len = compareList.length;
            while( len-- ){
                if( !isNaN(parseFloat( compareList[len] )) ){
                    compareList[len] = parseFloat(compareList[len]);
                }
            }

            var oVal;
            if( key.indexOf( "-&gt;" ) > -1 || key.indexOf( "->" ) > -1 ){
                // -> 로 키검색 처리.
                var keyList = key.indexOf( "-&gt;" ) > -1 ? key.split("-&gt;") : key.split("->");
                var originKeyList = originKey.indexOf( "-&gt;" ) > -1 ? originKey.split("-&gt;") : originKey.split("->");
                var len = keyList.length;
                oVal = o;
                for( var i=0; i<len; i++ ){
                    var prevOVal = oVal;
                    oVal = oVal[ bm.string.trim( keyList[i] ) ];
                    if( !oVal ){
                        oVal = prevOVal[ bm.string.trim( originKeyList[i] ) ];
                        if( !oVal ) break;
                    }
                }
                if( isN2br && oVal ){
                    if (Object.prototype.toString.call(oVal) === "[object String]" ){
                        oVal = oVal.replace(/(?:\r\n|\r|\n)/g, "<br/>");
                    }
                }

            }else{
                oVal = o[key];
            }

            // 비교를 위해 문자열로 치환함.
            if( Object.prototype.toString.call( oVal ) === "[object Boolean]" ){
                if( oVal ) oVal = "true";
                else oVal = "false";
            }else if( oVal === null ){ // value값이 null 일때 문자열로 치환
                oVal = "null";
            }
            var realValIndex = compareList.indexOf( oVal );
            val = realValList[ realValIndex ];

            if( val !== 0 && !val ){
                if( val == undefined && !isNaN(parseFloat( oVal )) ){
                    val = realValList[ compareList.indexOf( parseFloat( oVal ) ) ];
                }
                if( val == undefined && compareList.indexOf( "~" ) > -1 && oVal !== undefined ){ // 키가 없진 않은데, ~ 가 있다면..  ~ 의 index에 해당하는 값으로 매핑.
                    val = realValList[ compareList.indexOf( "~" ) ];
                }
                if (val == undefined && splitVal[2] ){ // 여전히 val 은 undefined 이고, ? 가 하나 더있는,,, undefined 용 값이 있었다면.. ( 즉, 키가 없는 경우 대비를 했다면 )
                    if( oVal ) val = oVal; // 그런데 object 에 값이 있었다면, 값으로 반환
                    else val = splitVal[2]; // 값도 없는 완전 undefined 라면, 대응되는 값으로 반환.
                }
                if (val == undefined && compareList.indexOf( "~" ) > -1 ){ // 여전히 val 은 undefined 이고, ~ 아무거나 가 있으면
                    val = realValList[ compareList.indexOf( "~" ) ];
                }
                if (val == undefined ){ // 만약 검색에 걸리는 값이 없으면
                    val = oVal; // 원래 key 로 값을 찾아 반환
                    if( val == undefined ) val = ""; // 그조차 없으면 빈값 반환
                }
            }

        }else if( key.indexOf( "-&gt;" ) > -1 || key.indexOf( "->" ) > -1 ){
            // -> 로 키검색 처리.
            var keyList = key.indexOf( "-&gt;" ) > -1 ? key.split("-&gt;") : key.split("->");
            var len = keyList.length;
            val = o;
            for( var i=0; i<len; i++ ){
                val = val[ bm.string.trim( keyList[i] ) ];
                if( !val ) break;
            }

            if( isN2br && val ){
                if (Object.prototype.toString.call(val) === "[object String]" ){
                    val = val.replace(/(?:\r\n|\r|\n)/g, "<br/>");
                }
            }

        }else{
            // 기타
            val = o[$.trim(key)];
        }


        return ( val == undefined || val == null ) ? "" : val;
    }



    ,getValueByFormElement : function( el, searchContainer ){
        var value, name;
        //el = el.length && el.context ? el[0] : el;
        //el.context 가 undefined 가 나와서 아래처럼 수정 [chojw]
        el = el instanceof jQuery && el.length > 0 ? el[0] : el;
        if( el.type.indexOf( "text") > -1
            || el.type.indexOf("hidden") > -1 ){
            value = $(el).val();
        }else if( el.type.indexOf( "radio") > -1 ){
            name = $(el).attr('name');
            value = $( searchContainer ).find( "input[name='"+name+"']:checked").val();
        }else if( el.type.indexOf( "select") > -1 ){
            value = $(el).val();
        }else if( el.type.indexOf( "checkbox" ) > -1 ) {
            name = $(el).attr('name');
            if( $("[name='"+name+"']:checked").length > 0 ){
                value = "";
                $("[name='"+name+"']:checked").each( function(){
                    if( value != "" ) value += ",";
                    value += $(this).val();
                })
            }else{
                // 기본값이 설정되어 있을 경우
                if( $(el).attr( "data-wv-nocheck-value" ) !== undefined ){
                    value = $(el).attr( "data-wv-nocheck-value" );
                }
            }
        }
        return value;
    }



    ,__blockSchema : null

    ,getBlockSchema : function(){

        if( this.__blockSchema == null ){
            this.__blockSchema = ( "center dir isindex noframes " +
            "address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul li dt dd" +
            "article aside details dialog figure header footer hgroup section nav" ).split(" ");
        }

        return this.__blockSchema;
    }

    ,__inlineSchema : null

    ,getInlineSchema : function(){
        if( this.__inlineSchema == null ){
            this.__inlineSchema = ( "a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd " +
            "label map noscript object q s samp script select small span strong sub sup textarea u var #text #comment " +
            "audio canvas command datalist mark meter output picture progress time wbr video ruby bdi keygen" ).split(" ");
        }

        return this.__inlineSchema;
    }

    ,isBlock : function( tagOrElement ){
        var tag;
        if( bm.type.isString( tagOrElement ) ) tag = tagOrElement;
        else tag = tagOrElement.nodeName;

        tag = tag.toLocaleLowerCase();
        var schema = this.getBlockSchema();
        if( schema.indexOf( tag ) == -1  ){
            return false;
        }else{
            return true;
        }
    }

    ,isInline : function( tagOrElement ){
        var tag;
        if( bm.type.isString( tagOrElement ) ) tag = tagOrElement;
        else tag = tagOrElement.nodeName;

        tag = tag.toLocaleLowerCase();
        var schema = this.getInlineSchema();
        if( schema.indexOf( tag ) == -1  ){
            return false;
        }else{
            return true;
        }
    }

    ,isElement : function( element ){
        if( element.nodeType !== 1 ){
            return false;
        }else{
            return true;
        }
    }

    ,isEmptyNode : function( node ){
        var t = node.nodeType;
        return (node.nodeType == 3 && $.trim( node.data ) == "") || t == 4 || t == 8 ; // Text, CDataSection or Comment
    }

    ,checkEmptyThenRemove : function( nodeOrElement ){
        var node = nodeOrElement.       nodeType == 3 ? nodeOrElement : nodeOrElement.firstChild;
        if( this.isEmptyNode( node ) ) $(nodeOrElement).remove();
    }


    ,deleteData : function( node, startIndex, endIndex ){
        var childNode = node.nodeType == 3 ? this : node.firstChild;
        if( !childNode || !childNode.nodeValue ) return;

        var str = childNode.nodeValue;
        str = str.substr( 0, startIndex ) + str.substr( endIndex , str.length );
        childNode.nodeValue = str;
    }

    ,splitNodeAt : function (node, index) {
        var newNode = $(node).clone()[0];
        this.deleteData( newNode, 0, index );

        var childNode = node.nodeType == 3 ? this : node.firstChild;
        if( childNode && childNode.nodeValue ){
            this.deleteData( node, index, childNode.nodeValue.length );
        }

        $(node).after( newNode );

        return [node,newNode];
    }


    ,getParent : function( node ){
        if( node.parentNode ) return node.parentNode;
        else{
            return node.ownerDocument.activeElement;
        }
    }

    ,findParentUntilElement : function(node){
        return this.findParentUntil( "element", node );
    }

    ,findParentUntilInline: function(node){
        return this.findParentUntil( "inline", node );
    }

    ,findParentUntilBlock : function(node){
        return this.findParentUntil( "block", node );
    }


    /**
     * 최초의 type 요소가 나올때까지 parent 탐색
     * @param node
     * @returns {*}
     */
    ,findParentUntil : function( type, node ){

        var body = document.body;
        var currentNode = node;

        var compareFn;
        switch( type ){
            case "block" : compareFn = this.isBlock; break;
            case "inline" : compareFn = this.isInline; break;
            case "element" : compareFn = this.isElement; break;
        }

        while( compareFn.call( this, currentNode) == false ){
            currentNode = currentNode.parentNode;

            if( currentNode === body ) {
                currentNode = body;
                break;
            }
        }

        return currentNode;
    }

    /**
     * 태그 변경.
     * @param element
     * @param tagName
     * @param attributeCopy 속성 변경 , 기본값 true
     */
    ,replaceTag : function( element, tagName, attributeCopy ){

        if( attributeCopy === undefined ) attributeCopy = true;

        var to = bm.html( "<"+tagName+"></"+tagName+">" );
        $(element).contents().each( function(){
            to.append( this );
        });

        if( attributeCopy === undefined || attributeCopy ){
            this.copyAttribute( element, to );
        }

        $(element).before( to );
        $(element).remove();

        return to;
    }

    ,wrapOuter : function( element, tag ){
        var wrapper = $(tag).insertBefore( element );
        wrapper.prepend( element );
        return wrapper[0];
    }

    ,removeTagOnChild : function( element, tag ){
        var list = $(element).find(tag);

        list.each( function(){
            var children = this.children;
            var len = children.length;
            for( var i=0; i<len; i++ ){
                $(this).before( children[0] );
            }

            $(this).remove();
        })
    }

    ,removeTagOnParent : function( element, tag ){
        var el = $(element).closest(tag)[0];
        var children, len;
        if( el ){
            children = el.children;
            len = children.length;
            for( var i=0; i<len; i++ ){
                $(el).before( children[0] );
            }
        }

        $(el).remove();
    }

    ,copyAttribute : function( from, to ){

        $.each(from.attributes, function() {
            $(to).attr(this.name, this.value);
        } );
    }

    ,replaceScriptNode : function($template, scriptList){
        // script 노드는 jquery 로 append 시 제외되므로 임시로 생성된 div 위치에 치환시킨다.
        for(var scriptPosition in scriptList){
            var div = $template.find("[data-script-position='"+scriptPosition+"']")[0];
            if(div == null) continue;

            var scriptSource = scriptList[scriptPosition];
            scriptSource = scriptSource.substring(scriptSource.indexOf(">")+1, scriptSource.lastIndexOf("</script"));

            // append
            var scriptElement = document.createElement('script');
            scriptElement.setAttribute('type', 'text/javascript');
            scriptElement.text = scriptSource;

            // div 치환
            var parentElement = div.parentElement;
            parentElement.replaceChild(scriptElement, div);
        }
    }
}