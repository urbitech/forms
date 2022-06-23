(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return factory(global);
		});
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		global.URBITECH = factory(global);
	}

}(typeof window !== 'undefined' ? window : this, function (window) {
	var URBITECH = {};

	URBITECH.func = function (par) {
		alert(par);
	};

	/* ------------------------------ */
	/* ------------ MAPA ------------ */
	/* ------------------------------ */

	// NASTAVENÍ POČÁTEČNÍCH PARAMETRŮ
	let map = [];
	let marker = [];
	let basicLat = 49.8167003;
	let basicLon = 15.4749544;
	let zoom = 7;

	/* ------------ FETCH PO KLIKU DO MAPY ------------ */
	URBITECH.getReverseDataFromOSM = function (
		lat,
		lon,
		mainContainer,
		linkedContainer
	) {
		if (document.getElementById(linkedContainer)) {
			fetch(
				"https://nominatim.openstreetmap.org/reverse/?lat=" +
				lat +
				"&lon=" +
				lon +
				"&addressdetails=1&limit=50&format=json"
			)
				.then(function (response) {
					return response.json()
				})
				.then(function (data) {
					let suburb = "";
					let street = data.address.road;
					let houseNumber = data.address.house_number;
					let city =
						data.address.town || data.address.city || data.address.village;

					if (data.address.road === undefined || Number.isInteger(parseInt(data.address.road))) {
						street = "";
					}
					if (data.address.house_number === undefined) {
						houseNumber = "";
					}
					if (
						data.address.suburb !== undefined &&
						data.address.suburb !== city
					) {
						suburb = " - " + data.address.suburb;
					}

					let autoFillAddress = parseInt(
						document
							.getElementById(mainContainer)
							.getAttribute("data-autofill-address")
					);

					if (autoFillAddress) {
						URBITECH.autoFillAddress(
							street,
							houseNumber,
							city + suburb,
							data.address.postcode,
							mainContainer,
							linkedContainer
						);
					}

					let showMapAdressFields = parseInt(
						document.getElementById(mainContainer).getAttribute("data-show-address-fields")
					);
					if (showMapAdressFields) {
						// VLOŽENÍ DAT DO PRVKU PRO JEJICH ZOBRAZENÍ
						document.getElementsByClassName(
							mainContainer + "[mapAddressStreet]"
						)[0].innerText = street;
						document.getElementsByClassName(
							mainContainer + "[mapAddressHouseNumber]"
						)[0].innerText = houseNumber;
						document.getElementsByClassName(
							mainContainer + "[mapAddressCity]"
						)[0].innerText = city + suburb;
						document.getElementsByClassName(
							mainContainer + "[mapAddressPostCode]"
						)[0].innerText = data.address.postcode;
						document
							.getElementsByClassName(mainContainer + "[mapAddress]")[0]
							.classList.add("mapAddressFields--active");
					}
					URBITECH.setProperStreet(lat, lon, mainContainer, street);
				});
		} else {
			URBITECH.setProperStreet(lat, lon, mainContainer);
		}

		document.getElementsByClassName(
			mainContainer + "[mapAddressLat]"
		)[0].value = lat;
		document.getElementsByClassName(
			mainContainer + "[mapAddressLon]"
		)[0].value = lon;
		
	};

	URBITECH.autoFillAddress = function (
		street,
		houseNumber,
		citySuburb,
		postCode,
		mainContainer,
		linkedContainer
	) {
		let element = document.getElementById(linkedContainer);

		element.getElementsByClassName(
			linkedContainer + "[street]"
		)[0].value = street;
		element.getElementsByClassName(
			linkedContainer + "[houseNumber]"
		)[0].value = houseNumber;
		element.getElementsByClassName(
			linkedContainer + "[city]"
		)[0].value = citySuburb;
		element.getElementsByClassName(
			linkedContainer + "[postCode]"
		)[0].value = postCode;
	};

	/* ------------ FETCH ULIC Z DB PO KLIKU DO MAPY ------------ */
	URBITECH.setProperStreet = function (lat, lon, container, street = null) {
		let fetchUrl = document
			.getElementsByClassName(container + "[placeName]")[0]
			.getAttribute("data-url");
		let fetchLat = document
			.getElementsByClassName(container + "[placeName]")[0]
			.getAttribute("data-url-lat");
		let fetchLng = document
			.getElementsByClassName(container + "[placeName]")[0]
			.getAttribute("data-url-lng");

		if (fetchUrl !== null && fetchLat !== null && fetchLng !== null) {
			fetch(
				fetchUrl + "&" + fetchLat + "=" + lat + "&" + fetchLng + "=" + lon
			)
				.then(function (response) {
					return response.json()
				})
				.then(function (data) {
					let positionInputElement = document.getElementsByClassName(
						container + "[placeName]"
					)[0];

					if (data.length > 1) {
						positionInputElement.classList.remove("mapPositionInput");
					} else {
						positionInputElement.classList.add("mapPositionInput");
					}

					while (positionInputElement.firstChild) {
						positionInputElement.removeChild(
							positionInputElement.firstChild
						);
					}

					// Fuse search
					var result = []
					if (window.Fuse && street) {
						const options = {
							includeScore: true,
							keys: ['name']
						}

						const fuse = new Fuse(data, options)
						result = fuse.search(street)
					}

					data.forEach(function (element) {
						item = document.createElement("option");
						item.setAttribute("value", element.id);
						if (result.length && element === result[0].item) {
							item.setAttribute("selected", "selected");
						}

						let text = document.createTextNode(element.name);
						item.appendChild(text);

						positionInputElement.appendChild(item);
					});

					if (data.length) {
						let textOffset = 350;
						if (document.getElementsByClassName("row-three").length) {
							textOffset = document.getElementsByClassName("row-three")[0].offsetTop
						}

						window.scrollTo({
							top: document.getElementById(container).offsetTop + textOffset - 120,
							behavior: 'smooth'
						});

						positionInputElement.classList.add("alert-border");
					}

					positionInputElement.addEventListener("click", function (event) {
						positionInputElement.classList.remove("alert-border");
					});

				});
		}
	};

	URBITECH.mapInit = function (el) {
		let mapElement = el;

		let initMap = mapElement.id;

		let mainContainer = document
			.getElementById(initMap)
			.getAttribute("data-map-container");
		let linkedContainer = document
			.getElementById(mainContainer)
			.getAttribute("data-urbitech-form-address");

		// DEFAULTNÍ MAPA S POHLEDEM NA ČESKOU REPUBLIKU
		map[mainContainer] = L.map(initMap).setView([basicLat, basicLon], zoom);

		let lat = document.getElementsByClassName(
			mainContainer + "[mapAddressLat]"
		)[0].value;
		let lon = document.getElementsByClassName(
			mainContainer + "[mapAddressLon]"
		)[0].value;

		// NASTAVENÍ POZICE MAPY
		URBITECH.setMap = function (lat, lon, zoom, isMarker) {
			map[mainContainer].setView([lat, lon], zoom);

			let markerDraggable = parseInt(document.getElementById(mainContainer).getAttribute("data-marker-draggable"));

			isMarker
				? (marker[mainContainer] = L.marker([lat, lon], { "draggable": markerDraggable }).addTo(
					map[mainContainer]
				))
				: false;

			if (isMarker) {
				document.getElementById(mainContainer + "-markerDestroy").style.display = "block";

				marker[mainContainer].on('dragend', function (event) {
					URBITECH.getReverseDataFromOSM(
						event.target.getLatLng().lat,
						event.target.getLatLng().lng,
						mainContainer,
						linkedContainer
					);
				});
			}

			// VRSTVY DLAŽDIC
			let showLayers = JSON.parse(document.getElementById(mainContainer + "-map").getAttribute("data-map-options"));
			googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
				maxZoom: 20,
				subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
			});
			googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
				maxZoom: 20,
				subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
			});
			original = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map[mainContainer]);
			if (showLayers?.showMapLayers) {
				L.control.layers({ "Základní": original, "Google - Satelitní": googleSat, "Google - Klasická": googleStreets }, null, { position: 'bottomright' }).addTo(map[mainContainer])
			}

		};

		if (lat !== "" && lon !== "") {
			// KDYŽ DOSTANU POZICI ZE SERVERU DO INPTŮ

			zoom = 17;
			URBITECH.setMap(lat, lon, zoom, true);
		} else {
			let mapOptions = JSON.parse(
				document
					.getElementById(mainContainer + "-map")
					.getAttribute("data-map-options")
			);

			if (mapOptions.lat === basicLat && mapOptions.lon === basicLon) {
				// KDYŽ JE ZADANÁ DEFAULTNÍ POZICE

				zoom = 7;
				URBITECH.setMap(mapOptions.lat, mapOptions.lon, zoom, false);
			} else {
				// KDYŽ JE POZICE ZADANÁ NA BACKENDU URČNĚ V OPTIONS

				zoom = 15;
				URBITECH.setMap(
					mapOptions.lat,
					mapOptions.lon,
					mapOptions.zoom,
					false
				);
			}
		}

		let showMapAdressFields = parseInt(
			document
				.getElementById(mainContainer)
				.getAttribute("data-show-address-fields")
		);
		if (showMapAdressFields) {
			document.getElementsByClassName(
				mainContainer + "[mapAddress]"
			)[0].classList.add("mapAddressFields--active");
		}

		// ZJIŠTĚNÍ SOUŘADNIC PO KLIKNUTÍ DO MAPY A ZAVOLÁNÍ QUERY
		map[mainContainer].on("click", function (ev) {
			let lat = ev.latlng.lat;
			let lon = ev.latlng.lng;

			// KDYŽ MAPA NEMÁ MARKER, TAK SE VLOŽÍ, JINAK SE POSUNE
			let markerDraggable = parseInt(document.getElementById(mainContainer).getAttribute("data-marker-draggable"));

			if (marker[mainContainer] === undefined) {
				marker[mainContainer] = L.marker([lat, lon], { "draggable": markerDraggable }).addTo(
					map[mainContainer]
				)

				marker[mainContainer].on('dragend', function (event) {
					URBITECH.getReverseDataFromOSM(
						event.target.getLatLng().lat,
						event.target.getLatLng().lng,
						mainContainer,
						linkedContainer
					);
				});
			} else {
				marker[mainContainer].setLatLng([lat, lon]);
			}

			document.getElementById(mainContainer + "-markerDestroy").style.display = "block";

			URBITECH.getReverseDataFromOSM(
				lat,
				lon,
				mainContainer,
				linkedContainer
			);
		});

		// EVENTHANDLER PRO ODSTRANĚNÍ MARKERU Z MAPY PO KLIKU NA TLAČÍTKO
		let destroyMarkerButton = mainContainer + "-markerDestroy";

		document
			.getElementById(destroyMarkerButton)
			.addEventListener("click", function (event) {
				event.preventDefault();

				if (marker[mainContainer] !== undefined) {
					map[mainContainer].removeLayer(marker[mainContainer]);

					document.getElementsByClassName(
						mainContainer + "[mapAddressLat]"
					)[0].value = "";
					document.getElementsByClassName(
						mainContainer + "[mapAddressLon]"
					)[0].value = "";

					let removeTextElements = ["[street]", "[houseNumber]", "[city]", "[postCode]"]
					removeTextElements.forEach(function (element) {
						if (document.getElementsByClassName(linkedContainer + element).length) {
							document.getElementsByClassName(linkedContainer + element)[0].value = "";
						}
					});

					let removeAllElements = ["[mapAddressStreet]", "[mapAddressHouseNumber]", "[mapAddressCity]", "[mapAddressPostCode]", "[placeName]", "[placeId]"];
					removeAllElements.forEach(function (element) {
						if (document.getElementsByClassName(mainContainer + element).length) {
							document.getElementsByClassName(mainContainer + element)[0].innerText = "";
						}
					});

					document.getElementsByClassName(
						mainContainer + "[mapAddress]"
					)[0].classList.remove("mapAddressFields--active");

					document.getElementsByClassName(
						mainContainer + "[placeName]"
					)[0].classList.add("mapPositionInput");

					document.getElementById(destroyMarkerButton).style.display = "none";
				}
			});

		URBITECH.setUseButtons(el);
	};

	/* ------------------------------ */
	/* ---------- MAPA END ---------- */
	/* ------------------------------ */


	/* ------------------------------ */
	/* ---------- FORMULÁŘ ---------- */
	/* ------------------------------ */

	/* ------------ HLAVNÍ FUNKCE KTERÁ ZÍSKÁ DATA, VLOŽÍ JE DO NAŠEPTÁVAČŮ A POSUNE MAPU NA ZÍSKANÉ MÍSTO ------------ */
	URBITECH.getDataFromOSM = function (mainElement) {
		let thisElement = document.getElementById(mainElement); // HLAVNÍ ELEMENT DO KTERÉHO SE PÍŠE

		// NASTAVENÍ HODNOT HLAVNÍCH PROMĚNNÝCH Z INPUT PRVKŮ
		let streetInput =
			document.getElementsByClassName(mainElement + "[street]")[0].value +
			" ";
		let houseNumberInput = document.getElementsByClassName(
			mainElement + "[houseNumber]"
		)[0].value;
		let cityInput = document.getElementsByClassName(mainElement + "[city]")[0]
			.value;
		let zipCodeInput = document.getElementsByClassName(
			mainElement + "[postCode]"
		)[0].value;

		if (streetInput.toLowerCase() === cityInput.toLowerCase() + " ") {
			streetInput = "";
		}

		// ZJIŠTĚNÍ ZEMĚ PRO OMEZENÍ VYHLEDÁVÁNÍ
		let country = thisElement.getAttribute("data-country");
		if (country === null) {
			country = "";
		}

		/* ------------ VLOŽENÍ DAT DO NAŠEPTÁVAČŮ ------------ */
		URBITECH.setDataToWhispererList = function (data) {
			for (let i = 0; i < data.length; i++) {
				// PRO VŠECHNY VÝSLEDKY Z FETCHE VYPÍŠEME MĚSTA A PSČ

				let actualCity =
					data[i].address.town ||
					data[i].address.city ||
					data[i].address.village; // NĚKDY VRACÍ OBEC JAKO TOWN NĚKDY JAKO CITY A NĚKDY JAKO VILLAGE
				let actualPostCode = data[i].address.postcode;

				if (actualCity !== undefined) {
					let item;

					// VLOŽÍME MĚSTO DO SEZNAMU NAŠEPTÁVAČE
					item = document.createElement("li");
					item.innerText = actualCity;
					item.setAttribute("data-index", [i]);
					whispererListCity.appendChild(item);
				}

				if (actualPostCode !== undefined) {
					let item;

					// VLOŽÍME PSČ DO SEZNAMU NAŠEPTÁVAČE
					item = document.createElement("li");
					item.innerText = actualPostCode;
					item.setAttribute("data-index", [i]);
					whispererListPostCode.appendChild(item);
				}
			}

			// POKUD AKTIVNÍ PRVEK MÁ NAŠEPTÁVAČ TAK HO PO VLOŽENÍ DAT ZOBRAZÍME
			if (
				document.getElementsByClassName(
					document.activeElement.getAttribute("data-whisperer-list")
				)[0] !== undefined
			) {
				document
					.getElementsByClassName(
						document.activeElement.getAttribute("data-whisperer-list")
					)[0]
					.classList.add("whispererList--active");
				document.activeElement.classList.add("formAddressInput--active");
			}
		};

		/* ------------ POSUNUTÍ MAP NA NAŠEPTANÉ MÍSTO ------------ */
		let autoFillPosition = parseInt(
			document
				.getElementById(mainElement)
				.getAttribute("data-autofill-position")
		);

		if (autoFillPosition) {
			URBITECH.changeMapPosition = function (data, mapContainer) {
				if (cityInput !== "" || zipCodeInput !== "") {
					// POSUNUJEME AŽ KDYŽ MÁME ASPOŇ MĚSTO NEBO PSČ

					let getIndex = 0;

					data.forEach(function (element, index) {
						// KDYŽ MÁ VYBRANÝ ELEMENT ČÍSLO DOMU, MĚSTO A PSČ, TAK PŘESUNEME MAPU NA DANÉ MÍSTO
						if (
							element.address.house_number &&
							(element.address.city ||
								element.address.town ||
								element.address.village) &&
							element.address.postcode
						) {
							getIndex = index;
						} // JINAK BY SE MAPA POSUNULA NA STŘED OBCE
					});

					let lat = data[getIndex].lat;
					let lon = data[getIndex].lon;

					if (autoFillPosition) {
						map[mapContainer].setView([lat, lon], 18); // POSUNEME MAPU

						document.getElementById(mapContainer + "-markerDestroy").style.display = "block";

						if (marker[mapContainer] === undefined) {
							// KDYŽ NENÍ ŽÁDNÝ MARKER NA MAPĚ, TAK JEJ VYTVOŘÍME, JINAK HO POSUNEME

							let markerDraggable = parseInt(document.getElementById(mapContainer).getAttribute("data-marker-draggable"));

							marker[mapContainer] = L.marker([lat, lon], { "draggable": markerDraggable }).addTo(
								map[mapContainer]
							);

							marker[mapContainer].on('dragend', function (event) {
								URBITECH.getReverseDataFromOSM(
									event.target.getLatLng().lat,
									event.target.getLatLng().lng,
									mapContainer,
									mainElement
								);
							});

						} else {
							marker[mapContainer].setLatLng([lat, lon]);
						}
					}

					document.getElementsByClassName(
						mapContainer + "[mapAddressLat]"
					)[0].value = lat;
					document.getElementsByClassName(
						mapContainer + "[mapAddressLon]"
					)[0].value = lon;

					URBITECH.setProperStreet(lat, lon, mapContainer);
				}
			};
		}

		// NASTAVENÍ PROMĚNNÝCH PRO NAŠEPTÁVAČE AKTIVNÍHO HLAVNÍHO ELEMENTU
		whispererListCity = document.getElementsByClassName(
			thisElement.id + "[whispererListCity]"
		)[0];
		whispererListPostCode = document.getElementsByClassName(
			thisElement.id + "[whispererListPostCode]"
		)[0];

		fetch(
			"https://nominatim.openstreetmap.org/search/?street=" +
			streetInput +
			houseNumberInput +
			"&city=" +
			cityInput +
			"&postalcode=" +
			zipCodeInput +
			"&countrycodes=" +
			country +
			"&addressdetails=1&limit=50&format=json"
		)
			.then(function (response) {
				return response.json()
			})
			.then(function (data) {
				// ODSTRANĚNÍ DAT Z NAŠEPTÁVAČŮ Z PŘEDCHOZÍHO FETCHE
				let clearElements = [whispererListCity, whispererListPostCode]; //SEZNAM NAŠEPTÁVAČŮ
				for (let i = 0; i < clearElements.length; i++) {
					//ITERACE SEZNAMU

					while (clearElements[i].firstChild) {
						// ITERACE PRVKŮ
						clearElements[i].removeChild(clearElements[i].firstChild);
					}
				}

				//SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
				Array.from(
					document.getElementsByClassName("whispererList")
				).forEach(function (element) {
					if (element.classList.contains("whispererList--active")) {
						element.classList.remove("whispererList--active");
					}
				});

				Array.from(
					document.getElementsByClassName("formAddressInput")
				).forEach(function (element) {
					if (element.classList.contains("formAddressInput--active")) {
						element.classList.remove("formAddressInput--active");
					}
				});

				// KDYŽ FETCH VRÁTÍ NĚJAKÉ DATA
				if (data.length) {
					URBITECH.setDataToWhispererList(data); // VLOŽENÍ DAT DO NAŠEPTÁVAČŮ

					let mapContainer = thisElement.getAttribute(
						"data-urbitech-form-position"
					);

					let autoFillPosition = parseInt(
						document
							.getElementById(mainElement)
							.getAttribute("data-autofill-position")
					);

					if (
						document.getElementById(mapContainer) !== null &&
						autoFillPosition
					) {
						URBITECH.changeMapPosition(data, mapContainer); // POSUN MAPY NA MÍSTO
					}
				} else {
					//alert("No item found");
				}
			});
	};

	URBITECH.setUseButtons = function (el) {
		let buttonElement = document.getElementsByClassName("useButton");

		if (buttonElement) {
			Array.from(buttonElement).forEach(function (item) {
				item.addEventListener("click", function (event) {
					event.preventDefault();

					if (event.target.classList.contains("useAddress")) {
						URBITECH.setDataToMap(item);
					}

					if (event.target.classList.contains("usePosition")) {
						URBITECH.setDataToAddress(item);
					}
				});
			});
		}
	}

	URBITECH.setDataToMap = function (item) {
		let mainElement = item.getAttribute("data-block-id");
		let mapElement = document
			.getElementById(mainElement)
			.getAttribute("data-urbitech-form-position");

		if (mainElement !== null) {
			// NASTAVENÍ HODNOT HLAVNÍCH PROMĚNNÝCH Z INPUT PRVKŮ
			let streetInput =
				document.getElementsByClassName(mainElement + "[street]")[0].value +
				" ";
			let houseNumberInput = document.getElementsByClassName(
				mainElement + "[houseNumber]"
			)[0].value;
			let cityInput = document.getElementsByClassName(
				mainElement + "[city]"
			)[0].value;
			let zipCodeInput = document.getElementsByClassName(
				mainElement + "[postCode]"
			)[0].value;

			// ZJIŠTĚNÍ ZEMĚ PRO OMEZENÍ VYHLEDÁVÁNÍ
			let country = document
				.getElementById(mainElement)
				.getAttribute("data-country");
			if (country === null) {
				country = "";
			}

			fetch(
				"https://nominatim.openstreetmap.org/search/?street=" +
				streetInput +
				houseNumberInput +
				"&city=" +
				cityInput +
				"&postalcode=" +
				zipCodeInput +
				"&countrycodes=" +
				country +
				"&addressdetails=1&limit=50&format=json"
			)
				.then(function (response) {
					return response.json()
				})
				.then(function (data) {
					if (data.length) {
						let getIndex = 0;

						data.forEach(function (element, index) {
							// KDYŽ MÁ VYBRANÝ ELEMENT ČÍSLO DOMU, MĚSTO A PSČ, TAK PŘESUNEME MAPU NA DANÉ MÍSTO
							if (
								element.address.house_number &&
								(element.address.city ||
									element.address.town ||
									element.address.village) &&
								element.address.postcode
							) {
								getIndex = index;
							} // JINAK BY SE MAPA POSUNULA NA STŘED OBCE
						});

						let lat = data[getIndex].lat;
						let lon = data[getIndex].lon;

						map[mapElement].setView([lat, lon], 18);
						if (marker[mapElement] === undefined) {
							let markerDraggable = parseInt(document.getElementById(mapElement).getAttribute("data-marker-draggable"));
							marker[mapElement] = L.marker([lat, lon], { "draggable": markerDraggable }).addTo(
								map[mapElement]
							)
						} else {
							marker[mapElement].setLatLng([lat, lon]);
						}

						document.getElementsByClassName(
							mapElement + "[mapAddressLat]"
						)[0].value = lat;
						document.getElementsByClassName(
							mapElement + "[mapAddressLon]"
						)[0].value = lon;

						URBITECH.setProperStreet(lat, lon, mapElement);
					}
				});
		}
	};

	URBITECH.setDataToAddress = function (item) {
		let mainElement = item.getAttribute("data-block-id");
		let addressElement = document
			.getElementById(mainElement)
			.getAttribute("data-urbitech-form-address");

		let searchedStreet = document.getElementsByClassName(
			mainElement + "[mapAddressStreet]"
		)[0].innerText;

		let searchedHouseNumber = document.getElementsByClassName(
			mainElement + "[mapAddressHouseNumber]"
		)[0].innerText;

		let searchedCity = document.getElementsByClassName(
			mainElement + "[mapAddressCity]"
		)[0].innerText;

		let searchedPostCode = document.getElementsByClassName(
			mainElement + "[mapAddressPostCode]"
		)[0].innerText;

		document.getElementsByClassName(
			addressElement + "[street]"
		)[0].value = searchedStreet;
		document.getElementsByClassName(
			addressElement + "[houseNumber]"
		)[0].value = searchedHouseNumber;
		document.getElementsByClassName(
			addressElement + "[city]"
		)[0].value = searchedCity;
		document.getElementsByClassName(
			addressElement + "[postCode]"
		)[0].value = searchedPostCode;
	};

	/* ------------ EVENT LISTENER NA INPUT KTERÝ SPOUŠTÍ QUERY NA ADRESU ------------ */
	var timeout = null;

	document.addEventListener("input", function (event) {
		clearTimeout(timeout);

		if (event.target.nodeName !== "SELECT") {
			timeout = setTimeout(function () {
				// TIMEOUT ABY SE AKCE SPUSTILA AŽ UŽIVATEL DOPÍŠE

				let mainElement = event.target.getAttribute("data-block-id");
				if (mainElement !== null) {
					URBITECH.getDataFromOSM(mainElement);
				}
			}, 750);
		}
	});

	/* ------------ EVENT LISTENER NA CLICK KTERÝ OTVÍRÁ A ZAVÍRÁ NAŠEPTÁVAČ A KDYŽ SE KLIKNE DO NĚJ TAK VYBERE PRVEK ------------ */
	document.addEventListener("click", function (e) {
		let clickedElement = e.target;
		let elementWhisperer = clickedElement.getAttribute("data-whisperer-list");

		// SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
		Array.from(document.getElementsByClassName("whispererList")).forEach(
			function (element) {
				if (element.classList.contains("whispererList--active")) {
					element.classList.remove("whispererList--active");
				}
			}
		);

		Array.from(document.getElementsByClassName("formAddressInput")).forEach(
			function (element) {
				if (element.classList.contains("formAddressInput--active")) {
					element.classList.remove("formAddressInput--active");
				}
			}
		);

		// KDYŽ MÁ NAŠEPTÁVAČ A NENÍ PRÁZDNÝ, TAK HO ZOBRAZ
		if (
			elementWhisperer !== null &&
			document.getElementsByClassName(elementWhisperer)[0].hasChildNodes()
		) {
			document
				.getElementsByClassName(elementWhisperer)[0]
				.classList.add("whispererList--active");
		}

		// KDYŽ SE KLIKNE NA PRVEK V NAŠEPTÁVAČI VLOŽÍ SE DO RODIČOVSKÉHO INPUTU A ZAVOLÁ SE QUERY S NOVOU HODNOTOU
		if (
			clickedElement.tagName === "LI" &&
			clickedElement.parentElement.classList.contains("whispererList")
		) {
			let parentInput = clickedElement.parentElement.getAttribute(
				"data-parent-input"
			);
			let mainElement = document
				.getElementsByClassName(parentInput)[0]
				.getAttribute("data-block-id");

			document.getElementsByClassName(parentInput)[0].value =
				clickedElement.textContent;

			if (
				!Array.from(
					document.getElementById(mainElement).classList
				).includes("positionPanel")
			) {
				URBITECH.getDataFromOSM(mainElement);
			} else {
				document.getElementsByClassName(
					mainElement + "[placeId]"
				)[0].value = clickedElement.getAttribute("data-id");
			}
		}
	});

	/* ------------ OTEVŘENÍ NAŠEPTÁVAČE PŘI FOCUSU NA INPUT POMOCÍ KLÁVESY TAB ------------ */
	document.addEventListener("keyup", function (e) {
		let elementWhisperer = document.activeElement.getAttribute(
			"data-whisperer-list"
		);

		// SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
		Array.from(document.getElementsByClassName("whispererList")).forEach(
			function (element) {
				if (element.classList.contains("whispererList--active")) {
					element.classList.remove("whispererList--active");
				}
			}
		);

		// KDYŽ SE STISKNE TAB A PRVEK MÁ NAŠEPTÁVAČ A TEN NENÍ PRÁZDNÝ
		if (
			e.key === "Tab" &&
			elementWhisperer !== null &&
			document.getElementsByClassName(elementWhisperer)[0].hasChildNodes()
		) {
			document
				.getElementsByClassName(elementWhisperer)[0]
				.classList.add("whispererList--active");
		}
	});

	/* ------------------------------ */
	/* -------- FORMULÁŘ END -------- */
	/* ------------------------------ */

	return URBITECH;
}));