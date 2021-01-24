callBack = {
	unknownParam : undefined

	, init : function(){
		var _this = this;
		_this.registEvent();
	}

	,registEvent : function(){
		var _this = this;

		_this.firstFunc(function(result){
			console.log(result);//반드시 첫번째 함수 바로 뒤에 출력되어야 합니다.
		});

		_this.secondFunc();//두번째 함수입니다.

		_this.thirdFunc();//세번째 함수입니다.
	}
	// ,firstFunc : function(){
	// 	var _this = this;
	// 	console.log("첫번째 함수입니다.");
	// 	_this.unknownParam = "알려진 인자입니다.";
	// }
	,firstFunc : function(onComplete){
		console.log("첫번째 함수입니다.");
		console.log(callBack.unknownParam); //undefined
		if(onComplete){
			onComplete(callBack.unknownParam);
		}
	}

	,sideFunc : function(onComplete){
		console.log(sideParams);
		if(onComplete){
			onComplete("사이드 콜백함수입니다.");
		}
	}

	,secondFunc : function(){
		console.log("두번째 함수입니다.");
	}

	,thirdFunc : function(){
		console.log("세번째 함수입니다.");
	}

	,removeEvent : function(){
		console.log("모든 이벤트 리스너 제거하는 객체  함수입니다.");
	}
	
	,destroy : function(){
		console.log("다 off 해버립니다.");
	}

}


$(function () {
	callBack.init();
})