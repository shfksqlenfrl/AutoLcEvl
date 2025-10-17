function feedback(document_){
ErrorHtml=document

return ErrorHtml

}
 
chrome.extension.sendMessage({
    action: "feedback",
    source: feedback(document)
});