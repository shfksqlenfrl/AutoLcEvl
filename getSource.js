function get_source(document_){
alllec=[]
row=document.getElementsByTagName('tbody')[0].rows

for(i=0; i<row.length; i++) alllec.push([row[i].cells[2].innerText, row[i].cells[9].innerText])

return alllec
}
 
chrome.extension.sendMessage({
    action: "getSource",
    source: get_source(document)
});