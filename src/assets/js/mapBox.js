// NASTAVENÍ POČÁTEČNÍCH PARAMETRŮ
let map = [];
let marker = [];
let basicLat = 49.8167003;
let basicLon = 15.4749544;
let zoom = 7;

// INICIALIZACE MAPY
let mapElement = document.getElementsByClassName("mapInit");

for (let i = 0; i < mapElement.length; i++) {
	
	let initMap = mapElement[i].id;	
	
	let mainContainer = document.getElementById(initMap).getAttribute("data-map-container");
	let linkedContainer = document.getElementById(mainContainer).getAttribute("data-urbitech-form-address") + "-container";

	// DEFAULTNÍ MAPA S POHLEDEM NA ČESKOU REPUBLIKU
	map[mainContainer] = L.map(initMap).setView([basicLat, basicLon], zoom);

	let lat = document.getElementsByClassName(mainContainer + "[mapAddressLat]")[0].value;
	let lon = document.getElementsByClassName(mainContainer + "[mapAddressLon]")[0].value;

	if(lat !== "" && lon !== ""){// KDYŽ DOSTANU POZICI ZE SERVERU DO INPTŮ

		zoom = 17;
		setMap(lat, lon, zoom, true)

	} else {

		let mapOptions = JSON.parse(document.getElementById(mainContainer+"-map").getAttribute("data-map-options"));

		if(mapOptions.lat === basicLat && mapOptions.lon === basicLon){// KDYŽ JE ZADANÁ DEFAULTNÍ POZICE

			zoom = 7;
			setMap(mapOptions.lat, mapOptions.lon, zoom, false)

		} else {// KDYŽ JE POZICE ZADANÁ NA BACKENDU URČNĚ V OPTIONS

			zoom = 15;
			setMap(mapOptions.lat, mapOptions.lon, zoom, true)

		}

	}

	function setMap(lat, lon, zoom, isMarker){

		map[mainContainer].setView([lat, lon], zoom);
		(isMarker) ? marker[mainContainer] = L.marker([lat, lon]).addTo(map[mainContainer]) : false;

		// ZÁKLADNÍ VRSTVA
		L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',{
			attribution: 'Wikimedia maps | Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map[mainContainer]);		

	}
	
	// ZJIŠTĚNÍ SOUŘADNIC PO KLIKNUTÍ DO MAPY A ZAVOLÁNÍ QUERY
	map[mainContainer].on('click', function(ev) {
		
		let lat = ev.latlng.lat;
		let lon = ev.latlng.lng;		

		// KDYŽ MAPA NEMÁ MARKER, TAK SE VLOŽÍ, JINAK SE POSUNE
		(!map[mainContainer].hasLayer(marker[mainContainer])) ? marker[mainContainer] = L.marker([lat, lon]).addTo(map[mainContainer]) : marker[mainContainer].setLatLng([lat, lon]);
		
		getReverseDataFromOSM(lat, lon, mainContainer, linkedContainer);
		
	});

	// EVENTHANDLER NA KLIKNITÍ NA TLAČÍTKO POUŽÍT
	let useAddressButton = mainContainer + "[mapAddressUse]";
	document.getElementsByClassName(useAddressButton)[0].addEventListener('click', event => {
		event.preventDefault();
		
		// VLOŽENÍ ZÍSKANÝCH HODNOT DO SPOJENÉHO FORMULÁŘE
		document.getElementsByClassName(linkedContainer + "[streetNumber]")[0].value = document.getElementsByClassName(mainContainer + "[mapAddressStreetNumber]")[0].innerText;
		document.getElementsByClassName(linkedContainer + "[city]")[0].value = document.getElementsByClassName(mainContainer + "[mapAddressCity]")[0].innerText;
		document.getElementsByClassName(linkedContainer + "[postCode]")[0].value = document.getElementsByClassName(mainContainer + "[mapAddressPostCode]")[0].innerText;

	});	

	// EVENTHANDLER PRO ODSTRANĚNÍ MARKERU Z MAPY PO KLIKU NA TLAČÍTKO
	let destroyMarkerButton = mainContainer + "-markerDestroy";

	document.getElementById(destroyMarkerButton).addEventListener('click', event => {

		event.preventDefault();

		if(marker[mainContainer] !== undefined){
	
			map[mainContainer].removeLayer(marker[mainContainer]);
			document.getElementsByClassName(mainContainer + "[mapAddressLat]")[0].value = "";
			document.getElementsByClassName(mainContainer + "[mapAddressLon]")[0].value = "";

		}

	});
}

/* ------------ FETCH PO KLIKU DO MAPY ------------ */
function getReverseDataFromOSM(lat, lon, mainContainer, linkedContainer){

	fetch('https://nominatim.openstreetmap.org/reverse/?lat='+ lat +'&lon='+ lon +'&addressdetails=1&limit=50&format=json')
	.then((response) => response.json())
	.then(function(data) {
		
		let streetNumber = data.address.road +" "+ data.address.house_number;
		let city = data.address.town || data.address.city || data.address.village;

		if(data.address.road === undefined){
			streetNumber = data.address.house_number;
		}
		if(data.address.house_number === undefined){
			streetNumber = data.address.road;
		}
		if(streetNumber === undefined){
			streetNumber = "";
		}		
		if(data.address.suburb !== undefined && data.address.suburb !== city){
			suburb = " - " + data.address.suburb;
		} else {
			suburb = "";
		}

		// VLOŽENÍ DAT DO PRVKU PRO JEJICH ZOBRAZENÍ
		document.getElementsByClassName(mainContainer + "[mapAddressStreetNumber]")[0].innerText = streetNumber;
		document.getElementsByClassName(mainContainer + "[mapAddressCity]")[0].innerText = city + suburb;
		document.getElementsByClassName(mainContainer + "[mapAddressPostCode]")[0].innerText = data.address.postcode;	
		document.getElementsByClassName(mainContainer + "[mapAddressLat]")[0].value = data.lat;	
		document.getElementsByClassName(mainContainer + "[mapAddressLon]")[0].value = data.lon;

		if(document.getElementById(linkedContainer) !== null){// ZOBRAZENÍ TLAČÍTKA POUŽÍT, KDYŽ MÁME SPOJENÝ FORMULÁŘ
			document.getElementsByClassName(mainContainer + "[mapAddressUse]")[0].classList.add("mapAddressFields__button--active");
		}
		
	});

}