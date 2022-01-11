"user strict";

var browser_main;
var main_content;

const METADATA_JSON = "metadata.json";

async function load_content(){
	//Load
	var rq = await fetch(METADATA_JSON);
	if(rq.ok == false){
		throw "Couldn't fetch " + METADATA_JSON + "<br>" + "HTTP Status: " + String(rq.status);
	}
	return (await rq.json());
}

function change_tab(obj, tab){
	//Activate button
	var top_buttons = obj.parentElement.children;
	for(var i=0; i<top_buttons.length; i++){
		top_buttons[i].classList = "top_button";
	}
	obj.classList = "top_button top_button_active";

	//Activate tab
	var tabs = document.getElementById("tabs").children;
	for(var i=0; i<tabs.length; i++){
		tabs[i].style.display = "none";
	}
	document.getElementById(tab).style.display = "block";
}

async function browser_load(){
	//Switch to the 1st tab
	document.getElementById("top_tabs").children[0].click();

	//DB
	main_content = (await load_content());
	
	browser_main = new Browser(document.getElementById("browse_tab"), main_content);
	browser_main.array_reload();
	
	//Stop loading
	document.getElementById("loading").style.display = "none";
}

