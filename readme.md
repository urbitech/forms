URBITECH Forms
=============

Components to Nette form Plugins


Composer SetUp
------------

Link to sources on Git

```json
"repositories": [
      {
          "type": "vcs",
          "url": "http://git.urbitech.cz:3000/URBITECH/urbitech-forms.git"
	},
      {
          "type": "vcs",
          "url": "http://git.urbitech.cz:3000/URBITECH/urbitech-utils.git"
      }
],
```    

Require Components

	"urbitech/forms": "*",
	"frontpack/composer-assets-plugin": "dev-master"
  
Component frontpack/composer-assets-plugin is component for move assets file from vendor to www directory
Asterisk "*" in urbitech/forms can be replace with concreate version of repository. For example: "^2.4" 

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