var imageObject = {
    onImageSelected: function (e) {
		imageUtil.setProps(e.target);
		//imageUtil.selectedFileList.length = 0;
		var inputField = e.target; // 첫번째 ready 태그 가져오고
		var files = inputField.files; //그에 대한 파일을 담는다.
		$.each(files, function (index, file) { //파일첨부가 여러개일때에 대한.
			var reader = new FileReader();
			reader.onload = function (e) {
				console.log("파일 사이즈 : " + file.size , "허용치 : " + parseInt(imageUtil.propsList[0].permitByte));
				// if(parseInt(imageUtil.propsList[index].permitByte) < file.size){
				// 	alert("허용 파일 크기를 초과했습니다.");
				// 	console.log(inputField);
				// 	$(inputField).val("");
				// 	return false;
				// }
				imageUtil.selectedFileList.push(e.target.result);
				imageUtil.selectedFileNameList.push(file.name);
			}
			reader.readAsDataURL(file);
		})
	}
}

