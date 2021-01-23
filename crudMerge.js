var CrudMerge = function( op ){
    this.tablePrefix = "";

    this.bbsInfo = null;        // 게시판 정보
    this.bbsEstnField = null;   // 게시판 확장필드 리스트

    this.bmMerge = null;
    this.bmComment = null;

    this.hasPerm = false;
    this.data = null;
    this.parentData = null;           // 답글인 경우 부모글의 데이터를 조회해옴

    this.onRegistEvent = null;

    this.onLoadStart = null;
    this.onLoad = null;
    this.onComplete = null;

    this.onUpdateStart = null;
    this.onUpdateReady = null;
    this.onUpdate = null;


    this.onDeleteStart = null;
    this.onDeleteReady = null;
    this.onDelete = null;

    this.onCommentLoadStart = null;
    this.onCommentLoad = null;
    this.onCommentComplete = null;

    this.bmEditorList = {};


    this.onInsertMode = null;
    this.onUpdateMode = null;
    this.onViewMode = null;


    var _this = this;
    this.mode = "insert";
    app.ready(function(){
        _this.init( op );
    });
};


CrudMerge.prototype = {

    init : function( op ){

        this.tablePrefix = op && op.tablePrefix ? op.tablePrefix : "";

        this.bbsInfo = op && op.bbsInfo ? op.bbsInfo : null;
        this.bbsEstnField = op && op.bbsEstnField ? op.bbsEstnField : null;

        elementId = op && op.elementId ? op.elementId : "crudMerge";

        this.bmMerge = app.getWvElement( elementId );

        if( bm.getParam("mode") == "update" || bm.getParam("mode") == "view" || bm.getParam("mode") == "reply_insert" ){

            if( bm.getParam("mode") == "view" ){
                this.bmMerge.isCrudViewMode = true;
            }

            this.bmMerge.load();
        }else{
            this.bmMerge.reset();
            this.bmMerge.show();
            this.setInsertMode();
            $("input[name="+ this.tablePrefix +"seq]").val(""); // insert 이므로 SEQ 값 초기화.

            if( this.bmMerge.choiceList.length > 0 ){
                this.bmMerge.setChoice();
            }
        }

        this.bmComment = app.getWvElement('crudComment');
        if( this.bmComment ){
            this.bmComment.load();
        }


        bm.datepicker.syncDatePicker();

        this.registEvent();
    }

    ,registEvent : function(){
        var _this = this;

        $( this.bmMerge.container).on("click", ".cancel_btn", function(){
            if( confirm( "취소하시겠습니까?") ){
                history.back();
            }
        });

        /*
        $( this.bmMerge.container ).find( '[data-wv-type=choice]').each( function(){
            var id = $(this).attr( "id" );
            var choiceObj = app.getWvElement(id);
            if( _this.bmMerge.choiceList.indexOf( choiceObj ) == -1 ){
                _this.bmMerge.choiceList.push( choiceObj );
                choiceObj.bindedView = true;
            }
        });
        */


        this.bmMerge.onUpdateStart = function( formObj ){
            // 확장필드 data 세팅..
            if( $(_this.bmMerge.container).find("[data-wv-estn-field]").length > 0 ){
                var len = $(_this.bmMerge.container).find("[data-wv-estn-field]").length;
                var estnFieldDataList = [];
                for( var i=0; i<len; i++ ){
                    var container = $(_this.bmMerge.container).find("[data-wv-estn-field]")[i];
                    var type = $(container).attr('data-wv-estn-field');
                    var fieldSeq = $(container).find("input[name='bbs_estn_field_seq[]']").val();
                    var data = {};

                    data['bbs_estn_value_seq'] = $(container).find("input[name='bbs_estn_value_seq[]']").val();
                    data['bbsctt_seq'] = $("input[name='bbsctt_seq']").val();
                    data['bbs_estn_field_seq'] = fieldSeq;
                    data['bbs_estn_optn_seq'] = null;

                    // 필드 유형별 처리
                    if( type == "select" ){
                        data['bbs_estn_optn_seq'] = $(container).find("[name='estn_field_"+fieldSeq+"'] option:selected").attr('data-estn-optn-seq');
                        data['value'] = data['bbs_estn_optn_seq'] ? $(container).find("[name='estn_field_"+fieldSeq+"'] option:selected").text() : "";
                    }else if( type == "radio" ){
                        data['bbs_estn_optn_seq'] = $(container).find("[name='estn_field_"+fieldSeq+"']:checked").attr('data-estn-optn-seq');
                        data['value'] = $(container).find("[name='estn_field_"+fieldSeq+"']:checked").next('label').text();
                    }else if( type == "checkbox" ){
                        var optnSeqList = [];
                        var optnLabelList = [];
                        $(container).find("[name='estn_field_"+fieldSeq+"[]']:checked").each(function(){
                            optnSeqList.push( $(this).attr('data-estn-optn-seq') );
                            optnLabelList.push( $(this).next('label').text() );
                        })
                        data['bbs_estn_optn_seq'] = optnSeqList.join('|');
                        data['value'] = optnLabelList.join('|');
                    }else if( type == "file" || type == "image" ){
                        data['value'] = $(container).find(".file_text").val();
                    }else if( type == "editor" ){
                        data['value'] = $(container).find("[id='estn_field_"+fieldSeq+"_bmeditorEditor']")[0].innerHTML;
                    }else{
                        data['value'] = $(container).find("[name='estn_field_"+fieldSeq+"']").val();
                    }
                    data['field_ty'] = type;
                    estnFieldDataList.push( data );
                }

                _this.bmMerge.addParam({"estnFieldDataList": estnFieldDataList});
            }

            if( _this.onUpdateStart &&  _this.onUpdateStart(formObj) == false ){
                _this.bmMerge.formObject.status = false;
                return;
            }
        };

        this.bmMerge.onUpdateReady = function( formObj ) {
            if( _this.onUpdateReady &&  _this.onUpdateReady(formObj) == false ){
                _this.bmMerge.formObject.status = false;
                return;
            }

            if($('input[name="reply_title"]').val() && $('textarea[name="reply_content"]').val()) {
                var today = new Date();
                var yyyy = today.getFullYear();
                var mm = today.getMonth() + 1;
                var dd = today.getDate();
                if(dd < 10) dd = '0' + dd;
                if(mm < 10) mm = '0' + mm;
                today = yyyy + "-" + mm + '-' + dd;
                $('input[name="req_status"]').val(1);
                $('input[name="reply_reg_date"]').val(today);
            } else {
                $('input[name="reply_title"]').val('');
                $('textarea[name="reply_content"]').val('');
                $('input[name="reply_reg_date"]').val('');
                $('input[name="req_status"]').val(0);
            }
        }

        this.bmMerge.onUpdate = function( result ){
            if( _this.onUpdate &&  _this.onUpdate(result) == false ) return;

            if( result.result ){
                //history.back();

                // [HJK] insert 또는 update 된 글이 비밀글인 경우에 post로 password를 전송해줘야 하기에 입력 후 리스트 화면으로 보냄
                var paramObj = bm.getParamList();
                delete paramObj["seq"];
                paramObj["mode"] = "list";

                var url = "?" + bm.makeQueryString( paramObj, true );
                location.href = url;
            }
        };


        this.bmMerge.onDeleteStart = function( deleteProcess ){
            if( _this.onDeleteStart &&  _this.onDeleteStart() == false ) {
                _this.bmMerge.cancelDelete();
                return;
            }else{
                deleteProcess.call( this );
            }
        };

        this.bmMerge.onDeleteReady = function(result){
            if( _this.onDeleteReady &&  _this.onDeleteReady(result) == false ) {
                _this.bmMerge.cancelDelete();
                return;
            }
        };

        this.bmMerge.onDelete = function( result ){

            if( result.result ){
                var paramObj = bm.getParamList();
                delete paramObj[_this.tablePrefix + "seq"];
                paramObj["mode"] = "list";

                var url = "?" + bm.makeQueryString( paramObj, true );
                location.href = url;
            }

            if( _this.onDelete ) _this.onDelete( result );
        };



        this.bmMerge.onLoadStart = function(){
            if( _this.onLoadStart &&  _this.onLoadStart() == false ) return false;
        };

        this.bmMerge.onLoad = function(result){
            _this.data = result.data.result;

            // 확장필드 data 세팅..
            if( _this.bbsEstnField && _this.bbsEstnField.length > 0 ){
                var valueList = _this.data['value_list'] ? _this.data['value_list'] : [];
                for( var j=0; j < valueList.length; j++ ){
                    //var fieldInfo = _this.bbsEstnField.filter( obj => obj.bbs_estn_field_seq == valueList[j].bbs_estn_field_seq );
                    var fieldInfo = _this.bbsEstnField.filter(function(obj) {
                        return obj.bbs_estn_field_seq == valueList[j].bbs_estn_field_seq;
                    });

                    if( fieldInfo.length > 0 ){
                        var k = "estn_field_" + fieldInfo[0]['bbs_estn_field_seq'];
                        if( valueList[j]['value'] ) { // 입력값이 있는 경우
                            if( fieldInfo[0]['field_ty'] == "select" || fieldInfo[0]['field_ty'] == "radio" ){
                                var optnInfo = fieldInfo[0]['optn_list'].filter(function(obj) {
                                    return obj['bbs_estn_optn_seq'] == valueList[j].bbs_estn_optn_seq;
                                });
                                _this.data[k] = optnInfo[0]['optn_title'];
                            } else if(fieldInfo[0]['field_ty'] == "checkbox") {
                                var labelList = valueList[j]['value'].split('|'); // 입력 label
                                var optnSeqList = valueList[j]['bbs_estn_optn_seq'].split('|'); // 입력 옵션 seq
                                for(var i = 0, len = labelList.length; i < len; i++) {
                                    var inputEl = $('#' + k + "_" + optnSeqList[i]);
                                    _this.data[k + "_" + optnSeqList[i]] = inputEl.val();
                                }
                            } else{
                                _this.data[k] = valueList[j]['value'];
                            }
                        }
                        // value가 입력된 적 있는 필드는 estn_value_seq를 세팅하기 위해
                        _this.data['estn_field_value_seq_' + fieldInfo[0]['bbs_estn_field_seq']] = valueList[j].bbs_estn_value_seq;
                    }
                }
            }

            // 확장필드 data 세팅..
            if( _this.data['mberEstnField'] && _this.data['mberEstnField'].length > 0 ){
                var valueList = _this.data['value_list'];
                for( var j=0; j < valueList.length; j++ ){
                    //var fieldInfo = _this.bbsEstnField.filter( obj => obj.mber_estn_field_seq == valueList[j].mber_estn_field_seq );
                    var fieldInfo = _this.data['mberEstnField'].filter(function(obj) {
                        return obj.mber_estn_field_seq == valueList[j].mber_estn_field_seq;
                    });
                    var k = "estn_field_" + fieldInfo[0]['mber_estn_field_seq'];
                    if( valueList[j]['value'] ) { // 입력값이 있는 경우
                        if( fieldInfo[0]['field_ty'] == "select" || fieldInfo[0]['field_ty'] == "radio" ){
                            var optnInfo = fieldInfo[0]['optn_list'].filter(function(obj) {
                                return obj['mber_estn_optn_seq'] === valueList[j].mber_estn_optn_seq;
                            });
                            _this.data[k] = optnInfo[0]['optn_title'];
                        } else if(fieldInfo[0]['field_ty'] == "checkbox") {
                            var labelList = valueList[j]['value'].split('|'); // 입력 label
                            var optnSeqList = valueList[j]['mber_estn_optn_seq'].split('|'); // 입력 옵션 seq
                            for(var i = 0, len = labelList.length; i < len; i++) {
                                var inputEl = $('#' + k + "_" + optnSeqList[i]);
                                _this.data[k + "_" + optnSeqList[i]] = inputEl.val();
                            }
                        } else{
                            _this.data[k] = valueList[j]['value'];
                        }

                        // value가 입력된 적 있는 필드는 estn_value_seq를 세팅하기 위해
                        _this.data['estn_field_value_seq_' + fieldInfo[0]['bbs_estn_field_seq']] = valueList[j].bbs_estn_value_seq;
                    }
                }
            }

            if( _this.onLoad ) _this.onLoad(result);
        };

        this.bmMerge.onComplete =function(result){

            _this.initEmailData();
            _this.data = result.data.result;
            if( _this.data.parent_bbsctt_seq != 0 ){
                _this.parentData = _this.data.parent_data;
            }

            if( bm.getParam("mode") == "view" ){
                _this.setViewMode();
            }else if( bm.getParam("mode") == "insert" ){
                _this.setInsertMode();
            }else if( bm.getParam("mode") == "update" ){
                _this.setUpdateMode();
            }else if( bm.getParam("mode") == "reply_insert" ){
                _this.setReplyInsertMode();
            }

            if( _this.onComplete ) _this.onComplete(result);
        };


        if( this.bmComment ){


            this.bmComment.onLoadStart = function(){
                if( _this.onCommentLoadStart &&  _this.onCommentLoadStart() == false ) return;
            };

            this.bmComment.onLoad = function(result){
                if( _this.onCommentLoad &&  _this.onCommentLoad(result) == false ) return;
            };

            this.bmComment.onComplete = function( result ){
                if( _this.onCommentComplete &&  _this.onCommentComplete(result) == false ) return;

            };


            // 대댓글 달기 버튼 클릭
            $("#bmComment").on("click", ".add_comment_reply_btn", function(){
                var seq = $(this).attr("data-comment-seq");

                $("[data-comment-reply-con='"+seq+"']").show();
                $("[data-comment-reply-con='"+seq+"'] .comment_update_btn").hide();
                $("[data-comment-reply-con='"+seq+"'] .comment_reply_btn").show();
            });


            // 댓글 수정 버튼 클릭
            $("#bmComment").on("click", ".comment_edit_btn", function(){
                var seq = $(this).attr("data-comment-seq");

                $("[data-comment-reply-con='"+seq+"']").show();
                $("[data-comment-reply-con='"+seq+"'] .comment_update_btn").show();
                $("[data-comment-reply-con='"+seq+"'] .comment_reply_btn").hide();

            });


            // 댓글 삭제 버튼 클릭
            $("#bmComment").on("click", ".comment_remove_btn", function(){
                if( confirm( "댓글을 삭제하시겠습니까?") ){
                    var seq = $(this).attr("data-comment-seq");
                    if( _this.bbsInfo ){
                        // [게시판댓글]
                        crud.merge.deleteCommentBbs( seq );
                    }else{
                        crud.merge.deleteComment( seq );
                    }

                }
            })

        }

        $(this.bmMerge.container).on( 'click', '[data-wv-replybtn]', function(e){
            e.stopPropagation();

            var bbsParam = _this.bbsInfo ? "bbs_id="+ _this.bbsInfo.bbs_id +"&" : "";
            var url = "?"+ bbsParam +"mode=reply_insert";
            url += "&"+ _this.tablePrefix +"seq="+_this.data[_this.tablePrefix+'seq'];

            location.href = url;
        });

        if( this.onRegistEvent ) this.onRegistEvent();
    }


    ,setFileRegistEvent : function(){

        var _this = this;

        // 파일선택 클릭 시
        $(this.bmMerge.container).find("input[type='file']").on("change", function(event){
            var fileName = $(this).parent().find("input[type='text'].file_text");
            var val = this.value;
            val = val.substring(val.lastIndexOf("\\") + 1, val.length);
            $(fileName).val(val);
        });

        // 파일삭제 클릭 시
        $(this.bmMerge.container).find(".file_delete").on("click", function(event){
            var div = $(this).parent()[0];
            var fileName = $(div).find("input[type='text'].file_text");
            var fileInput = $(div).find("input[type='file'].file_input");
            var fileKey = $(fileInput).attr("name");
            $(fileName).val("");
            $(fileInput).val("");
            $(fileInput).replaceWith( $(fileInput).clone(true) );
            if( bm.getParam("mode") == "update" ){
                $(div).append("<input type=\"hidden\" name=\"file_delete_key[]\" value=\""+fileKey+"\" />");
            }
        });


        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    //$('#uploadThumbnailImg').attr('src', e.target.result);
                    $(input).parent().siblings().find('img[data-wv-preview]').attr('src', e.target.result);
                    $(input).parent().siblings().find('img[data-wv-preview]').show();
                }

                reader.readAsDataURL(input.files[0]);
            }
        }


        if( $(this.bmMerge.container).find("[data-wv-preview]").length > 0 ){
            $(this.bmMerge.container).find("[data-wv-preview]").each(function( i, preview ){
                var src = $(preview).attr("src");
                if( src == "" || ( src.indexOf("{{") > -1 && src.indexOf("}}") > -1 ) ){
                    $(preview).hide();
                }
            });
        }

        $(this.bmMerge.container).find('input[data-wv-preview-btn]').on('change', function() {
            ext = $(this).val().split('.').pop().toLowerCase(); //확장자
            var _this = this;
            //배열에 추출한 확장자가 존재하는지 체크
            if(ext && $.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
                window.alert('이미지 파일이 아닙니다! (gif, png, jpg, jpeg 만 업로드 가능)');
            } else if(ext == ''){
                return false;
            } else {
                file = $(this).prop("files")[0];
                blobURL = window.URL.createObjectURL(file);

                var _URL = window.URL || window.webkitURL;
                var img = new Image();

                img.src = _URL.createObjectURL(file);
                img.onload = function() {
                    $(_this).parent().siblings('.img_box').css('display', 'block');
                    $(_this).parents('.file_btn_wrap').addClass('is_file');
                    readURL(_this);
                }
            }
        });

    }



    ,setInsertMode : function(){

        this.mode = "insert";

        if( this.onInsertMode && this.onInsertMode() == false ) return;


        $("[data-wv-onlyview]").hide();
        $("[data-wv-onlyupdate]").hide();
        $("[data-wv-onlyinsert]").show();


        var _this = this;
        $(this.bmMerge.container).find("[data-wv-write-default-value]").each(function(){
            var val = $(this).attr( "data-wv-write-default-value" );
            $(this).val(val);
        });



        var _this = this;
        $(this.bmMerge.container).find("[data-wv-check-value]").each(function(){
            var val = $(this).attr( "data-wv-check-value" );

            if( val.indexOf( "{{") > -1 ){
                var key = val.slice( 2 , val.indexOf("}}") );
                val = bm.dom.getWvParseValue( key, {} );
            }

            $(_this.bmMerge.container).find("input[name='"+this.name+"']").prop("checked", false );
            $(_this.bmMerge.container).find("input[name='"+this.name+"'][value='"+val+"']").prop("checked", true);
        });

        // choice 가 있을경우 selected-value 값은 지워준다
        $(this.bmMerge.container).find("[data-wv-selected-value]").each(function(){
            $(this).attr( "data-wv-selected-value", "" );
        });

        $(this.bmMerge.container).find("[data-wv-interpreter]").show();

        _this.setFileRegistEvent();



    }

    ,setUpdateMode : function(){

        this.mode = "update";

        if( this.onUpdateMode && this.onUpdateMode() == false ) return;

        $("[data-wv-onlyview]").hide();
        $("[data-wv-onlyinsert]").hide();
        $("[data-wv-onlyupdate]").show();


        var _this = this;
        $(this.bmMerge.container).find("[data-wv-check-value]").each(function(){
            var val = $(this).attr( "data-wv-check-value" );

            if( val.indexOf( "{{") > -1 ){
                var key = val.slice( 2 , val.indexOf("}}") );
                val = bm.dom.getWvParseValue( key, _this.data );
            }

            // 멀티체크 구현으로 인해 주석처리 함 (2020.02.24 xilie)
            //$(_this.bmMerge.container).find("input[name='"+this.name+"']").prop("checked", false );
            $(_this.bmMerge.container).find("input[name='"+this.name+"'][value='"+val+"']").prop("checked", true);
        });

        // textarea 처리
        $(this.bmMerge.container).find("textarea").each(function() {
            if( $(this).hasClass("bron") ){
                // <br>태그 그대로 보여줘야하는 경우
                return;
            }
            $(this).val($(this).val().replace(/<br\s?\/?>/g,'\n'));
        });
        // file 처리
        $(this.bmMerge.container).find("input[type=file]").each(function() {
            var div = $(this).parent()[0];
            $(div).find("a:not(.file_delete)").remove();
        });
        // select 처리
        $(this.bmMerge.container).find("select[data-wv-value]").each(function() { //rsg20180411
            var _value = $(this).attr("data-wv-value");
            $(this).val(_value).prop("selected", true);

            // 커스텀 컴포넌트일 경우 자동 처리
            if( this.hasAttribute("data-wv-com") && $(this).attr("data-wv-com") == "selectbox" ){
                var id = $(this).attr("id");
                var bmSelectboxComponent = app.getWvCom(id);

                bmSelectboxComponent.val( _value );
            }
        });

        // 답글일 경우 별도 처리
        if( _this.parentData ){
            // 비밀글 여부는 부모글이 비밀글인 경우 무조건 비밀글로 등록하도록 함
            if( _this.parentData.is_secret == 1 && $("#is_secret").length > 0 ){
                $("#is_secret").prop( "checked", true );
                $("#is_secret").attr("onclick", "return false");
            }

            // 공지글 여부는 답글에서 사용하지 못함
            if( $("#is_notice").length > 0 ){
                $("#is_notice").prop( "checked", false );
                $("#is_notice").attr( "onclick", "return false" );
            }
        }

        $(this.bmMerge.container).find("[data-wv-interpreter]").show();

        _this.setFileRegistEvent();

    }

    ,setViewMode : function(){

        this.mode = "view";

        if( this.onViewMode && this.onViewMode() == false ) return;

        $("[data-wv-onlyinsert]").hide();
        $("[data-wv-onlyupdate]").hide();
        $("[data-wv-onlyview]").show();

        var _this = this;
        $(this.bmMerge.container).find("[data-wv-check-value]").each(function(){
            var val = $(this).attr( "data-wv-check-value" );

            if( val.indexOf( "{{") > -1 ){
                var key = val.slice( 2 , val.indexOf("}}") );
                val = bm.dom.getWvParseValue( key, _this.data );
            }

            // 멀티체크 구현으로 인해 주석처리 함 (2020.02.24 xilie)
            //$(_this.bmMerge.container).find("input[name='"+this.name+"']").prop("checked", false );
            $(_this.bmMerge.container).find("input[name='"+this.name+"'][value='"+val+"']").prop("checked", true);
        });

        // 멀티 체크박스 처리
        //$(this.bmMerge.container).find("[data-wv-multi-check-value]").each(function(){
        //    var val = $(this).attr( "data-wv-multi-check-value" );
        //
        //    if( val.indexOf( "{{") > -1 ){
        //        var key = val.slice( 2 , val.indexOf("}}") );
        //        val = bm.dom.getWvParseValue( key, _this.data );
        //    }
        //
        //    $(_this.bmMerge.container).find("input[name='"+this.name+"'][value='"+val+"']").prop("checked", true);
        //});


        // input text , textarea 처리
        $(this.bmMerge.container).find("input[type=text], input[type=number], textarea").each(function(){
            var spanEl = $("<span>"+$(this).val()+"</span>").insertBefore( this );
            $(this).siblings("label").remove();
            $(this).remove();
        });

        // file 처리
        $(this.bmMerge.container).find("input[type=file]").each(function() {
            var div = $(this).parent()[0];
            var fileName = $.trim( $(div).find("a:not(.file_delete)").text() );
            if( fileName == "" ) {
                div.innerHTML = "";
                return;
            }
            var fileType = fileName.split(".");
            var fileUrl = $(div).find("a:not(.file_delete)").attr("href");
            fileType = fileType[fileType.length - 1];
            if (fileType == "jpg" || fileType == "gif" || fileType == "png") {
                div.innerHTML = "<a class=\"ext_file_name file_text view\" href='"+fileUrl+"' target=\"_blank\"><img style='max-width: 300px' src='" + fileUrl + "'/></a>";
            } else {
                $(div).find("br").remove();
                $(div).find("input").remove();
                $(div).find("span").remove();
                $(div).find("label").remove();
                $(div).find("a.file_delete").remove();
                $(div).find("a").show().css({border: "none", padding: 0});
            }
        });

        // select 처리
        $(this.bmMerge.container).find("select").each(function(){

            if( this.hasAttribute("data-wv-emailgroup") ){
                $(this).remove();
                return;
            }

            var _value;

            if ( this.hasAttribute("data-wv-value") ){
                _value = $(this).attr("data-wv-value");
                $(this).val( _value ).prop("selected", true);
            }

            var label = $(this).find("option:selected").val() == "" ? "" : $(this).find("option:selected").text();

            var spanEl = $("<span>"+ label +"</span>").insertBefore( this );
            $(this).remove();
        });

        // checkbox 토글 처리.
        $(this.bmMerge.container).find("input[type=checkbox].toggle--checkbox").each(function(){

            var val = "OFF";
            if( $(this).is(":checked") ){
                val = "ON";
            }
            // if( $(this).val() == 1 || $(this).val() == "on" ){
            //     val = "ON";
            // }
            var id = $(this).attr("id");
            $("label[for="+id+"]").before( "<span>"+val+"</span>" );
            $("label[for="+id+"]").remove();
            $(this).remove();
        });

        // checkbox 처리.
        var checkedValueObj = {};
        $(this.bmMerge.container).find("input[type=checkbox]:not(.toggle--checkbox)").each(function(){
            if( !checkedValueObj.hasOwnProperty( this.name ) ){
                checkedValueObj[this.name] = [];
                $(this).closest("[data-wv-checkbox]").before( "<span class='"+ this.name.replace(/\[\]/g, "") +"_value'></span>" );
            }
            if( $(this).prop("checked") ){
                var val = $("label[for="+this.id+"]").text();
                checkedValueObj[this.name].push( val );
            }
        });
        if( Object.keys(checkedValueObj).length > 0 ){
            for( var k in checkedValueObj ){
                if( checkedValueObj[k].length > 0 ){
                    $("span."+ k.replace(/\[\]/g, "") +"_value").text( checkedValueObj[k].join(', ') );
                }
                $("span."+ k.replace(/\[\]/g, "") +"_value").siblings("[data-wv-checkbox]").remove();
            }
        }

        var _this = this;
        var _radioNameList = [];

        // radio 처리.
        $(this.bmMerge.container).find("input[type=radio]").each(function(){

            var radioList = $( _this.bmMerge.container ).find( "input[type=radio][name="+this.name+"]" );

            if( _radioNameList.indexOf( this.name ) == -1 ){
                var id = $( _this.bmMerge.container ).find( "input[type=radio][name="+this.name+"]:checked").attr("id");
                var val = $("label[for="+id+"]").length > 0 ? $("label[for="+id+"]").text() : "";
                $(this).closest("[data-wv-radiobox]").before( "<span>"+val+"</span>" );
                _radioNameList.push( this.name );
            }

            $(this).closest("[data-wv-radiobox]").remove();
        });

        // 확장필드 iframe video src 컨버팅
        $(this.bmMerge.container).find("iframe[data-wv-video-url]").each(function(){
            var orgUrl = $(this).attr("data-wv-video-url");
            if( orgUrl ){
                var vInfo = bm.parsing.getVideoInfo( orgUrl );
                //var url = vInfo.id ? "https://www.youtube.com/embed/"+vInfo.id : "";
                var url = "";
                if( vInfo.type && vInfo.id  ){
                    vInfo.type == "youtube" ? url = "https://www.youtube.com/embed/"+vInfo.id : vInfo.type == "vimeo" ? url = "https://player.vimeo.com/video/"+vInfo.id : "";
                }

                $(this).attr("src", url);
            }
        });

        // 우편번호 찾기 버튼 제거
        $("[data-wv-layout-element=weven-plugin] a.icon_search").remove();

        $(this.bmMerge.container).find("[data-wv-interpreter]").show();

    }

    ,setReplyInsertMode : function(){

        var _this = this;
        this.mode = "reply_insert";

        if( this.onReplyInsertMode && this.onReplyInsertMode() == false ) return;

        $("[data-wv-onlyview]").hide();
        $("[data-wv-onlyinsert]").hide();
        $("[data-wv-onlyupdate]").show();

        // 답글 정보 입력을 위해 form 리셋
        _this.bmMerge.reset();

        // 부모글의 필요한 정보 세팅
        $(this.bmMerge.container).find("[data-wv-reply-default-value]").each(function(){
            var val = $(this).attr( "data-wv-reply-default-value" );
            if( $(this).hasClass("toggle--checkbox") && val == 1 ){
                $(this).prop( "checked", true );
                if( $(this).attr("id") == "is_secret" ) $(this).attr("onclick", "return false");
            }else{
                $(this).val(val);
            }
        });

        $(this.bmMerge.container).find("[data-wv-interpreter]").show();

        _this.setFileRegistEvent();

    }


    // 신규 등록
    ,insertComment : function(){

        var seq = bm.getParam(this.tablePrefix + "seq");
        var content = $("#commentInsertTextArea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        // seq : 원글 seq , pseq : 대댓글 대상 댓글의 seq , odr 대댓글 대상 댓글의 순서
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", {post_seq : seq, content : content }, function(result){
            crud.merge.bmComment.load();
        })
    }

    // 수정
    ,updateComment : function( seq ){
        var content = $("[data-comment-reply-con='"+seq+"'] textarea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", {seq : seq, content : content }, function(result){
            crud.merge.bmComment.load();
        })
    }

    // 답변
    ,replyComment : function( seq, pseq, odr, depth ){
        var content = $("[data-comment-reply-con='"+seq+"'] textarea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        var post_seq = bm.getParam(this.tablePrefix + "seq");
        // seq : 원글 seq , pseq : 대댓글 대상 댓글의 seq , odr 대댓글 대상 댓글의 순서
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", {post_seq : post_seq, pseq : pseq, odr : odr, depth : depth, content : content }, function(result){
            crud.merge.bmComment.load();
        })
    }

    // 삭제
    ,deleteComment : function( seq ){
        // seq : 원글 seq , pseq : 대댓글 대상 댓글의 seq , odr 대댓글 대상 댓글의 순서
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentDeleteData.json", {seq : seq}, function(result){
            crud.merge.bmComment.load();
        })
    }

    // 수정 / 답변 코멘트 입력창 닫기
    ,closeReplyComment : function( seq ){
        $("[data-comment-reply-con='"+seq+"']").hide();
    }




    // [게시판댓글] 신규 등록
    ,insertCommentBbs : function(){
        var bbscttSeq = bm.getParam(this.tablePrefix + "seq");
        var content = $("#commentInsertTextArea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        // bbscttSeq : 원글 seq
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", { bbsctt_seq : bbscttSeq, content : content }, function(result){
            crud.merge.bmComment.load();
            $("#commentInsertTextArea").val('')
        })
    }

    // [게시판댓글] 수정
    ,updateCommentBbs : function( bbscttCmmtSeq ){
        var bbscttSeq = bm.getParam(this.tablePrefix + "seq");
        var content = $("[data-comment-reply-con='"+bbscttCmmtSeq+"'] textarea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", { bbsctt_seq : bbscttSeq, bbsctt_cmmt_seq : bbscttCmmtSeq, content : content }, function(result){
            crud.merge.bmComment.load();
        })
    }

    // [게시판댓글] 답변
    ,replyCommentBbs : function( bbscttCmmtSeq, frstBbscttCmmtSeq, cmmtSort, cmmtLevel ){
        var bbscttSeq = bm.getParam(this.tablePrefix + "seq");
        var content = $("[data-comment-reply-con='"+bbscttCmmtSeq+"'] textarea").val();
        if( $.trim( content ) == "" ) {
            alert("내용을 입력하신 후 등록해주세요.");
            return;
        }

        // bbscttSeq : 원글 seq, frstBbscttCmmtSeq : 대댓글 대상 댓글의 seq , cmmtSort 대댓글 대상 댓글의 순서
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentMergeData.json", {bbsctt_seq : bbscttSeq, frst_bbsctt_cmmt_seq : frstBbscttCmmtSeq, cmmt_sort : cmmtSort, cmmt_level : cmmtLevel, content : content }, function(result){
            crud.merge.bmComment.load();
        })
    }

    // [게시판댓글] 삭제
    ,deleteCommentBbs : function( seq ){
        var bbscttSeq = bm.getParam(this.tablePrefix + "seq");
        // seq : 원글 seq , pseq : 대댓글 대상 댓글의 seq , odr 대댓글 대상 댓글의 순서
        bm.httpSendJsonPost( WEB_ROOT + app.interfaceKey + "/commentDeleteData.json", {bbsctt_seq : bbscttSeq, bbsctt_cmmt_seq : seq}, function(result){
            crud.merge.bmComment.load();
        })
    }






    // 이메일 핸들링
    ,initEmailData : function(){
        if( $("[data-wv-emailgroup]").length > 0 ){
            $("[data-wv-emailgroup]").each( function(){
                var grpNm = $(this).attr( "data-wv-emailgroup" );
                var emailVal = $("input[name=EMAIL][data-wv-emailgroup="+grpNm+"]").val();

                if( emailVal ){
                    emailVal = emailVal.split("@");
                    $("input[name=EMAIL_ID][data-wv-emailgroup="+grpNm+"]").val( emailVal[0] );
                    $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").val( emailVal[1] );
                }
            })
        }
    }

    ,setEmailData : function( grpNm ){
        var emailId = $("input[name=EMAIL_ID][data-wv-emailgroup="+grpNm+"]").val();
        var emailDomain = $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").val();
        $("input[name=EMAIL][data-wv-emailgroup="+grpNm+"]").val( emailId + "@" + emailDomain );
    }

    ,onEmailIdChange : function( input ){
        var grpNm = $(input).attr("data-wv-emailgroup");
        var emailId = $("input[name=EMAIL_ID][data-wv-emailgroup="+grpNm+"]").val();
        var emailDomain = $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").val();
        $("input[name=EMAIL][data-wv-emailgroup="+grpNm+"]").val( emailId + "@" + emailDomain );
    }

    ,onEmailDomainChange : function( input ){
        var grpNm = $(input).attr("data-wv-emailgroup");
        var emailId = $("input[name=EMAIL_ID][data-wv-emailgroup="+grpNm+"]").val();
        var emailDomain = $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").val();
        $("input[name=EMAIL][data-wv-emailgroup="+grpNm+"]").val( emailId + "@" + emailDomain );
    }


    ,onEmailDomainSelectionChange : function( select ){
        var grpNm = $(select).attr("data-wv-emailgroup");
        var val = $(select).val();
        if( val == "" ){
            $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").attr("readonly", false);
        }else{
            $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").attr("readonly", true);
            $("input[name=EMAIL_DOMAIN][data-wv-emailgroup="+grpNm+"]").val( val );
        }

        this.setEmailData(grpNm);
    }


    // [게시판관련]
    ,isNeedPassword : function( op ){
        var password = prompt("비밀번호를 입력해주세요.");
        if( !password ) return;
        else{
            if( op.action == "delete" ){
                op.param.mode = op.action;
                op.param.password = password;
                this.bmMerge.deleteData( op );
            }else if( op.action == "update" ){
                if( password != null && password != "" ){
                    bm.httpSendFormPostByElemnt( op.url, { password : password } );
                }else{
                    location.href = op.url;
                }
            }
        }
    }

}
