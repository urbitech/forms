<?php

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;
use Nette\Utils\Json;
use URBITECH\Utils\Position;
use Nette\Utils\Validators;


class PositionInput extends \Nette\Forms\Controls\BaseControl{
	/** @var string */
	private	$lat = '';
	
	private $lon = '';

	const DEFAULT_LAT = 49.8167003;
	//const DEFAULT_LAT = 50;

	const DEFAULT_LNG = 15.4749544;	
	//const DEFAULT_LNG = 15;	


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
		$nameContainer = $this->getOption("controls-id") . '-container';

		//$rules = Helpers::exportRules($this->getRules()) ?: NULL;
		$rules = $this->modifyRulesControl(Helpers::exportRules($this->getRules())) ?: NULL;

		$el = Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('div')->setClass($nameContainer.'[mapAddress] mapAddressFields row')->setHtml(

					Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')
						->setText($this->getOption('map-text-streetNumber') ? $this->translate($this->getOption('map-text-streetNumber')) : $this->translate('map.text.streetNumber'))
						.Html::el('span')->setClass($nameContainer.'[mapAddressStreetNumber]')
					)
					.Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')
						->setText($this->getOption('map-text-city') ? $this->translate($this->getOption('map-text-city')) : $this->translate('map.text.city'))
						.Html::el('span')->setClass($nameContainer.'[mapAddressCity]')
					)
					.Html::el('p')->setClass('col-sm-4')->setHtml(
						Html::el('span')
						->setText($this->getOption('map-text-postCode') ? $this->translate($this->getOption('map-text-postCode')) : $this->translate('map.text.postCode'))
						.Html::el('span')->setClass($nameContainer.'[mapAddressPostCode]')
					)
					.Html::el('p')->setClass('col-sm-12')->setHtml(
						Html::el('button')
						->setText($this->getOption('use-button-label') ? $this->translate($this->getOption('use-button-label')) : $this->translate('form.button.use'))
							->setClass($nameContainer.'[mapAddressUse] mapAddressFields__button')
					)

				)
			)

			.Html::el('div')->setClass('col-sm-6')->setHtml(
				Html::el('input', [
					'type' => 'text',
					'name' => $name.'[mapAddressLat]',
					'value' => $this->lat,
					'class' => $nameContainer.'[mapAddressLat] form-control',
					'readonly' => true
				])->setAttribute('data-nette-rules', $rules)
			)

			.Html::el('div')->setClass('col-sm-6')->setHtml(
				Html::el('input', [
					'type' => 'text',
					'name' => $name.'[mapAddressLon]',
					'value' => $this->lon,
					'class' => $nameContainer.'[mapAddressLon] form-control',
					'readonly' => true
				])->setAttribute('data-nette-rules', $rules)
			)

			.Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('div')->setClass('map-box')->setHtml(

					Html::el('div',[
						'id' => $nameContainer.'-map',
						'class' => 'mapInit',
						'data-map-container' => $nameContainer,
						'data-map-options' => Json::encode([
							'lat' => $this->getOption('map-lat') ?: self::DEFAULT_LAT,
							'lon' => $this->getOption('map-lon') ?: self::DEFAULT_LNG,
						])
					])
	
					.Html::el('a',[
						'id' => $nameContainer.'-markerDestroy',
						'class' => 'markerDestroy',
						'data-map-container' => $nameContainer,
						'href' => '#'
					])->setText('Zruš pozici')

				)
			);


		return Html::el('div')->setClass('row')
			->setHtml($el)
			->setId($nameContainer)
			//->setAttribute('data-urbitech-form-position', 'mapPosition')
			->setAttribute('data-urbitech-form-address', $this->getOption("data-urbitech-form-address"))
			->setAttribute('data-country', $this->getOption("data-country"));

	}


	private function modifyRulesControl($rules)
	{

		foreach ($rules as $key => $rule) {
			if (isset($rule['control'])) {
				$rules[$key]['control'] .= '[mapAddressLon]';
			}

			if (isset($rule['rules'])) {
				$rules[$key]['rules'] = $this->modifyRulesControl($rule['rules']);
			}
		}

		return $rules;
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