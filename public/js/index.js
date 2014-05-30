function createXHR() {
	if (typeof XMLHttpRequest != 'undefined') {
		return new XMLHttpRequest();
	} else {
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e1) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e2) {
			}
		}
	}
	return null;
}

function sendRequest(operation) {
	var key = document.getElementById('key').value;
	if(key === ''){
		document.getElementById('echo').innerHTML = 'Please input key.';
		document.getElementById('key').focus();
		return;
	}
	var value = document.getElementById('value').value;
	document.getElementById('echo').innerHTML = '';

	var xhr = createXHR();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var result = JSON.parse(xhr.responseText);
			var value = result.value;
			if (operation == "get") {
				if (value === null) {
					document.getElementById('echo').innerHTML = "No entry is found.";
					document.getElementById('key').value = "";
					document.getElementById('value').value = "";
				} else {
					document.getElementById('value').value = value;
					document.getElementById('echo').innerHTML = "Get Corresponding entry value successfully.";
				}
			} else {
				if (operation == "delete") {
					document.getElementById('key').value = "";
					document.getElementById('value').value = "";
				}
				document.getElementById('echo').innerHTML = value;
			}
		}
	};

	if (operation == "get") {
		xhr.open("GET", "cache/" + key, true);
		xhr.send(null);
	} else if (operation == "put") {
		xhr.open("PUT", "cache?key=" + key + "&value=" + value, true);
		xhr.send(null);
	} else {
		xhr.open("DELETE", "cache/" + key, true);
		xhr.send(null);
	}
}

function getCache() {
	sendRequest('get');
}
function putCache() {
	sendRequest('put');
}
function removeCache() {
	sendRequest('delete');
}