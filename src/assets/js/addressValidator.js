/* ------------ VALIDACE U KLIENTA ------------ */
Nette.validators.URBITECHFormsControlsAddressInput_validateAddress = function(elem, arg, value){

	let parentElement = elem.getAttribute("data-block-id");
	parentElement = parentElement.replace("-container", "");

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