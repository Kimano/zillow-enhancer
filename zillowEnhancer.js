if (!window.google)
{
	/*var http = null;
	
	// IE7+, Firefox, Chrome, Opera, Safari
	if (window.XMLHttpRequest)
		http = new XMLHttpRequest();
	
	// IE5, IE6
	else
		http = new ActiveXObject("Microsoft.XMLHTTP");
	
	http.onreadystatechange = function()
	{
		try
		{
	        if (typeof(http.status) == "unknown")
	            return;
	        
	        if (http.status == 200 && http.readyState == 4)
	        {
	        	alert(responseText);
	        	var src = http.responseText;
	        	src = src.replace("function getScript", "function getScript(src) { document.body.appendChild(document.createElement(\"script\")).src=src; } function getScriptOLD");
	        	
	        	document.body.appendChild(document.createElement("script")).innerHTML = src;
	        	//document.body.innerHTML += '<script type="text/javascript">' . src . '</script>';
	        }
		}
		catch(e)
		{
		}
	};
	
	http.open("GET", "http://maps.googleapis.com/maps/api/js?key=AIzaSyCODRQK0UhyEqR9cjN9lMlQ9gYbG_1xuTU&sensor=false", false);
	http.send();*/
	
	var oldWrite = document.write;
	document.write = function(scriptHTML)
	{
		document.body.appendChild(document.createElement("script")).src=scriptHTML.substr(13, scriptHTML.indexOf('"', 13) - 13);
		document.write = oldWrite;
	}
	
	document.body.appendChild(document.createElement("script")).src="http://maps.googleapis.com/maps/api/js?key=AIzaSyCODRQK0UhyEqR9cjN9lMlQ9gYbG_1xuTU&sensor=false";
}


var favlist = document.getElementById("favlist");
var isfav;

if (favlist)
	isfav = true;
else
{
	isfav = false;
	favlist = document.getElementById("search-results");
}

var directionsService;

favlist.parentNode.style.paddingTop = "0px";
favlist.innerHTML = '<form action="javascript:calcDirections();" class="module-head">To Address: <input id="toAddress" stype="text" /> <input type="submit" value="Go" /></form>' + favlist.innerHTML;


for (var i = 0; i < favlist.childNodes.length; i++)
{
	if (isfav)
	{
		if (favlist.childNodes[i].tagName !== 'DIV')
			continue;
		
		favlist.childNodes[i].childNodes[0].childNodes[0].innerHTML += "<span id=\"" + favlist.childNodes[i].id + "dist\"></span>";
	}
	else
	{
		if (favlist.childNodes[i].tagName !== 'LI')
			continue;
		
		favlist.childNodes[i].childNodes[favlist.childNodes[i].childNodes.length > 2 ? 2 : 1].childNodes[1].childNodes[0].childNodes[0].innerHTML += "<span id=\"" + favlist.childNodes[i].id + "dist\">Dist</span>";
	}
	
	favlist.childNodes[i].innerHTML += "<span id=\"" + favlist.childNodes[i].id + "link\">Link</span>";
	favlist.childNodes[i].innerHTML += "<span id=\"" + favlist.childNodes[i].id + "map\">Map</span>";
}

var cIndex = document.cookie.indexOf("ZE_TOADDRESS");
if (cIndex > -1)
{
	cIndex += 13;
	var cVal = unescape(document.cookie.substr(cIndex, document.cookie.indexOf(';', cIndex) - cIndex));
	
	document.getElementById("toAddress").value = cVal;
	
	if (cVal !== null && cVal.length > 0)
		setTimeout(calcDirections, 500);
}

function calcDirections()
{
	if (!directionsService)
		directionsService = new google.maps.DirectionsService();
	
	var toAddress = document.getElementById("toAddress").value;
	
	var date = new Date();
	date.setFullYear(date.getFullYear() + 10);
	document.cookie = "ZE_TOADDRESS=" + escape(toAddress) + "; expires=" + date.toUTCString();	
	
	for (var i = 0; i < favlist.childNodes.length; i++)
	{
		var address;
		
		if (isfav)
		{
			if (favlist.childNodes[i].tagName !== 'DIV')
				continue;
			
			address = favlist.childNodes[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML + ' ' + favlist.childNodes[i].childNodes[0].childNodes[0].childNodes[0].childNodes[2].innerHTML;
		}
		else
		{
			if (favlist.childNodes[i].tagName !== 'LI')
				continue;
			
			address = favlist.childNodes[i].childNodes[favlist.childNodes[i].childNodes.length > 4 ? 2 : 1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerHTML;
		}
		
		getDistance(address, toAddress, favlist.childNodes[i].id);
		
		document.getElementById(favlist.childNodes[i].id + "link").innerHTML = '<a href="#showMap" onclick="return showMap(this, \'' + favlist.childNodes[i].id + '\', \'' + toAddress.replace("'", "\\'").replace("\"", "&quote;") + '\', \'' + address.replace("'", "\\'").replace("\"", "&quote;") + '\');">Show Map<br /><br /></a>';
		document.getElementById(favlist.childNodes[i].id + "map").innerHTML = "";
	}
}

function showMap(elem, id, toAddress, fromAddress)
{
	elem.style.display = "none";
	document.getElementById(id + "map").innerHTML = '<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?geocode=&q=from+' +  encodeURIComponent(fromAddress) + '+to+' +  encodeURIComponent(toAddress) + '&amp;z=10&amp;output=embed"></iframe><br /><br />';
	
	return false;
}

function getDistance(fromAddress, toAdrress, id)
{
	var request =
	{
	    origin: fromAddress,
	    destination: toAdrress,
	    travelMode: google.maps.DirectionsTravelMode.DRIVING
	};
	
	directionsService.route(request, function(response, status)
	{
		if (status == google.maps.DirectionsStatus.OK)
		{
			var totalDistance = 0;
			var totalTime = 0;
			var myroute = response.routes[0];
			
			for (var i = 0; i < myroute.legs.length; i++)
			{
				totalDistance += myroute.legs[i].distance.value;
				totalTime += myroute.legs[i].duration.value;
			}
			
			totalDistance = Math.round(totalDistance * 0.00621371192) / 10;
			totalTime = Math.round(totalTime / 60);
			
			document.getElementById(id + "dist").innerHTML = "<br /><strong>" + totalTime + " min - " + totalDistance + "mi</strong><br />";
		}
	});
}