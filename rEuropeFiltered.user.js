// ==UserScript==
// @name        rEurope filtered
// @namespace   https://github.com/iSnow
// @description Kill shit with fire
// @include     http://*.reddit.com/r/europe/*
// @include     https://*.reddit.com/r/europe/*
// @version     2
// @grant       none
// ==/UserScript==

// is run on every page reload
(function () {
	injectStyles();
	
	var body = document.getElementsByTagName('body')[0];
	var tBody = document.querySelector(".spacer>.titlebox");
	//load only on overview page, not individual threads
	if ((tBody) && (body.className.indexOf('listing-page')>-1)) {
		//localStorage.clear();
		//reuropeDumpFilters();
	
		var fContainer = reuropeCreateFilterContainer(tBody);
		
		// create and add click handlers to OK btn
		var okBtn = document.getElementById("reurope-addfilter");
		okBtn.addEventListener("click", reuropeAddFilter, false);
		
		// create and add click handlers to cancel btn
		var cBtn = document.getElementById("reurope-cancel");
		cBtn.addEventListener("click", reuropeCancel, false);
		
		// make sure user can click OK only after entering a name
		document.getElementById("reurope-filtername").addEventListener("input", reuropeWatchdog, false);
		
		var headline = document.getElementById("reurope-filters-line");
		var addBtn = document.createElement("button");
		addBtn.innerHTML = 'Add Filter';
		addBtn.addEventListener("click", reuropeShowFilterDiag, false);
		addBtn.style.marginLeft = '2px';
		headline.appendChild(addBtn);
		
		// add filter count area
		var cntArea = document.createElement("span");
		cntArea.style.margin = '5px 5px 5px 1em';
		headline.appendChild(cntArea);
		
		// restore filters from local storage and filter submissions 
		reuropeRestoreFilterList();
		reuropeFilter();
	}
} () );

// make sure OK button is active only after some input 
// in filter name field
function reuropeWatchdog() {
	var okBtn = document.getElementById("reurope-addfilter");
	okBtn.removeAttribute("disabled"); 
}

function reuropeShowFilterDiag() {
	// default color well to the next color
	var colInput = document.getElementById("reurope-filtercol");
	colInput.setAttribute('value', '#'+reuropeGetFilterColor (null, reuropeGetFilterIds().length+1));
	var fDiag = document.getElementById("reurope-dialog");
	fDiag.style.display = 'block';
}

// cancel function, hide filter definition dialog
function reuropeCancel() {
	var fDiag = document.getElementById("reurope-dialog");
	fDiag.style.display = 'none';
}

// callback from click event listener
function reuropeAddFilter() {
	var filter = {};
	filter.active = true;
	filter.action = document.getElementById("reurope-filteraction").value;
	filter.id = 'reurope-filter-'+new Date().getTime();
	filter.name = document.getElementById("reurope-filtername").value;
	filter.color = document.getElementById("reurope-filtercol").value.replace(/#/, '');
	//asylum, refugees, refugee, migrant crisisfilter.color = reuropeGetFilterColor (color, reuropeGetFilterIds().length+1);
	filter.expression = document.getElementById("reurope-filterval").value.toLowerCase();
	reuropeAppendFilterToList(filter);
	
	document.getElementById("reurope-dialog").style.display = 'none';
	localStorage.setItem(filter.id, JSON.stringify(filter));
	reuropeFilter();
}

// run on page load
function reuropeRestoreFilterList() {
	var fIds = reuropeGetFilterIds();
	for (var i = 0; i < fIds.length; i++) {
		var filter = JSON.parse(localStorage.getItem(fIds[i]));
		reuropeAppendFilterToList(filter, i);
	}
}

function reuropeAppendFilterToList(filter, numFilters) {
	var fList = document.getElementById("reurope-filters");
	var fBtn = document.createElement("div");
	var expr = filter.expression.replace(/["']/, '');
	fBtn.setAttribute('title', expr);
	fBtn.className = 'reurope-filter';
	fBtn.id = filter.id;
	var cssClasses = 'screen';
	if (filter.active) {
		cssClasses += ' active';
	}
	fBtn.innerHTML = '<div class="'+cssClasses+'"><span class="reurope-removebtn"><span>x</span></span><span>'+filter.name+'</span></div>';
	fList.appendChild(fBtn);
	fBtn.addEventListener("click", reuropeToggleFilterState, false);
	var removeBtn = document.querySelector("#"+filter.id+">.screen>.reurope-removebtn");
	removeBtn.addEventListener("click", reuropeRemoveFilter, false);
	var color = reuropeGetFilterColor (filter.color, numFilters);
	fBtn.style.background = '#'+color;
}

function reuropeRemoveFilter(event) {
	var node = event.target;
	while (!node.id) {
		node = node.parentNode;
	}	
	var filterId = node.id;
	localStorage.removeItem(filterId);
	node.parentNode.removeChild(node);
	event.stopPropagation();
	reuropeFilter();
}

// make filter active or inactive
function reuropeToggleFilterState(event) {
	var node = event.target;
	while (!node.id) {
		node = node.parentNode;
	}

	var id = node.id;
	var filter = JSON.parse(localStorage.getItem(id));
	var screenNode = node.getElementsByClassName('screen')[0];
	var classes = screenNode.className;	
	if (classes.indexOf('active')>-1) {
		filter.active = false;
		screenNode.className = screenNode.className.replace(/\bactive\b/,'');
	} else {
		filter.active = true;
		screenNode.className = screenNode.className+' active';
	}

	localStorage.setItem(filter.id, JSON.stringify(filter));
	var threadList = document.getElementById('siteTable');
	var threads = threadList.getElementsByClassName('entry');	
	for (var i = 0; i < threads.length; i++) {
		threads[i].parentNode.style.display = 'block';	
	}

	reuropeFilter();
}

// main filter function, removes matching submissions
function reuropeFilter() {
	var nFiltered = 0;

	var allTerms = [];
	var ids = reuropeGetFilterIds();
	for (var i = 0; i < ids.length; i++) {
		var filter = JSON.parse(localStorage.getItem(ids[i]));
		if ((filter.active) && (filter.expression)) {
			var terms = filter.expression.split(',');
			for (var j = 0; j < terms.length; j++) {
				allTerms.push (terms[j].trim());
			}
		} 
	}
	var threadList = document.getElementById('siteTable');
	var threads = threadList.getElementsByClassName('entry');	
	for (var i = 0; i < threads.length; i++) {
		var topicWrap = threads[i].getElementsByClassName('title')[0];
		var topic = topicWrap.getElementsByClassName('title')[0];	
		var txt = topic.text.toLowerCase();
		for (var j = 0; j < allTerms.length; j++) {
			var regex = new RegExp ("\\b"+allTerms[j]+"\\b","g");
			if (txt.match(regex) != null) {
				if (filter.action == 'remove') {
					threads[i].parentNode.style.display = 'none';
					nFiltered++;
				}
				
				break;
			}
		}
	}
	var headline = document.getElementById("reurope-filters-line")
	headline.getElementsByTagName('span')[0].innerHTML = 'filtered: '+nFiltered;
}

// currently unused; rolled into reuropeFilter
function reuropeGetThreads() {
	var topics = {};
	var threadList = document.getElementById('siteTable');
	var threads = threadList.getElementsByClassName('entry');	
	for (var i = 0; i < threads.length; i++) {
		var topicWrap = threads[i].getElementsByClassName('title')[0];
		var topic = topicWrap.getElementsByClassName('title')[0];	
		topics[threads[i].parentNode.getAttribute("data-fullname")] = topic.text;
	}
}

// retrieve ID's for all filters from local storage
// those ID's can be used to find filter buttons
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

// for debug, print all filter definitions
function reuropeDumpFilters() {
	var ids = reuropeGetFilterIds();
	for (var i = 0; i < ids.length; i++) {
		var filter = JSON.parse(localStorage.getItem(ids[i]));
		console.log (filter);
	}
}

// get filter button color from palette
function reuropeGetFilterColor (color, index) {
	cols = reuropeColors();
	if (!color) {
		color = cols[0];
		if (index < cols.length) {
			color = cols[index];
		}
	}
	return color;
}

// filter button color palette
function reuropeColors() {
	var cols = ['d8e650', 'c8467d', '6242a0', 'ead652', 'eabe52', '377a93', 'ea6c51', '99d64a'];
	return cols;
}

// create and insert our container div
function reuropeCreateFilterContainer(tBody) {
	var fContainer = document.createElement("div");
	fContainer.style.border = "1px solid #DBDADA";
	fContainer.innerHTML = getrEuropeDialogHtml();
	var fList = document.createElement("ul");
	fList.id = "reurope-filters";
	fContainer.appendChild(fList);
	// attach our container div
	var hl  = tBody.getElementsByTagName('h1')[0];
	tBody.insertBefore(fContainer, hl);
	var headline = document.createElement("div");
	headline.id = "reurope-filters-line";
	fContainer.insertBefore(headline, fList);
	return fContainer;
}

function getrEuropeDialogHtml() {
	var cHtml = '<div id="reurope-dialog" ';
	cHtml += 'style="position: fixed; left: 0; right: 0; top: 0; bottom: 0; ';
	cHtml += 'background: rgba(0, 0, 0, 0.2); display: none;" ';
	cHtml += '>';
	cHtml += '<div id="reurope-dialog-inner" >';
	cHtml += '';
	cHtml += '<table>';
	cHtml += '<tr><td colspan="2"><h3 style="margin-left: 3px">Add a new filter definition</h3></td><td><a href="https://github.com/iSnow/rEuropeFiltered#defining-filters" target="_blank">help</a></td></tr>';
	cHtml += '<tr><td>Filter name</td><td><input id="reurope-filtername" type="text"></td><td></td></tr>';
	cHtml += '<tr><td>Filter words</td><td><input id="reurope-filterval" type="text"></td><td></td></tr>';
	cHtml += '<tr><td>Filter action</td><td><select id="reurope-filteraction"><option value="remove">Remove</option></select></td><td></td></tr>';
	cHtml += '<tr><td>Filter color</td><td><input id="reurope-filtercol" type="color" ></td><td>optional</td></tr>';
	cHtml += '</table>';
	cHtml += '<div style="text-align: right; width: 24em"><button id="reurope-cancel">Cancel</button><button disabled id="reurope-addfilter">OK</button></div>';
	cHtml += '</div>';
	return cHtml;
}

// create a <style> tag and add CSS rules
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
		style += "background: #666; \n";
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
		style += "#reurope-dialog-inner { \n";
		style += "background: #f5f5f5 none repeat scroll 0 0; \n";
		style += "border: 3px solid #4553a0; \n";
		style += "border-radius: 6px; \n";
		style += "left: 50%; \n";
		style += "margin-right: -50%; \n";
		style += "height: 15em; \n";
		style += "padding: 2em; \n";
		style += "position: absolute; \n";
		style += "right: auto; \n";
		style += "top: 50%; \n";
		style += "transform: translate(-50%, -50%); \n";
		style += "width: 30em; \n";
		style += "box-shadow: 0 0 6px rgba(49, 63, 200, 0.6);\n";
		style += "} \n";
		style += "#reurope-dialog input[type='text'] { \n";
		style += "border: 1px solid #dbdada; \n";
		style += "border-radius: 2px; \n";
		style += "font-size: 14px; \n";
		style += "padding: 4px; \n";
		style += "width: 15em; \n";
		style += "box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset; \n";
		style += "transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s; \n";
		style += "} \n";
		style += "#reurope-dialog input[type='text']:focus { \n";
		style += "border: 1px solid #4553a0; \n";
		style += "box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 4px rgba(49, 63, 200, 0.15);\n";
		style += "} \n";
		style += "#reurope-dialog-inner>table td { \n";
		style += "padding: 4px 6px 4px 6px; \n";
		style += "} \n";

		var sContainer = document.createElement("style");
		sContainer.type = 'text/css';
		sContainer.appendChild(document.createTextNode(style));
		head.appendChild (sContainer);
	}
}
