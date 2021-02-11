# URBITECH Forms

Components to Nette form Plugins

## Composer SetUp

Configure extension to config.neon

    extensions:
    	urbitechForms: URBITECH\Forms\DI\FormsExtension

Require Components

```json
	"urbitech/forms": "^3.0",
	"frontpack/composer-assets-plugin": "dev-master"
```

Component frontpack/composer-assets-plugin is component for move assets file from vendor to www directory
Asterisk "\*" in urbitech/forms can be replace with concreate version of repository. For example: "^2.4"

SetUp of assets folder removement

```json
"config": {
	"assets-files": {
		"urbitech/forms": [
			"src/assets/css",
			"src/assets/js",
			"src/assets/images"
		]
	},
	"assets-target": {
		"urbitech/forms": "www/assets/urbitech-forms"
	}
}
```

On localhost is necessary disable secure-http

    "secure-http": false,

## Form in presenter SetUp

Set country for search

    ->setOption("data-country", "cz")

It's possible to set more countries coma separated.

    ->setOption("data-country", "cz,sk")

Set linked container with map

    ->setOption("data-urbitech-form-position", "MAP_CONTAINER_ID")

Set linked container with address

    ->setOption("data-urbitech-form-address", "ADDRESS_CONTAINER_ID")

Set custom container ID. If is unset, aplication use container name

    ->setOption("controls-id", "CUSTOM_ID")

Show / Hide button for use whispered data from form to map (for addressInput)

    ->setOption('data-useButton', 1)

Allow autofill position in map when address form is used (for addressInput)

    ->setOption('data-autofill-position', 1)

Allow autofill address to form after map click (for positionInput)

    ->setOption('data-autofill-address', 1)

Allow draggable mode on map marker

    ->setOption('data-marker-draggable', 1)

## Other

Less styles requires Bootstrap variables

    @import "variables.less";
