
/* ------------ EVENT LISTENER NA INPUT KTERÝ SPOUŠTÍ QUERY NA ADRESU ------------ */
var timeout = null;

document.addEventListener('input', event => {

	clearTimeout(timeout);
		
	timeout = setTimeout(function () {// TIMEOUT ABY SE AKCE SPUSTILA AŽ UŽIVATEL DOPÍŠE
		
		let mainElement = event.target.getAttribute("data-block-id");
		if(mainElement !== null){

			getDataFromOSM(mainElement);

		}
		
	}, 750);

});


/* ------------ HLAVNÍ FUNKCE KTERÁ ZÍSKÁ DATA, VLOŽÍ JE DO NAŠEPTÁVAČŮ A POSUNE MAPU NA ZÍSKANÉ MÍSTO ------------ */
function getDataFromOSM(mainElement){

	let thisElement = document.getElementById(mainElement); // HLAVNÍ ELEMENT DO KTERÉHO SE PÍŠE
	
	// NASTAVENÍ HODNOT HLAVNÍCH PROMĚNNÝCH Z INPUT PRVKŮ
	let streetNuber = document.getElementsByClassName(mainElement +'[streetNumber]')[0].value;
	let cityInput = document.getElementsByClassName(mainElement +'[city]')[0].value;
	let zipCodeInput = document.getElementsByClassName(mainElement +'[postCode]')[0].value;
	
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

			let mapContainer = thisElement.getAttribute("data-urbitech-form-position") + "-container";
			if(document.getElementById(mapContainer) !== null){

				chanmgeMapPosition(data, mapContainer); // POSUN MAPY NA MÍSTO

			}

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
	function chanmgeMapPosition(data, mapContainer){
		
		if(cityInput !== "" || zipCodeInput !== ""){ // POSUNUJEME AŽ KDYŽ MÁME ASPOŇ MĚSTO NEBO PSČ

			let getIndex = 0;

			data.forEach((element, index) => {
				// KDYŽ MÁ VYBRANÝ ELEMENT ČÍSLO DOMU, MĚSTO A PSČ, TAK PŘESUNEME MAPU NA DANÉ MÍSTO
				if(element.address.house_number && (element.address.city || element.address.town || element.address.village) && element.address.postcode){
					getIndex = index;
				} // JINAK BY SE MAPA POSUNULA NA STŘED OBCE
			});

			let lat = data[getIndex].lat;
			let lon = data[getIndex].lon;

			map[mapContainer].setView([lat, lon], 18); // POSUNEME MAPU

			if(marker[mapContainer] === undefined){// KDYŽ NENÍ ŽÁDNÝ MARKER NA MAPĚ, TAK JEJ VYTVOŘÍME, JINAK HO POSUNEME¨

				marker[mapContainer] = L.marker([lat, lon]).addTo(map[mapContainer]);

			} else {

				marker[mapContainer].setLatLng([lat, lon]);

			}

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