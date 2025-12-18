// getSource.js
function get_source(document_){
    var alllec = [];
    var rows = document.getElementsByTagName('tbody')[1].rows;
    for(var i=0; i<rows.length; i++) {
        // 셀 인덱스는 사이트 구조에 따라 다를 수 있음 (기존 코드 유지)
        alllec.push([rows[i].cells[2].innerText, rows[i].cells[9].innerText]); 
    }
    return alllec;
}
 
// extension -> runtime 변경 권장
chrome.runtime.sendMessage({
    action: "getSource",
    source: get_source(document)
});