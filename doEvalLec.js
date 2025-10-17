openWin=[]

var check= function(y) {
yv=y[0]
if(openWin[yv]!=null)
{
if(openWin[yv].document.getElementsByClassName('radio').length >= 45) 
{
for (let i=0; i<=openWin[yv].document.getElementsByClassName('radio').length/5-1; i++)
openWin[yv].document.getElementsByClassName('radio')[i*5].click();
openWin[yv].document.getElementsByClassName("last first")[8].firstElementChild.value="                                                  ";
openWin[yv].document.getElementById('updateStaBtn').click();
openWin[yv].document.getElementsByClassName("di_btn_conf ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only")[0].click();
openWin[yv].close();
y.shift()
if(y.length==0) {
	chrome.extension.sendMessage({action: "doneEvalLec"})
	location.reload()
	return
	}
do_evallec(y)
}
else 
setTimeout(function(){check(y);}, 200); 
}
else
setTimeout(function(){check(y);}, 200); 
}


function do_evallec(j){
	
	if(todo.length==0) {
	chrome.extension.sendMessage({action: "doneEvalLec"})
	location.reload()
	return
	}
	jv=j[0]
	str=document.getElementsByClassName("writeEvl")[jv].dataset.params
	
	openWin[jv] = window.open("https://portal.khu.ac.kr/haksa/clss/clss/"+location.href.split('/')[6]+"/write.do?corseCode="+str.split("\"")[3]+"&lessnSyy="+str.split("\"")[7]+"&lessnSemstCode="+str.split("\"")[11]+"&corseSchdlAt="+str.split("\"")[15]);
	openWin[jv].onload=check(j);
	
	
}


r=document.getElementsByTagName('tHead')[0].firstElementChild.cells
Q=r.length
for(i=0; i<Q; i++) if (r[i].innerText=='상태') {r=i; break}

chrome.extension.onMessage.addListener(function(request, sender) {
	todo=request.source
	if (request.action == "doEvalLec") do_evallec(todo)
})