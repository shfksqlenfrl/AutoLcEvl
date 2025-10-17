

chrome.extension.onMessage.addListener(function(request, sender) {
	if (request.action == "getSource") {
		request.source.forEach((value, index, array)=>{
			document.body.firstElementChild.appendChild(document.createElement('tr'))
			if(value[1]=='평가전') document.body.firstElementChild.lastElementChild.innerHTML='<td>'+value[0]+'</td>'+'<td>'+value[1]+'</td>'+'<td><input type="checkbox" name="do" value='+index+' checked></td>'
			else document.body.firstElementChild.lastElementChild.innerHTML='<td>'+value[0]+'</td>'+'<td>'+value[1]+'</td>'+'<td><input type="checkbox" name="do" value='+index+' disabled></td>'
		 })
	}

	if (request.action == "doneEvalLec") {
		chrome.tabs.reload()
	}


	if (request.action == "feedback") {
		document.querySelector("input").value=request.source
	}
})

function onWindowLoad() {
    chrome.tabs.executeScript(null, {
        file: "getSource.js"
        }, function() {
            if (chrome.extension.lastError)
                document.body.innerText = chrome.extension.lastError.message;
            });
    
    document.body.children[1].onclick=doEvalLec;
    document.body.children[2].ontoggle=feedback;
}

function doEvalLec() {
	doit=[]
	document.querySelectorAll('input[name="do"]:checked').forEach((value)=>{
		doit.push(parseInt(value.value))
		})


	chrome.tabs.executeScript(null, {
        file: "doEvalLec.js"
        }, function() {
            if (chrome.extension.lastError)
                document.body.innerText = chrome.extension.lastError.message;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {action: "doEvalLec",    source: doit});
	});
            });
}


function feedback() {
                document.querySelector("details").appendChild(document.createElement('iframe'))
                document.querySelector("details").children[2].outerHTML='<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSd3GiFnjx3JDRvz0SYhfsnbyxLdxWVqBeCnbXkZjD8cZpWxvw/viewform?embedded=true" width="640" height="549" frameborder="0" marginheight="0" marginwidth="0">로드 중…</iframe>'
                document.body.children[0].ontoggle=null
                chrome.tabs.executeScript(null, {
                        file: "feedback.js"
                        }, function() {
                            if (chrome.extension.lastError)
                                document.body.innerText = chrome.extension.lastError.message;
                            });
            }

window.onload = onWindowLoad;