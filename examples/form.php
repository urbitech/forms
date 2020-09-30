<?php

declare(strict_types=1);

if (@!include __DIR__ . '/../vendor/autoload.php') {
    die('Install packages using `composer install`');
}

include __DIR__ . '/../src/Controls/AddressInput.php';
include __DIR__ . '/../src/Controls/PositionInput.php';
include __DIR__ . '/../src/Controls/DateInput.php';

use Nette\Forms\Form;
use Nette\Utils\Html;
use Tracy\Debugger;
use Tracy\Dumper;
use URBITECH\Forms\Controls\AddressInput;
use URBITECH\Forms\Controls\DateInput;
use URBITECH\Forms\Controls\PositionInput;

Debugger::enable();

$form = new Form;

$form['address'] = new AddressInput('Addresa');
$form['address']
    ->setOption('data-country', 'cz, sk')
    ->setOption('data-urbitech-form-position', 'position')
    ->setOption('controls-id', 'address')
    ->setOption('class', 'form-group-wrap')
    ->setOption('placeholder', ['Ulice', 'Město', 'PSČ', 'Číslo popisné']);

$form['position'] = new PositionInput('Pozice');
$form['position']
    ->setOption('data-urbitech-form-address', 'address')
    ->setOption('controls-id', 'position')
    ->setOption('class', 'form-group-wrap');


$form['date'] = new DateInput('Datum');
$form['date']
    ->setOption('placeholder', ['Den', 'Měsíc', 'Rok']);

$form->addSubmit('submit', 'Poslat');

if ($form->isSuccess()) {
    echo '<h2>Formulář je odeslaný</h2>';
    Dumper::dump($form->getValues(), [Dumper::COLLAPSE => false]);
    exit;
}

?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Nette Forms basic example</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />
    <link rel="stylesheet" media="screen" href="../src/assets/css/addressWhisperer.css" />
    <link rel="stylesheet" media="screen" href="../src/assets/css/mapBox.css" />

</head>

<body>
    <?php $form->render() ?>

    <script src="https://nette.github.io/resources/js/2/netteForms.js"></script>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin=""></script>
    <script src="../src/assets/js/addressWhisperer.js"></script>
    <script src="../src/assets/js/validAddress.js"></script>
    <script src="../src/assets/js/validDate.js"></script>
    <script>
        Urbitech.mapInit(false);
    </script>
</body>

</html>