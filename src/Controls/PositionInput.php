<?php

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;
use URBITECH\Utils\Position;
use Nette\Utils\Validators;


class PositionInput extends \Nette\Forms\Controls\BaseControl{
	/** @var string */
	private	$lat = '';
	
	private $lon = '';


	public function __construct($label = NULL)
	{
		parent::__construct($label);
		$this->addCondition(Form::FILLED)
			->addRule(__CLASS__ . '::validatePosition', 'forms.address.validPosition');
	}


	/**
	 * @return bool
	 */
	public function isFilled(): bool
	{
		return $this->lat !== '' && $this->lon !== '';
	}


	public function loadHttpData(): void
	{
		$this->lat = $this->getHttpData(Form::DATA_LINE, '[mapAddressLat]');
		$this->lon = $this->getHttpData(Form::DATA_LINE, '[mapAddressLon]');
	}


	/**
	 * @return Position|NULL
	 */
	public function getValue()
	{
		return self::validatePosition($this)
			? new Position($this->lat, $this->lon)
			: NULL;
	}


	public function setValue($value)
	{
		if ($value === NULL) {
			$this->lat = $this->lon = '';
		} else {
			$this->lat = $value->getLatitude();
			$this->lon = $value->getLongitude();
		}
		return $this;
	}		

	public function getControl(){

		$name = $this->getHtmlName();

		$rules = Helpers::exportRules($this->getRules()) ?: NULL;

		$el = Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('div')->setClass($name.'[mapAddress] mapAddressFields row')->setHtml(

					Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')->setText('Ulice:')
						.Html::el('span')->setClass($name.'[mapAddressStreetNumber]')
					)
					.Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')->setText('Obec:')
						.Html::el('span')->setClass($name.'[mapAddressCity]')
					)
					.Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')->setText('PSČ:')
						.Html::el('span')->setClass($name.'[mapAddressPostCode]')
					)
					.Html::el('p')->setClass('col-sm-12')->setHtml(
						Html::el('button')->setText('Použít:')
							->setClass($name.'[mapAddressUse] mapAddressFields__button')
					)

				)
			)

			.Html::el('div')->setClass('col-sm-6')->setHtml(
				Html::el('input', [
					'type' => 'text',
					'name' => $name.'[mapAddressLat]',
					'value' => $this->lat,
					'class' => $name.'[mapAddressLat] form-control',
					'data-attr' => $name
				])->setAttribute('data-nette-rules', $rules)
			)

			.Html::el('div')->setClass('col-sm-6')->setHtml(
				Html::el('input', [
					'type' => 'text',
					'name' => $name.'[mapAddressLon]',
					'value' => $this->lon,
					'class' => $name.'[mapAddressLon] form-control',
					'data-attr' => $name
				])->setAttribute('data-nette-rules', $rules)
			)

			.Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('div',[
					'id' => $name.'-map',
					'class' => 'mapInit',
					'data-map-container' => $name
				])
			);


		return Html::el('div')->setClass('row')
			->setHtml($el)
			->setId($this->getOption("controls-id"))
			->setAttribute('data-urbitech-form-position', 'mapPosition')
			->setAttribute('data-urbitech-form-address', $this->getOption("data-urbitech-form-address"))
			->setAttribute('data-country', $this->getOption("data-country"))
			;

	}


	/**
	 * @return bool
	 */
	public static function validatePosition(\Nette\Forms\IControl $control)
	{
		return $control->lat
			&& $control->lon
			&& Validators::isNumeric($control->lat)
			&& Validators::isNumeric($control->lon);
	}		


	public static function register()
	{
		Container::extensionMethod('addPositionInput', function(Container $container, $name, $label = NULL, $callback = NULL) {
			return $container[$name] = new PositionInput($label);
		});
	}	

}