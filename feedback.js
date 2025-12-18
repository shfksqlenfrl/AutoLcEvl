function feedback(document_){
ErrorHtml=document

return ErrorHtml

}
 
chrome.runtime.sendMessage({
    action: "feedback",
    source: feedback(document)
});