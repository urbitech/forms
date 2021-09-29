/* ------------ VALIDACE U KLIENTA ------------ */
Nette.validators.URBITECHFormsControlsAddressInput_validateAddress = function (elem, arg, value) {

	let parentElement = elem.getAttribute("data-block-id");

	let elemHouseNumber = document.getElementsByClassName(parentElement + '[houseNumber]')[0];
	let elemCity = document.getElementsByClassName(parentElement + '[city]')[0];
	let elemPostCode = document.getElementsByClassName(parentElement + '[postCode]')[0];

	if (elemHouseNumber.value || elemCity.value || elemPostCode.value) {
		elemPostCode.value = elemPostCode.value.replace(/\s/g, ''); // ODSTRANÍME PŘÍPADNOU MEZERU V PSČ

		// KDYŽ MÁ 5 ZNAKŮ A ZÁROVEŇ JE ČÍSLO A MUSÍ BÝT VYPLNĚNÉ VŠECHNY TŘI POLOŽKY
		if (elemPostCode.value.length === 5
			&& parseInt(elemPostCode.value) !== NaN
			&& elemHouseNumber.value
			&& elemCity.value
			&& elemPostCode.value
		) {
			return true
		} else {
			return false
		}

	}

	return true;
}