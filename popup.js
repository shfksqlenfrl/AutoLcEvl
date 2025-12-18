// popup.js (Manifest V3 대응)

// 1. 메시지 수신 (강의 목록 받아오기 등)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getSource") {
        var listBody = document.getElementById('lecture-list');
        listBody.innerHTML = ""; // 초기화

        if (!request.source || request.source.length === 0) {
            listBody.innerHTML = "<tr><td colspan='3'>강의 목록을 찾을 수 없습니다.</td></tr>";
            return;
        }

        request.source.forEach((value, index) => {
            var tr = document.createElement('tr');
            var checkboxHtml = '';
            
            // '완료' 텍스트가 포함되지 않은 경우에만 체크박스 활성화
            if (value[1].indexOf('완료') === -1) {
                checkboxHtml = `<input type="checkbox" name="do" value="${index}" checked>`;
            } else {
                checkboxHtml = `<input type="checkbox" name="do" value="${index}" disabled>`;
            }

            tr.innerHTML = `<td>${value[0]}</td><td>${value[1]}</td><td>${checkboxHtml}</td>`;
            listBody.appendChild(tr);
        });
    }

    if (request.action == "doneEvalLec") {
        alert("모든 작업이 완료되었습니다.");
        chrome.tabs.reload();
        window.close();
    }

    if (request.action == "feedback") {
        document.querySelector("input").value = request.source;
    }
});

// 2. 윈도우 로드 시 실행 (강의 목록 가져오기)
function onWindowLoad() {
    // 현재 활성화된 탭 찾기
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length === 0) return;
        var currentTabId = tabs[0].id;

        // V3 방식: scripting API 사용
        chrome.scripting.executeScript({
            target: { tabId: currentTabId },
            files: ["getSource.js"]
        }, function() {
            if (chrome.runtime.lastError) {
                document.body.innerText = "강의평가 페이지에서 실행해주세요.\n" + chrome.runtime.lastError.message;
            }
        });
    });

    // 버튼 이벤트 연결
    document.getElementById('executeBtn').onclick = doEvalLec;
    document.querySelector('details').ontoggle = feedback;
}

// 3. 실행 버튼 클릭 시 로직
function doEvalLec() {
    var doit = [];
    document.querySelectorAll('input[name="do"]:checked').forEach((checkbox) => {
        doit.push(parseInt(checkbox.value));
    });

    if (doit.length === 0) {
        alert("선택된 강의가 없습니다.");
        return;
    }

    var score = document.getElementById('scoreSelect').value;
    var comment = document.getElementById('commentText').value;

    if (!comment.trim()) {
        comment = "한 학기 동안 열정적인 강의 감사합니다. 수업 내용이 매우 알차고 유익하여 많은 것을 배울 수 있었습니다.";
    }
    while (comment.length < 50) {
        comment += " " + comment;
    }

    // 현재 탭에 스크립트 주입 및 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTabId = tabs[0].id;

        // V3 방식: doEvalLec.js 주입
        chrome.scripting.executeScript({
            target: { tabId: currentTabId },
            files: ["doEvalLec.js"]
        }, function() {
            if (chrome.runtime.lastError) {
                alert("스크립트 실행 실패: " + chrome.runtime.lastError.message);
                return;
            }
            
            // 주입 완료 후 메시지로 설정값 전달
            chrome.tabs.sendMessage(currentTabId, {
                action: "doEvalLec",
                source: doit,
                score: score,
                comment: comment
            });
        });
    });
}

function feedback() {
    var details = document.querySelector("details");
    if (!details.querySelector('iframe')) {
        details.appendChild(document.createElement('iframe'));
        details.children[2].outerHTML = '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSd3GiFnjx3JDRvz0SYhfsnbyxLdxWVqBeCnbXkZjD8cZpWxvw/viewform?embedded=true" width="100%" height="500" frameborder="0">로드 중…</iframe>';
    }
    document.querySelector("details").ontoggle = null;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["feedback.js"]
        });
    });
}

window.onload = onWindowLoad;