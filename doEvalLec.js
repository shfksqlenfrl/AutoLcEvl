// doEvalLec.js

var openWin = [];
var todoQueue = [];
var config = {
    score: "1",
    comment: "감사합니다."
};

// 메시지 수신
if (!window.hasListener) {
    window.hasListener = true;
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == "doEvalLec") {
            todoQueue = request.source;
            config.score = request.score || "1";
            config.comment = request.comment || "감사합니다.";
            do_evallec(todoQueue);
        }
    });
}

var check = function(y) {
    var yv = y[0];
    if (openWin[yv] && openWin[yv].document && openWin[yv].document.readyState === "complete") {
        var targetDoc = openWin[yv].document;

        // 1. 설정한 점수(value)에 해당하는 라디오 버튼 클릭
        var targetRadios = targetDoc.querySelectorAll('input[type="radio"][value="' + config.score + '"]');
        
        if (targetRadios.length > 0) {
            for (var i = 0; i < targetRadios.length; i++) {
                targetRadios[i].click();
            }

            // 2. 서술형 입력 (50자 이상 자동 채우기)
            var textareas = targetDoc.querySelectorAll('textarea');
            for (var j = 0; j < textareas.length; j++) {
                textareas[j].value = config.comment;
            }

            // 3. 제출 버튼 클릭
            var submitBtn = targetDoc.getElementById('updateStaBtn');
            if (submitBtn) {
                submitBtn.click();
                setTimeout(function() {
                    // 확인 팝업 처리
                    var confirmBtn = targetDoc.querySelector('.di_btn_conf') || targetDoc.querySelector('.ui-dialog-buttonset button');
                    if (confirmBtn) confirmBtn.click();
                    
                    setTimeout(function() {
                        openWin[yv].close();
                        y.shift();
                        do_evallec(y);
                    }, 500);
                }, 500);
            } else {
                setTimeout(function() { check(y); }, 500);
            }
        } else {
            setTimeout(function() { check(y); }, 500);
        }
    } else {
        setTimeout(function() { check(y); }, 500);
    }
}

function do_evallec(j) {
    if (!j || j.length == 0) {
        alert("모든 강의평가가 완료되었습니다.");
        chrome.runtime.sendMessage({ action: "doneEvalLec" });
        return;
    }
    var jv = j[0];
    var evalButtons = document.getElementsByClassName("writeEvl");
    
    if (evalButtons[jv]) {
        // [수정된 부분] JSON 문자열을 쿼리 스트링으로 변환
        var rawParams = evalButtons[jv].dataset.params;
        var queryString = "";

        try {
            // JSON 파싱 시도 (예: {"corseCode":"...", ...})
            var paramObj = JSON.parse(rawParams);
            
            // 객체를 "key=value&key2=value2" 형태로 변환
            var queryParts = [];
            for (var key in paramObj) {
                if (paramObj.hasOwnProperty(key)) {
                    queryParts.push(key + "=" + paramObj[key]);
                }
            }
            queryString = queryParts.join("&");
            
        } catch (e) {
            // JSON이 아니라면 기존 값 그대로 사용 (안전장치)
            console.log("파라미터가 JSON 형식이 아님, 원본 사용");
            queryString = rawParams;
        }

        // 변환된 쿼리 스트링으로 URL 생성
        var targetUrl = "";
        if(location.href.indexOf('haksa') > -1) {
             var pathParts = location.href.split('/');
             targetUrl = pathParts.slice(0, pathParts.length - 1).join('/') + "/write.do?" + queryString;
        } else {
             targetUrl = "https://portal.khu.ac.kr/haksa/clss/clss/lcEvl/write.do?" + queryString;
        }

        // 팝업 열기
        // 창 크기를 지정하면 새 탭이 아니라 '새 창(팝업)'으로 뜹니다.
        // width=900, height=800: 창 크기
        // left=100, top=100: 창이 뜨는 모니터 위치
        var windowFeatures = "width=900,height=800,left=100,top=100,scrollbars=yes,resizable=yes";
        openWin[jv] = window.open(targetUrl, "evalPopup" + jv, windowFeatures);
        
        // 팝업 로딩 체크 시작
        setTimeout(function() { check(j); }, 1000);
    } else {
        console.error("버튼을 찾을 수 없습니다: " + jv);
        j.shift();
        do_evallec(j);
    }

}

