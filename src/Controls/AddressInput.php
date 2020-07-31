<?php

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;
use URBITECH\Utils\Address;
use URBITECH\Utils\Validators;

class AddressInput extends \Nette\Forms\Controls\BaseControl{
	/** @var string */
	private	$streetNumber = '';
	
	private $city = '';
	
	private $postCode = '';


	public function __construct($label = NULL)
	{
		parent::__construct($label);
		$this->addCondition(Form::FILLED)
			->addRule(__CLASS__ . '::validateAddress', 'forms.address.validAddress');
	}


	/**
	 * @return bool
	 */
	public function isFilled(): bool
	{
		return $this->streetNumber !== '' || $this->city !== '' || $this->postCode !== '';
	}


	public function loadHttpData(): void
	{
		$this->streetNumber = $this->getHttpData(Form::DATA_LINE, '[streetNumber]');
		$this->city = $this->getHttpData(Form::DATA_LINE, '[city]');
		$this->postCode = $this->getHttpData(Form::DATA_LINE, '[postCode]');
	}


	/**
	 * @return Address|NULL
	 */
	public function getValue()
	{
		return self::validateAddress($this)
			? new Address($this->postCode, $this->city, $this->streetNumber)
			: NULL;
	}


	public function setValue($value)
	{
		if ($value === NULL) {
			$this->streetNumber = $this->city = $this->postCode = '';
		} else {
			$this->streetNumber = $value->getStreetNumber();
			$this->city = $value->getCity();
			$this->postCode = $value->getPostCode();
		}
		return $this;
	}	


	public function getControl(){

		$name = $this->getHtmlName();
		$placeholders = $this->getOption('placeholder');

		//$rules = Helpers::exportRules($this->getRules()) ?: NULL;
		$rules = $this->modifyRulesControl(Helpers::exportRules($this->getRules())) ?: NULL;

		$el = Html::el('div')->setClass('col-sm-12')->setHtml(

				Html::el('input', [
					'type' => 'text',
					'name' => $name . '[streetNumber]',
					'value' => $this->streetNumber,
					'placeholder' => isset($placeholders[0]) ? $this->translate($placeholders[0]) : NULL,
					'class' => $name.'[streetNumber] form-control',
					'data-block-id' => $name
				])->setId($this->getHtmlId())->setAttribute('data-nette-rules', $rules)

			)

			.Html::el('div')->setClass('col-sm-8')->setHtml(

				Html::el('div')->setClass('whisperer-box')->setHtml(

					Html::el('input', [
						'type' => 'text',
						'name' => $name . '[city]',
						'value' => $this->city,
						'placeholder' => isset($placeholders[1]) ? $this->translate($placeholders[1]) : NULL,
						'class' => $name.'[city] form-control',
						'data-whisperer-list' => $name.'[whispererListCity]',
						'data-block-id' => $name,
						'autocomplete' => 'off'
					])->setAttribute('data-nette-rules', $rules)
					.Html::el('ul', [
						'class' => $name.'[whispererListCity] whispererList',
						'data-parent-input'=> $name."[city]",
						'data-block-id' => $name
					])

				)
			)

			.Html::el('div')->setClass('col-sm-4')->setHtml(

				Html::el('div')->setClass('whisperer-box')->setHtml(

					Html::el('input', [
						'type' => 'text',
						'name' => $name . '[postCode]',
						'value' => $this->postCode,
						'placeholder' => isset($placeholders[2]) ? $this->translate($placeholders[2]) : NULL,
						'class' => $name. '[postCode] form-control',
						'data-whisperer-list' => $name.'[whispererListPostCode]',
						'data-block-id' => $name,
						'autocomplete' => 'off'
						])->setAttribute('data-nette-rules', $rules)
					.Html::el('ul', [
						'class' => $name.'[whispererListPostCode] whispererList',
						'data-parent-input'=> $name."[postCode]",
						'data-block-id' => $name							
					])					

					)
			);


		return Html::el('div')->setClass('row')
			->setHtml($el)
			->setId($this->getOption("controls-id"))
			->setAttribute('data-urbitech-form-address', 'addressWhisperer')
			->setAttribute('data-urbitech-form-position', $this->getOption("data-urbitech-form-position"))
			->setAttribute('data-country', $this->getOption("data-country"))
		;

	}


	private function modifyRulesControl($rules)
	{

		foreach ($rules as $key => $rule) {
			if (isset($rule['control'])) {
				$rules[$key]['control'] .= '[postCode]';
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
	public static function validateAddress(AddressInput $control)
	{
		return $control->streetNumber
			&& $control->city
			&& Validators::validatePostCode($control->postCode);
	}

	
	public static function register()
	{
		Container::extensionMethod('addAddressInput', function(Container $container, $name, $label = NULL, $callback = NULL) {
			return $container[$name] = new AddressInput($label);
		});
	}
}