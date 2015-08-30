// ==UserScript==
// @name        rEurope filtered
// @namespace   https://github.com/iSnow
// @description Kill shit with fire
// @include     http://*.reddit.com/r/europe/*
// @include     https://*.reddit.com/r/europe/*
// @version     1
// @grant       none
// ==/UserScript==

(function () {
	injectStyles();
	
	var body = document.getElementsByTagName('body')[0];
	var classes = body.className;	
	var tBody = document.querySelector(".spacer>.titlebox");
	//load only on overview page, not individual threads
	if ((tBody != undefined) && (classes.indexOf('listing-page')>-1)) {
		//localStorage.clear();
		reuropeFilter();
		var fContainer = document.createElement("div");
		fContainer.style.border = "1px solid #DBDADA";
		fContainer.innerHTML = getrEuropeDialogHtml();
		// attach our container div
		var hl  = tBody.getElementsByTagName('h1')[0];
		tBody.insertBefore(fContainer, hl);
		// add click handlers to cancel btn
		var okBtn = document.getElementById("reurope-addfilter");
		okBtn.addEventListener("click", reuropeAddFilter, false);
		// add click handlers to cancel btn
		var cBtn = document.getElementById("reurope-cancel");
		cBtn.addEventListener("click", reuropeCancel, false);
		var fList = document.createElement("ul");
		fList.id = "reurope-filters";
		fContainer.appendChild(fList);
		// make sure user can click OK only after entering a name
		document.getElementById("reurope-filtername").addEventListener("input", reuropeWatchdog, false);
		var addBtn = document.createElement("button");
		addBtn.innerHTML = 'Add Filter';
		addBtn.addEventListener("click", reuropeShowFilterDiag, false);
		addBtn.style.marginLeft = '2px';
		fContainer.insertBefore(addBtn, fList);
		reuropeRestoreFilterList();
	}

	
	function getrEuropeDialogHtml() {
		var cHtml = '<div id="reurope-dialog" ';
		cHtml += 'style="position: fixed; left: 0; right: 0; top: 0; bottom: 0; ';
		cHtml += 'background: rgba(0, 0, 0, 0.2); display: none;" ';
		cHtml += '>';
		cHtml += '<div id="reurope-dialog-inner" ';
		cHtml += 'style="position: absolute; left: auto; right: auto; background: white; ';
		cHtml += 'min-width: 30em; min-height: 20em; top: 10em; width: 30%; padding: 2em; ';
		cHtml += 'border-radius: 6px; border: 3px solid #4553A0; background: #f5f5f5; " ';
		cHtml += '>';
		cHtml += '<h3>Add a new filter definition</h3>';
		cHtml += '<table><tr><td>Filter name</td><td><input id="reurope-filtername" type="text"></td></tr>';
		cHtml += '<tr><td>Filter value</td><td><input id="reurope-filterval" type="text"></td></tr>';
		cHtml += '<tr><td>Filter color</td><td><input id="reurope-filtercol" type="text"></td></tr>';
		cHtml += '</table>';
		cHtml += '<button disabled id="reurope-addfilter">OK</button><button id="reurope-cancel">Cancel</button>';
		cHtml += '</div>';
		return cHtml;
	}
} () );

function reuropeWatchdog() {
	var okBtn = document.getElementById("reurope-addfilter");
	okBtn.removeAttribute("disabled"); 
}

function reuropeShowFilterDiag() {
	var fDiag = document.getElementById("reurope-dialog");
	fDiag.style.display = 'block';
}

function reuropeAddFilter() {
	var filter = {};
	filter.id = 'reurope-filter-'+new Date().getTime();
	filter.name = document.getElementById("reurope-filtername").value;
	//filter.color = document.getElementById("reurope-filtercol").value;
	filter.color = reuropeGetFilterColor (document.getElementById("reurope-filtercol").value, reuropeGetFilterIds().length+1);
	filter.expression = document.getElementById("reurope-filterval").value;
	reuropeAppendFilterToList(filter);
	
	document.getElementById("reurope-dialog").style.display = 'none';
	localStorage.setItem(filter.id, JSON.stringify(filter));
	reuropeFilter();
}

function reuropeRestoreFilterList() {
	var fIds = reuropeGetFilterIds();
	for (var i = 0; i < fIds.length; i++) {
		var filter = JSON.parse(localStorage.getItem(fIds[i]));
		console.log (filter);
		reuropeAppendFilterToList(filter, i);
	}
}

function reuropeAppendFilterToList(filter, numFilters) {
	var fList = document.getElementById("reurope-filters");
	var fBtn = document.createElement("div");
	fBtn.className = 'reurope-filter';
	fBtn.id = filter.id;
	fBtn.innerHTML = '<div class="screen active"><span class="reurope-removebtn"><span>x</span></span><span>'+filter.name+'</span></div>';
	fList.appendChild(fBtn);
	fBtn.addEventListener("click", reuropeToggleFilterState, false);
	var removeBtn = document.querySelector("#"+filter.id+">.screen>.reurope-removebtn");
	removeBtn.addEventListener("click", reuropeRemoveFilter, false);
	var color = reuropeGetFilterColor (filter.color, numFilters);
	var expr = '';
	fBtn.style.background = '#'+color;
}

function reuropeRemoveFilter(event) {
	var node = event.target.parentNode;
	var filterId = node.id;
	localStorage.removeItem(filterId);
	node.parentNode.removeChild(node);
	event.stopPropagation();
	reuropeFilter();
}

function reuropeToggleFilterState(event) {
	var node = event.target.parentNode;
	var classes = node.className;	
	if (classes.indexOf('active')>-1) {
		node.className = node.className.replace(/\bactive\b/,'');
	} else {
		node.className = node.className+' active';
	}
	reuropeFilter();
}

function reuropeFilter() {
	console.log ('reuropeFilter');
}

function reuropeCancel() {
	console.log ('cancel');
	var fDiag = document.getElementById("reurope-dialog");
	fDiag.style.display = 'none';
}


function reuropeGetFilterIds() {
	var ids = [];
	for (var i = 0; i < localStorage.length; i++) {
		var key = localStorage.key(i);
		if (key.indexOf('reurope-filter-') == 0)
			ids.push (localStorage.key(i));
	}
	ids.sort();
	return ids;
}

function reuropeGetFilterColor (color, index) {
	console.log ("color: "+color);
	console.log ("index: "+index);
	cols = reuropeColors();
	if (!color) {
		color = cols[0];
		if (index < cols.length) {
			color = cols[index];
		}
	}
	console.log ("color: "+color);
	return color;
}

function reuropeColors() {
	var cols = ['d8e650', 'c8467d', '6242a0', 'ead652', 'eabe52', '377a93', 'ea6c51', '99d64a'];
	return cols;
}

function injectStyles() {
	var head = document.getElementsByTagName('head')[0];
	if (head) {
		var style = ".reurope-filter {";
		style += "display: inline-block; \n";
		style += "border: medium; \n";
		style += "color: #FFF;\n";
		style += "height: 30px; \n";
		style += "margin: 5px 5px 5px 2px; \n";
		style += "cursor: pointer; \n";
		style += "font-size: 13px; \n";
		style += "font-family: arial,helvetica,sans-serif; \n";
		style += "border-radius: 2px; \n";
		style += "} \n";
		style += ".reurope-filter>.screen {";
		style += "background: rgba(0, 0, 0, 0.2); \n";
		style += "padding: 8px 6px 6px 6px;\n";
		style += "} \n";
		style += ".reurope-filter>.screen.active {";
		style += "background: transparent; \n";
		style += "} \n";
		style += ".reurope-filter>.screen>span {";
		style += "display: inline-block; \n";
		style += "position: relative; \n";
		style += "top: -0.1em; \n";
		style += "} \n";
		style += ".reurope-filter>.screen>.reurope-removebtn {";
		style += "background: rgba(0, 0, 0, 0.2); \n";
		style += "margin-right: 0.3em;  \n";
		style += "top: 0; \n";
		style += "width: 1.1em;  \n";
		style += "height: 1.1em; \n";
		style += "border-radius: 0.55em; \n";
		style += "} \n";
		style += ".reurope-filter>.screen>.reurope-removebtn>span {";
		style += "display: block; \n";
		style += "position: relative; \n";
		style += "top: -0.13em; \n";
		style += "left: 0.27em; \n";
		style += "color: rgba(255, 255, 255, 0.3); \n";
		style += "font-weight: 700 \n";
		style += "} \n";
		
		var sContainer = document.createElement("style");
		sContainer.type = 'text/css';
		sContainer.appendChild(document.createTextNode(style));
		head.appendChild (sContainer);
	}
}