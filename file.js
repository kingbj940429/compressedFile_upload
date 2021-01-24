imageUtil = {

	maxSize: 2560
	,quality: 1.0
	,limitByte: 170000 //KB 기준 , 1MB = 100000KB
	,canvas: null
	,propsList: []

	,init: function () {
			var _this = this;
			_this.setProps();
			_this.registEvent();
		}

	,registEvent: function () {
			var _this = this;
			var len = $("[data-wv-encoding-img-ready]").length;

			//파일첨부할때마다
			for (var i = 0; i < len; i++) {
				(function (index) {
					$($("[data-wv-encoding-img-ready]")[index]).on("change", imageObject.prototype.onImageSelected);
				})(i);
			}
			//최종 버튼 눌렀을 떄
			$($("[data-wv-encoding-img-send]")[0]).on("click", _this.onUploadBtnClick);

		}

	,onLimitFileSize : function(e, _this){
		if (!$(_this).val()) return;
		var len = _this.files.length;
		for(var i=0;i<len;i++){
			var f = _this.files[i];
			var size = f.size || f.fileSize; //f.size가 없으면 f.fileSize가 size

			var limit = imageUtil.limitByte;
			
			if (size > limit) {
				alert(`파일용량은 ${limit/100000}MB 를 넘을수 없습니다.`);
				$($('[data-wv-encoding-img-ready]')[0]).empty();
				$(_this).val('');
				return false;
			}
			$(_this).parent().find('input[type=text]').val($(_this).val());
		}
	}

	,onUploadBtnClick: function (e) {
			var Object = imageObject.prototype;
			var len = Object.selectedFileList.length;

			for (var i = 0; i < len; i++) {
				(function (j) {
						imageUtil.compressImageByData(Object.selectedFileList[j], 1280, imageUtil.quality, function (result) {
							$($('.encoded-file-tag')[j]).val(result);
							Object.encodedFileInfo = {};
							Object.encodedFileInfo.fileData = result;
							Object.encodedFileList.push(Object.encodedFileInfo);
							if (len === j + 1) {
								imageUtil.doUpload(Object.encodedFileList, function () {
									imageUtil.destroy();
								});
							}
						});
				})(i);
			}
		}

	,doUpload: function (fileData, onComplete) {
		var len = $("[data-wv-encoding-img-ready] > input").length;
		var fileData = [];
		for (var i = 0; i < len; i++) {
			fileData.push({
				fileString: $($("[data-wv-encoding-img-ready] > input")[i]).val(),
				fileName: $($("[data-wv-encoding-img-ready] > .encoded-file-tag")[i]).attr('name')
			})
		}
		console.log(fileData);

		//form 태그에 대비하기 위한
		var form = $("[data-wv-encoding-img-send]").closest('form');
		form.encodedFiles = fileData;

		//   $.ajax({
		//       type: "POST",
		//       url: WEB_ROOT + app.interfaceKey + "/fileControl",
		//       data: {
		//     	  userfile : fileData,//여기를 리스트로 해서 서버에 뿌려주면 다중으로 가능할거 같은데...
		//     	  originalname : originalFileName
		//       },
		//       timeout: 600000,
		//       success: function (result) {
		//     	  console.log("성공");
		//       },
		//       error: function (e) {
		//       }
		//   });
		if (onComplete) {
			onComplete();
		}
	}
	/**
	 * 이미지데이터를 이용한 압축하기
	 */
	,compressImageByData: function (imgData, maxSize, quality, onComplete) {
			var _this = this;
			var img = new Image();
			img.onload = function () {
				var compressedData = _this.compressImage(img, maxSize, quality);

				if (onComplete) {
					onComplete(compressedData);
				}
			}
			img.src = imgData;
		}

	/**
	 * 이미지 압축기
	 */
	,compressImage: function (img, maxSize, quality) {

			if (!maxSize) maxSize = this.maxSize;
			if (!quality) quality = this.quality;


			var canvas = this.getCanvas();
			var width = img.width,
				height = img.height;

			if (width > height) {
				// 가로가 길 경우
				if (width > maxSize) {
					height *= maxSize / width;
					width = maxSize;
				}
			} else {
				// 세로가 길 경우
				if (height > maxSize) {
					width *= maxSize / height;
					height = maxSize;
				}
			}

			canvas.width = width;
			canvas.height = height;
			canvas.getContext("2d").drawImage(img, 0, 0, width, height);
			return canvas.toDataURL("image/jpeg", quality); //실질적으로 압축하는 코드
		}

	,setProps: function () {
			var _this = this;
			var props = $('[data-wv-encoding-img-send]').attr('data-wv-encoding-img-send');
			props = props.replace(/\}/g, "");
			props = props.replace(/\{/g, "");
			//props = props.replace(/\./g, "");
			propsList = props.split(",");

			var propsObj = {};
			for (var index in propsList) {
				var tempList = [];
				tempList = propsList[index].split(":");
				tempList[0] = tempList[0].trim();
				propsObj[tempList[0]] = tempList[1].trim();
			}
			for (var key in propsObj) {
				_this[key] = propsObj[key];
			}
			imageUtil.propsList.push(propsObj);

			if(imageUtil.propsList[0]){
				_this.quality = parseFloat(imageUtil.propsList[0].quality);	
			}
			if(imageUtil.propsList[0]){
				_this.limitByte = parseFloat(imageUtil.propsList[0].limitByte);	
			}

	}

	/**
	 * canvas 를 멤버변수로 등록하고 재활용함. 
	 */		
	,getCanvas: function () {
			if (!this.canvas) this.canvas = document.createElement("canvas");
			return this.canvas;
		}


	/**
	 * 외부에서 이미지를 리스트로 리사이즈하도록 만든 함수
	 * 사용 안함
	 */
	,resizeImageList: function (imageList) {

			var len = imageList.length;
			var compressedData;
			var replaceImg;
			while (len--) {

				compressedData = this.compressImage(imageList[len]);
				replaceImg = this.replaceImageByData(imageList[len], compressedData);
				imageList[len] = replaceImg;
			}

			return imageList;

		}


	/**
	 * 이미지 태그를 압축된 데이터의 이미지로 변환
	 * 내가 가지는 고유의 값일까?
	 * 아니다. 오브젝트 놉
	 */
	,replaceImageByData: function (img, compressedImgData) {

			var cimg = new Image();
			cimg.onload = function () {
				$(cimg).insertBefore(img);
				$(img).remove();
			}

			cimg.src = compressedImgData;
			cimg.load();

			return cimg;

		}



	/*
		var dataURLToBlob = (dataURL) => {
		var BASE64_MARKER = ";base64,";
		
		// base64로 인코딩 되어있지 않을 경우
		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			var parts = dataURL.split(",");
			var contentType = parts[0].split(":")[1];
			var raw = parts[1];
			return new Blob([raw], {
			type: contentType
			});
		}
		// base64로 인코딩 된 이진데이터일 경우
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(":")[1];
		var raw = window.atob(parts[1]);
		// atob()는 Base64를 디코딩하는 메서드
		var rawLength = raw.length;
		// 부호 없는 1byte 정수 배열을 생성 
		var uInt8Array = new Uint8Array(rawLength); // 길이만 지정된 배열
		let i = 0;
		while (i < rawLength) {
			uInt8Array[i] = raw.charCodeAt(i);
			i++;
		}
		return new Blob([uInt8Array], {
			type: contentType
		});
		};*/

	,removeEvent: function () {

		}

	,destroy: function () {
		imageObject.prototype.encodedFileInfo = null;
		imageObject.prototype.selectedFileList = [];
		imageObject.prototype.encodedFileList = [];
		this.propsList = [];
		var len = $('[data-wv-encoding-img-ready]').length;
		for(var i=0;i<len;i++){
			$($('[data-wv-encoding-img-ready]')[i]).val("");
		}
		
	}

}

var imageObject = function () {

}

imageObject.prototype = {
	selectedFileList: []
	,encodedFileInfo: {}
	,encodedFileList: []
	,onImageSelected: function (e) {
		var _this = this;
		imageUtil.onLimitFileSize(e, _this);
		var inputField = e.target; // 첫번째 ready 태그 가져오고
		var files = inputField.files; //그에 대한 파일을 담는다.

		imageObject.prototype.destroy(inputField);
		$.each(files, function (index, file) { //파일첨부가 여러개일때에 대한.
			var reader = new FileReader();
			reader.onload = function (e) {
				imageObject.prototype.selectedFileList.push(e.target.result);
				$(inputField).append(`<input class="encoded-file-tag" style="hidden" value="${e.target.result}" name="${file.name}">`);
			}
			reader.readAsDataURL(file);
		})
	}

	,destroy : function(inputField){
		$(inputField).empty();
	}

}


$(function () {
	imageUtil.init();
})