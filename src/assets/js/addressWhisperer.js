/* ------------------------------ */
/* ------------ MAPA ------------ */
/* ------------------------------ */

// NASTAVENÍ POČÁTEČNÍCH PARAMETRŮ
let map = [];
let marker = [];
let lat = 49.8167003;
let lon = 15.4749544;
let zoom = 6;

// INICIALIZACE MAPY
let mapElement = document.getElementsByClassName("mapInit");

for (let i = 0; i < mapElement.length; i++) {
	
	let initMap = mapElement[i].id;
	let mainContainer = document.getElementById(initMap).getAttribute("data-map-container");
	let linkedContainer = document.getElementById(mainContainer).getAttribute("data-urbitech-form-address");

	map[mainContainer] = L.map(initMap).setView([lat, lon], zoom);
	marker[mainContainer] = L.marker([lat, lon]).addTo(map[mainContainer]);
	
	// ZÁKLADNÍ VRSTVA
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(map[mainContainer]);
	
	// ZJIŠTĚNÍ SOUŘADNIC PO KLIKNUTÍ DO MAPY A ZAVOLÁNÍ QUERY
	map[mainContainer].on('click', function(ev) {
		
		let lat = ev.latlng.lat;
		let lon = ev.latlng.lng;
		
		marker[mainContainer].setLatLng([lat, lon]);
		
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

		if(linkedContainer !== null){// ZOBRAZENÍ TLAČÍTKA POUŽÍT, KDYŽ MÁME SPOJENÝ FORMULÁŘ
			document.getElementsByClassName(mainContainer + "[mapAddressUse]")[0].classList.add("mapAddressFields__button--active");
		}
		
	});

}


/* ------------------------------ */
/* ---------- MAPA END ---------- */
/* ------------------------------ */


/* ------------------------------ */
/* ---------- FORMULÁŘ ---------- */
/* ------------------------------ */


/* ------------ EVENT LISTENER NA INPUT KTERÝ SPOUŠTÍ QUERY NA ADRESU ------------ */
var timeout = null;

document.addEventListener('input', event => {

	clearTimeout(timeout);
		
	timeout = setTimeout(function () {// TIMEOUT ABY SE AKCE SPUSTILA AŽ UŽIVATEL DOPÍŠE
		
		let mainElement = event.target.getAttribute("data-block-id");
		getDataFromOSM(mainElement);
		
	}, 750);

});

/* ------------ HLAVNÍ FUNKCE KTERÁ ZÍSKÁ DATA, VLOŽÍ JE DO NAŠEPTÁVAČŮ A POSUNE MAPU NA ZÍSKANÉ MÍSTO ------------ */
function getDataFromOSM(mainElement){

	let thisElement = document.getElementById(mainElement); // HLAVNÍ ELEMENT DO KTERÉHO SE PÍŠE
	
	// NASTAVENÍ HODNOT HLAVNÍCH PROMĚNNÝCH Z INPUT PRVKŮ
	let streetNuber = document.querySelector('input[name="'+ mainElement +'[streetNumber]"]').value;
	let cityInput = document.querySelector('input[name="'+ mainElement +'[city]"]').value;
	let zipCodeInput = document.querySelector('input[name="'+ mainElement +'[postCode]"]').value;
	
	// ZJIŠTĚNÍ ZEMĚ PRO OMEZENÍ VYHLEDÁVÁNÍ
	let country = thisElement.getAttribute("data-country");
	if(country === null){
		country = ""
	}

	// NASTAVENÍ PROMĚNNÝCH PRO NAŠEPTÁVAČE AKTIVNÍHO HLAVNÍHO ELEMENTU
	whispererListCity = document.getElementsByClassName(thisElement.id + "[whispererListCity]")[0];
	whispererListPostCode = document.getElementsByClassName(thisElement.id + "[whispererListPostCode]")[0];
	
	fetch('https://nominatim.openstreetmap.org/search/?street='+ streetNuber +'&city='+ cityInput +'&postalcode='+ zipCodeInput + '&countrycodes='+ country +'&addressdetails=1&limit=50&format=json')
	.then((response) => response.json())
	.then(function(data) {

		// ODSTRANĚNÍ DAT Z NAŠEPTÁVAČŮ Z PŘEDCHOZÍHO FETCHE
		let clearElements = [whispererListCity, whispererListPostCode]; //SEZNAM NAŠEPTÁVAČŮ
		for (let i = 0; i < clearElements.length; i++) { //ITERACE SEZNAMU

			while (clearElements[i].firstChild) { // ITERACE PRVKŮ
				clearElements[i].removeChild(clearElements[i].firstChild);
			}
			
		}

		//SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
		Array.from(document.getElementsByClassName("whispererList")).forEach((element) => {

			if(element.classList.contains("whispererList--active")){
	
				element.classList.remove("whispererList--active");
	
			}
	
		});

		// KDYŽ FETCH VRÁTÍ NĚJAKÉ DATA
		if(data.length){

			setDataToWhispererList(data); // VLOŽENÍ DAT DO NAŠEPTÁVAČŮ
			chanmgeMapPosition(data); // POSUN MAPY NA MÍSTO

		} else {

			alert("No item found");

		}

	});

	/* ------------ VLOŽENÍ DAT DO NAŠEPTÁVAČŮ ------------ */
	function setDataToWhispererList(data) {

		for (let i = 0; i < data.length; i++) {// PRO VŠECHNY VÝSLEDKY Z FETCHE VYPÍŠEME MĚSTA A PSČ
	
			let actualCity = data[i].address.town || data[i].address.city || data[i].address.village; // NĚKDY VRACÍ OBEC JAKO TOWN NĚKDY JAKO CITY A NĚKDY JAKO VILLAGE 
			let actualPostCode = data[i].address.postcode;
			
			if(actualCity !== undefined){
				
				let item;
		
				// VLOŽÍME MĚSTO DO SEZNAMU NAŠEPTÁVAČE
				item = document.createElement("li");
				item.innerText = actualCity;
				item.setAttribute("data-index", [i]);
				whispererListCity.appendChild(item);
	
			}
			
			if(actualPostCode !== undefined){
	
				let item;
		
				// VLOŽÍME PSČ DO SEZNAMU NAŠEPTÁVAČE
				item = document.createElement("li");
				item.innerText = actualPostCode;
				item.setAttribute("data-index", [i]);
				whispererListPostCode.appendChild(item);
	
			}
			
		}


		// POKUD AKTIVNÍ PRVEK MÁ NAŠEPTÁVAČ TAK HO PO VLOŽENÍ DAT ZOBRAZÍME
		if(document.getElementsByClassName(document.activeElement.getAttribute("data-whisperer-list"))[0] !== undefined){

			document.getElementsByClassName(document.activeElement.getAttribute("data-whisperer-list"))[0].classList.add("whispererList--active")

		}
		
	}

	/* ------------ POSUNUTÍ MAP NA NAŠEPTANÉ MÍSTO ------------ */
	function chanmgeMapPosition(data){
		
		if(cityInput !== "" || zipCodeInput !== ""){ // POSUNUJEME AŽ KDYŽ MÁME ASPOŇ MĚSTO NEBO PSČ

			let getIndex = 0;

			data.forEach((element, index) => {
				// KDYŽ MÁ VYBRANÝ ELEMENT ČÍSLO DOMU, MĚSTO A PSČ, TAK PŘESUNEME MAPU NA DANÉ MÍSTO
				if(element.address.house_number && (element.address.city || element.address.town || element.address.village) && element.address.postcode){
					getIndex = index;
				} // JINAK BY SE MAPA POSUNULA NA STŘED OBCE
			});

			let mapContainer = thisElement.getAttribute("data-urbitech-form-position");
			let lat = data[getIndex].lat;
			let lon = data[getIndex].lon;

			map[mapContainer].setView([lat, lon], 18); // POSUNEME MAPU
			marker[mapContainer].setLatLng([lat, lon]); // POSUNEME ŠIPKU

		}
	}

}

/* ------------ EVENT LISTENER NA CLICK KTERÝ OTVÍRÁ A ZAVÍRÁ NAŠEPTÁVAČ A KDYŽ SE KLIKNE DO NĚJ TAK VYBERE PRVEK ------------ */
document.addEventListener("click", function (e) {

	let clickedElement = e.target;
	let elementWhisperer = clickedElement.getAttribute("data-whisperer-list");

	// SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
	Array.from(document.getElementsByClassName("whispererList")).forEach((element) => {

		if(element.classList.contains("whispererList--active")){

			element.classList.remove("whispererList--active");

		}

	});

	// KDYŽ MÁ NAŠEPTÁVAČ A NENÍ PRÁZDNÝ, TAK HO ZOBRAZ
	if(elementWhisperer !== null && document.getElementsByClassName(elementWhisperer)[0].hasChildNodes()){

		document.getElementsByClassName(elementWhisperer)[0].classList.add("whispererList--active");
		
	}

	// KDYŽ SE KLIKNE NA PRVEK V NAŠEPTÁVAČI VLOŽÍ SE DO RODIČOVSKÉHO INPUTU A ZAVOLÁ SE QUERY S NOVOU HODNOTOU
	if(clickedElement.tagName === "LI" && clickedElement.parentElement.classList.contains("whispererList")){

		let parentInput = clickedElement.parentElement.getAttribute("data-parent-input");
		let mainElement = document.getElementsByClassName(parentInput)[0].getAttribute("data-block-id");

		document.getElementsByClassName(parentInput)[0].value = clickedElement.textContent;

		getDataFromOSM(mainElement)
	
	}

});

/* ------------ OTEVŘENÍ NAŠEPTÁVAČE PŘI FOCUSU NA INPUT POMOCÍ KLÁVESY TAB ------------ */
document.addEventListener("keyup", function (e) {

	let elementWhisperer = document.activeElement.getAttribute("data-whisperer-list");

	// SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
	Array.from(document.getElementsByClassName("whispererList")).forEach((element) => {

		if(element.classList.contains("whispererList--active")){

			element.classList.remove("whispererList--active");

		}

	});	

	// KDYŽ SE STISKNE TAB A PRVEK MÁ NAŠEPTÁVAČ A TEN NENÍ PRÁZDNÝ
	if(e.keyCode === 9 && elementWhisperer !== null && document.getElementsByClassName(elementWhisperer)[0].hasChildNodes()){

		document.getElementsByClassName(elementWhisperer)[0].classList.add("whispererList--active");

	}
});


/* ------------------------------ */
/* -------- FORMULÁŘ END -------- */
/* ------------------------------ */


/* ------------------------------ */
/* ---------- VALIDACE ---------- */
/* ------------------------------ */


/* ------------ VALIDACE U KLIENTA ------------ */
Nette.validators.URBITECHFormsControlsAddressInput_validateAddress = function(elem, arg, value){

	let parentElement = elem.getAttribute("data-block-id");

	if(value !== ""){// INPUT NESMÍ BÝT PRÁZDNÝ

		if(elem.getAttribute("name") === parentElement + "[postCode]"){// PSČ MÁ JEŠTĚ SPECIÁLNÍ VALIDACI

			value = value.replace(/\s/g,''); // ODSTRANÍME PŘÍPADNOU MEZERU V PSČ
				
			if(value.length === 5 && parseInt(value) !== NaN){ // KDYŽ MÁ 5 ZNAKŮ A ZÁROVEŇ JE ČÍSLO
								
				return true
		
			} else {

				return false

			}

		}

		return true;
	}

}

/* ------------------------------ */
/* -------- VALIDACE END -------- */
/* ------------------------------ */