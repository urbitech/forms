var Urbitech = {};

Urbitech.func = function (par) {
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
Urbitech.getReverseDataFromOSM = function (
  lat,
  lon,
  mainContainer,
  linkedContainer
) {
  fetch(
    "https://nominatim.openstreetmap.org/reverse/?lat=" +
      lat +
      "&lon=" +
      lon +
      "&addressdetails=1&limit=50&format=json"
  )
    .then((response) => response.json())
    .then(function (data) {
      let streetNumber = data.address.road + " " + data.address.house_number;
      let city = data.address.town || data.address.city || data.address.village;

      if (data.address.road === undefined) {
        streetNumber = data.address.house_number;
      }
      if (data.address.house_number === undefined) {
        streetNumber = data.address.road;
      }
      if (streetNumber === undefined) {
        streetNumber = "";
      }
      if (data.address.suburb !== undefined && data.address.suburb !== city) {
        suburb = " - " + data.address.suburb;
      } else {
        suburb = "";
      }

      // VLOŽENÍ DAT DO PRVKU PRO JEJICH ZOBRAZENÍ
      document.getElementsByClassName(
        mainContainer + "[mapAddressStreetNumber]"
      )[0].innerText = streetNumber;
      document.getElementsByClassName(
        mainContainer + "[mapAddressCity]"
      )[0].innerText = city + suburb;
      document.getElementsByClassName(
        mainContainer + "[mapAddressPostCode]"
      )[0].innerText = data.address.postcode;
      document.getElementsByClassName(
        mainContainer + "[mapAddressLat]"
      )[0].value = data.lat;
      document.getElementsByClassName(
        mainContainer + "[mapAddressLon]"
      )[0].value = data.lon;

      document
        .getElementsByClassName(mainContainer + "[mapAddress]")[0]
        .classList.add("mapAddressFields--active");

      if (document.getElementById(linkedContainer) !== null) {
        // ZOBRAZENÍ TLAČÍTKA POUŽÍT, KDYŽ MÁME SPOJENÝ FORMULÁŘ
        document
          .getElementsByClassName(mainContainer + "[mapAddressUse]")[0]
          .classList.add("mapAddressFields__button--active");
      }

      Urbitech.setProperStreet(data.lat, data.lon, mainContainer);
    });
};

/* ------------ FETCH ULIC Z DB PO KLIKU DO MAPY ------------ */
Urbitech.setProperStreet = function (lat, lon, container) {
  let fetchUrl = document
    .getElementsByClassName(container + "[placeName]")[0]
    .getAttribute("data-url");
  let fetchLat = document
    .getElementsByClassName(container + "[placeName]")[0]
    .getAttribute("data-url-lat");
  let fetchLng = document
    .getElementsByClassName(container + "[placeName]")[0]
    .getAttribute("data-url-lng");

  fetch(fetchUrl + "&" + fetchLat + "=" + lat + "&" + fetchLng + "=" + lon)
    .then((response) => response.json())
    .then(function (data) {
      let positionInputElement = document.getElementsByClassName(
        container + "[placeName]"
      )[0];
      let positionInputElementId = document.getElementsByClassName(
        container + "[placeId]"
      )[0];

      if (data.length) {
        if (data.length === 1) {
          positionInputElement.classList.add("mapPositionInput");
          positionInputElement.value = data[0].name;
          positionInputElementId.value = data[0].id;
        } else {
          let whispererListPlaceName = document.getElementsByClassName(
            container + "[whispererListPlaceName]"
          )[0];

          while (whispererListPlaceName.firstChild) {
            whispererListPlaceName.removeChild(
              whispererListPlaceName.firstChild
            );
          }

          positionInputElement.classList.remove("mapPositionInput");

          data.forEach((element) => {
            item = document.createElement("li");
            item.innerText = element.name;
            item.setAttribute("data-id", element.id);
            whispererListPlaceName.appendChild(item);
          });

          whispererListPlaceName.classList.add("whispererList--active");
        }
      } else {
        positionInputElement.value = "";
        positionInputElementId.value = "";
      }
    });
};

// INICIALIZACE MAPY
Urbitech.mapInit = function (el) {
  let mapElement = document.getElementsByClassName("mapInit");

  if (el) {
    mapElement = Object.values(el)[0].getElementsByClassName("mapInit");
  }

  for (let i = 0; i < mapElement.length; i++) {
    let initMap = mapElement[i].id;

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
    Urbitech.setMap = function (lat, lon, zoom, isMarker) {
      map[mainContainer].setView([lat, lon], zoom);
      isMarker
        ? (marker[mainContainer] = L.marker([lat, lon]).addTo(
            map[mainContainer]
          ))
        : false;

      // ZÁKLADNÍ VRSTVA
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map[mainContainer]);
    };

    if (lat !== "" && lon !== "") {
      // KDYŽ DOSTANU POZICI ZE SERVERU DO INPTŮ

      zoom = 17;
      Urbitech.setMap(lat, lon, zoom, true);
    } else {
      let mapOptions = JSON.parse(
        document
          .getElementById(mainContainer + "-map")
          .getAttribute("data-map-options")
      );

      if (mapOptions.lat === basicLat && mapOptions.lon === basicLon) {
        // KDYŽ JE ZADANÁ DEFAULTNÍ POZICE

        zoom = 7;
        Urbitech.setMap(mapOptions.lat, mapOptions.lon, zoom, false);
      } else {
        // KDYŽ JE POZICE ZADANÁ NA BACKENDU URČNĚ V OPTIONS

        zoom = 15;
        Urbitech.setMap(mapOptions.lat, mapOptions.lon, mapOptions.zoom, true);
      }
    }

    // ZJIŠTĚNÍ SOUŘADNIC PO KLIKNUTÍ DO MAPY A ZAVOLÁNÍ QUERY
    map[mainContainer].on("click", function (ev) {
      let lat = ev.latlng.lat;
      let lon = ev.latlng.lng;

      // KDYŽ MAPA NEMÁ MARKER, TAK SE VLOŽÍ, JINAK SE POSUNE
      !map[mainContainer].hasLayer(marker[mainContainer])
        ? (marker[mainContainer] = L.marker([lat, lon]).addTo(
            map[mainContainer]
          ))
        : marker[mainContainer].setLatLng([lat, lon]);

      Urbitech.getReverseDataFromOSM(lat, lon, mainContainer, linkedContainer);
    });

    // EVENTHANDLER NA KLIKNITÍ NA TLAČÍTKO POUŽÍT
    let useAddressButton = mainContainer + "[mapAddressUse]";
    document
      .getElementsByClassName(useAddressButton)[0]
      .addEventListener("click", (event) => {
        event.preventDefault();

        // VLOŽENÍ ZÍSKANÝCH HODNOT DO SPOJENÉHO FORMULÁŘE
        document.getElementsByClassName(
          linkedContainer + "[streetNumber]"
        )[0].value = document.getElementsByClassName(
          mainContainer + "[mapAddressStreetNumber]"
        )[0].innerText;
        document.getElementsByClassName(
          linkedContainer + "[city]"
        )[0].value = document.getElementsByClassName(
          mainContainer + "[mapAddressCity]"
        )[0].innerText;
        document.getElementsByClassName(
          linkedContainer + "[postCode]"
        )[0].value = document.getElementsByClassName(
          mainContainer + "[mapAddressPostCode]"
        )[0].innerText;
      });

    // EVENTHANDLER PRO ODSTRANĚNÍ MARKERU Z MAPY PO KLIKU NA TLAČÍTKO
    let destroyMarkerButton = mainContainer + "-markerDestroy";

    document
      .getElementById(destroyMarkerButton)
      .addEventListener("click", (event) => {
        event.preventDefault();

        if (marker[mainContainer] !== undefined) {
          map[mainContainer].removeLayer(marker[mainContainer]);
          document.getElementsByClassName(
            mainContainer + "[mapAddressLat]"
          )[0].value = "";
          document.getElementsByClassName(
            mainContainer + "[mapAddressLon]"
          )[0].value = "";

          document.getElementsByClassName(
            mainContainer + "[mapAddressStreetNumber]"
          )[0].value = "";
          document.getElementsByClassName(
            mainContainer + "[mapAddressCity]"
          )[0].value = "";
          document.getElementsByClassName(
            mainContainer + "[mapAddressPostCode]"
          )[0].value = "";
          document.getElementsByClassName(
            mainContainer + "[placeName]"
          )[0].value = "";
          document.getElementsByClassName(
            mainContainer + "[placeId]"
          )[0].value = "";

          document
            .getElementsByClassName(mainContainer + "[mapAddress]")[0]
            .classList.remove("mapAddressFields--active");
        }
      });
  }
};

/* ------------------------------ */
/* ---------- MAPA END ---------- */
/* ------------------------------ */

/* ------------------------------ */
/* ---------- FORMULÁŘ ---------- */
/* ------------------------------ */

/* ------------ HLAVNÍ FUNKCE KTERÁ ZÍSKÁ DATA, VLOŽÍ JE DO NAŠEPTÁVAČŮ A POSUNE MAPU NA ZÍSKANÉ MÍSTO ------------ */
Urbitech.getDataFromOSM = function (mainElement) {
  let thisElement = document.getElementById(mainElement); // HLAVNÍ ELEMENT DO KTERÉHO SE PÍŠE

  // NASTAVENÍ HODNOT HLAVNÍCH PROMĚNNÝCH Z INPUT PRVKŮ
  let streetNuber = document.getElementsByClassName(
    mainElement + "[streetNumber]"
  )[0].value;
  let cityInput = document.getElementsByClassName(mainElement + "[city]")[0]
    .value;
  let zipCodeInput = document.getElementsByClassName(
    mainElement + "[postCode]"
  )[0].value;

  // ZJIŠTĚNÍ ZEMĚ PRO OMEZENÍ VYHLEDÁVÁNÍ
  let country = thisElement.getAttribute("data-country");
  if (country === null) {
    country = "";
  }

  /* ------------ VLOŽENÍ DAT DO NAŠEPTÁVAČŮ ------------ */
  Urbitech.setDataToWhispererList = function (data) {
    for (let i = 0; i < data.length; i++) {
      // PRO VŠECHNY VÝSLEDKY Z FETCHE VYPÍŠEME MĚSTA A PSČ

      let actualCity =
        data[i].address.town || data[i].address.city || data[i].address.village; // NĚKDY VRACÍ OBEC JAKO TOWN NĚKDY JAKO CITY A NĚKDY JAKO VILLAGE
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
  Urbitech.changeMapPosition = function (data, mapContainer) {
    if (cityInput !== "" || zipCodeInput !== "") {
      // POSUNUJEME AŽ KDYŽ MÁME ASPOŇ MĚSTO NEBO PSČ

      let getIndex = 0;

      data.forEach((element, index) => {
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

      map[mapContainer].setView([lat, lon], 18); // POSUNEME MAPU

      if (marker[mapContainer] === undefined) {
        // KDYŽ NENÍ ŽÁDNÝ MARKER NA MAPĚ, TAK JEJ VYTVOŘÍME, JINAK HO POSUNEME¨

        marker[mapContainer] = L.marker([lat, lon]).addTo(map[mapContainer]);
      } else {
        marker[mapContainer].setLatLng([lat, lon]);
      }

      document.getElementsByClassName(
        mapContainer + "[mapAddressLat]"
      )[0].value = lat;
      document.getElementsByClassName(
        mapContainer + "[mapAddressLon]"
      )[0].value = lon;

      Urbitech.setProperStreet(lat, lon, mapContainer);
    }
  };

  // NASTAVENÍ PROMĚNNÝCH PRO NAŠEPTÁVAČE AKTIVNÍHO HLAVNÍHO ELEMENTU
  whispererListCity = document.getElementsByClassName(
    thisElement.id + "[whispererListCity]"
  )[0];
  whispererListPostCode = document.getElementsByClassName(
    thisElement.id + "[whispererListPostCode]"
  )[0];

  fetch(
    "https://nominatim.openstreetmap.org/search/?street=" +
      streetNuber +
      "&city=" +
      cityInput +
      "&postalcode=" +
      zipCodeInput +
      "&countrycodes=" +
      country +
      "&addressdetails=1&limit=50&format=json"
  )
    .then((response) => response.json())
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
      Array.from(document.getElementsByClassName("whispererList")).forEach(
        (element) => {
          if (element.classList.contains("whispererList--active")) {
            element.classList.remove("whispererList--active");
          }
        }
      );

      Array.from(document.getElementsByClassName("formAddressInput")).forEach(
        (element) => {
          if (element.classList.contains("formAddressInput--active")) {
            element.classList.remove("formAddressInput--active");
          }
        }
      );

      // KDYŽ FETCH VRÁTÍ NĚJAKÉ DATA
      if (data.length) {
        Urbitech.setDataToWhispererList(data); // VLOŽENÍ DAT DO NAŠEPTÁVAČŮ

        let mapContainer = thisElement.getAttribute(
          "data-urbitech-form-position"
        );
        if (document.getElementById(mapContainer) !== null) {
          Urbitech.changeMapPosition(data, mapContainer); // POSUN MAPY NA MÍSTO
        }
      } else {
        //alert("No item found");
      }
    });
};

/* ------------ EVENT LISTENER NA INPUT KTERÝ SPOUŠTÍ QUERY NA ADRESU ------------ */
var timeout = null;

document.addEventListener("input", (event) => {
  clearTimeout(timeout);

  timeout = setTimeout(function () {
    // TIMEOUT ABY SE AKCE SPUSTILA AŽ UŽIVATEL DOPÍŠE

    let mainElement = event.target.getAttribute("data-block-id");
    if (mainElement !== null) {
      Urbitech.getDataFromOSM(mainElement);
    }
  }, 750);
});

/* ------------ EVENT LISTENER NA CLICK KTERÝ OTVÍRÁ A ZAVÍRÁ NAŠEPTÁVAČ A KDYŽ SE KLIKNE DO NĚJ TAK VYBERE PRVEK ------------ */
document.addEventListener("click", function (e) {
  let clickedElement = e.target;
  let elementWhisperer = clickedElement.getAttribute("data-whisperer-list");

  // SKRYTÍ VŠECH AKTIVNÍCH NAŠEPTÁVAČŮ
  Array.from(document.getElementsByClassName("whispererList")).forEach(
    (element) => {
      if (element.classList.contains("whispererList--active")) {
        element.classList.remove("whispererList--active");
      }
    }
  );

  Array.from(document.getElementsByClassName("formAddressInput")).forEach(
    (element) => {
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
      !Array.from(document.getElementById(mainElement).classList).includes(
        "positionPanel"
      )
    ) {
      Urbitech.getDataFromOSM(mainElement);
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
    (element) => {
      if (element.classList.contains("whispererList--active")) {
        element.classList.remove("whispererList--active");
      }
    }
  );

  // KDYŽ SE STISKNE TAB A PRVEK MÁ NAŠEPTÁVAČ A TEN NENÍ PRÁZDNÝ
  if (
    e.keyCode === 9 &&
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
