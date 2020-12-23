<?php

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;
use Nette\Utils\Json;
use URBITECH\Utils\Position;
use Nette\Utils\Validators;

class PositionInput extends \Nette\Forms\Controls\BaseControl
{
	/** @var string */
	private	$lat = '';

	private $lon = '';

	private $placeId = '';

	private $placeName = '';

	const DEFAULT_LAT = 49.8167003;

	const DEFAULT_LNG = 15.4749544;

	const DEFAULT_ZOOM = 15;

	const SEARCH_ZOOM = 18; // MAX 18


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
		$this->placeId = $this->getHttpData(Form::DATA_LINE, '[placeId]');
	}


	/**
	 * @return Position|NULL
	 */
	public function getValue()
	{
		return self::validatePosition($this)
			? new Position($this->lat, $this->lon, $this->placeId)
			: NULL;
	}


	public function setValue($value)
	{
		if ($value === NULL) {
			$this->lat = $this->lon = '';
		} else {
			$this->lat = $value->getLatitude();
			$this->lon = $value->getLongitude();
			$this->placeId = $value->getPlace();
			$this->placeName = $value->getName();
		}
		return $this;
	}

	public function getControl()
	{

		$name = $this->getHtmlName();
		$nameContainer = ($this->getOption("controls-id")) ?: $name . '-container';

		//$rules = Helpers::exportRules($this->getRules()) ?: NULL;
		$rules = $this->modifyRulesControl(Helpers::exportRules($this->getRules())) ?: NULL;

		if ($this->getOption("data-useButton") && !$this->getOption("data-autofill-address")) {
			$useButton = Html::el('a', [
				'data-block-id' => $nameContainer,
				'href' => "#",
				'class' => $nameContainer . '[mapAddressUse] useButton usePosition btn btn-primary',
			])
				->setText($this->getOption('use-button-label') ? $this->translate($this->getOption('use-button-label')) : $this->translate('forms.button.use'));
		} else {
			$useButton = "";
		}

		$defaultStreetOption = Html::el('option', [
			'value' => $this->placeId,
			'selected' => "selected"
		])->setText($this->placeName);

		$el = Html::el('div')->setClass('col-sm-6')->setHtml(
			Html::el('input', [
				'type' => 'text',
				'name' => $name . '[mapAddressLat]',
				'value' => $this->lat,
				'class' => $nameContainer . '[mapAddressLat] form-control mapPositionInput',
				'readonly' => true
			])->setAttribute('data-nette-rules', $rules)
		)

			. Html::el('div')->setClass('col-sm-6')->setHtml(
				Html::el('input', [
					'type' => 'text',
					'name' => $name . '[mapAddressLon]',
					'value' => $this->lon,
					'class' => $nameContainer . '[mapAddressLon] form-control mapPositionInput',
					'readonly' => true
				])->setAttribute('data-nette-rules', $rules)
			)

			. Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('select', [
					'name' => $name . '[placeId]',
					'class' => $nameContainer . '[placeName] form-control mapPositionInput formAddressInput',
					'data-block-id' => $nameContainer,
					'data-url' => $this->getOption('data-url-places'),
					'data-url-lat' => $this->getOption('data-url-lat'),
					'data-url-lng' => $this->getOption('data-url-lng')
				])->setHtml($defaultStreetOption)
					. Html::el('div')->setClass('map-box')->setHtml(

						Html::el('div', [
							'id' => $nameContainer . '-map',
							'class' => 'mapInit',
							'data-map-container' => $nameContainer,
							'data-map-options' => Json::encode([
								'lat' => $this->getOption('map-lat') ?: self::DEFAULT_LAT,
								'lon' => $this->getOption('map-lon') ?: self::DEFAULT_LNG,
								'zoom' => $this->getOption('map-zoom') ?: self::DEFAULT_ZOOM,
								'searchZoom' => $this->getOption('map-searchZoom') ?: self::SEARCH_ZOOM,
							])
						])
							. Html::el('a', [
								'id' => $nameContainer . '-markerDestroy',
								'class' => 'markerDestroy',
								'data-map-container' => $nameContainer,
								'href' => '#'
							])->setText('Zruš pozici')

					)
			)

			. Html::el('div')->setClass('col-sm-12')->setHtml(
				Html::el('div')->setClass($nameContainer . '[mapAddress] mapAddressFields row')->setHtml(

					Html::el('p')->setClass('col-sm-8')->setHtml(
						Html::el('strong')
							->setText($this->getOption('map-text-street') ? $this->translate($this->getOption('map-text-street')) : $this->translate('forms.address.street'))
							. Html::el('span')->setClass($nameContainer . '[mapAddressStreet]')
					)
						. Html::el('p')->setClass('col-sm-4')->setHtml(
							Html::el('strong')
								->setText($this->getOption('map-text-houseNmber') ? $this->translate($this->getOption('map-text-houseNumber')) : $this->translate('forms.address.houseNumber'))
								. Html::el('span')->setClass($nameContainer . '[mapAddressHouseNumber]')
						)
						. Html::el('p')->setClass('col-sm-8')->setHtml(
							Html::el('strong')
								->setText($this->getOption('map-text-city') ? $this->translate($this->getOption('map-text-city')) : $this->translate('forms.address.city'))
								. Html::el('span')->setClass($nameContainer . '[mapAddressCity]')
						)
						. Html::el('p')->setClass('col-sm-4')->setHtml(
							Html::el('strong')
								->setText($this->getOption('map-text-postCode') ? $this->translate($this->getOption('map-text-postCode')) : $this->translate('forms.address.postCode'))
								. Html::el('span')->setClass($nameContainer . '[mapAddressPostCode]')
						)
						. Html::el('p')->setClass('col-sm-3')->setHtml(
							$useButton
						)
				)
			);


		return Html::el('div')->setClass('row positionPanel')
			->setHtml($el)
			->setId($nameContainer)
			//->setAttribute('data-urbitech-form-position', 'mapPosition')
			->setAttribute('data-urbitech-form-address', $this->getOption("data-urbitech-form-address"))
			->setAttribute('data-country', $this->getOption("data-country"))
			->setAttribute('data-autofill-address', $this->getOption("data-autofill-address") ?: 0)
			->setAttribute('data-show-address-fields', $this->getOption("data-show-address-fields") ?: 0)
			->setAttribute('data-marker-draggable', $this->getOption("data-marker-draggable") ?: 0);
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
		Container::extensionMethod('addPositionInput', function (Container $container, $name, $label = NULL, $callback = NULL) {
			return $container[$name] = new PositionInput($label);
		});
	}
}
