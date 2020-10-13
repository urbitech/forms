Nette.validators.URBITECHFormsControlsDateInput_validateDate = function (
	elem,
	arg,
	value
) {
	let day = parseInt(document.querySelector("[name*=day]").value);
	let month = parseInt(document.querySelector("[name*=month]").value);
	let year = parseInt(document.querySelector("[name*=year]").value);

	let listofDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var parseDate = Date.parse(year + "-" + month + "-" + day);

	if (day <= listofDays[month - 1] && !isNaN(parseDate)) {
		if (month === 2) {
			// KONTROLA PŘESTUPNÝCH DNÍ V ÚNORU

			if (!((!(year % 4) && year % 100) || !(year % 400)) && day > 28) {
				// KDYŽ NENÍ PŘESTUPNÝ A DEN JE VĚTŠÍ JAK 28

				return false;
			} else {
				return true;
			}
		}

		return true;
	}

	return false;
};
