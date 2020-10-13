<?php

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;
use URBITECH\Utils\Address;
use URBITECH\Utils\Validators;

class AddressInput extends \Nette\Forms\Controls\BaseControl
{
	/** @var string */
	private	$street = '';

	private	$houseNumber = '';

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
		return $this->houseNumber !== '' || $this->city !== '' || $this->postCode !== '';
	}


	public function loadHttpData(): void
	{
		$this->street = $this->getHttpData(Form::DATA_LINE, '[street]');
		$this->houseNumber = $this->getHttpData(Form::DATA_LINE, '[houseNumber]');
		$this->city = $this->getHttpData(Form::DATA_LINE, '[city]');
		$this->postCode = $this->getHttpData(Form::DATA_LINE, '[postCode]');
	}


	/**
	 * @return Address|NULL
	 */
	public function getValue()
	{
		return self::validateAddress($this)
			? new Address($this->street, $this->houseNumber, $this->city, $this->postCode)
			: NULL;
	}


	public function setValue($value)
	{
		if ($value === NULL) {
			$this->street = $this->houseNumber = $this->city = $this->postCode = '';
		} else {
			$this->street = $value->getStreet();
			$this->houseNumber = $value->getHouseNumber();
			$this->city = $value->getCity();
			$this->postCode = $value->getPostCode();
		}
		return $this;
	}


	public function getControl()
	{

		$name = $this->getHtmlName();
		$placeholders = $this->getOption('placeholder');
		$nameContainer = ($this->getOption("controls-id")) ?: $name . '-container';

		$rules = $this->modifyRulesControl(Helpers::exportRules($this->getRules())) ?: NULL;

		if ($this->getOption("data-useButton") && !$this->getOption("data-autofill-position")) {
			$useButton = Html::el('button', [
				'data-block-id' => $nameContainer,
				'class' => $nameContainer . '[mapAddressUse] useButton btn btn-primary',
			])
				->setText($this->getOption('use-button-label') ? $this->translate($this->getOption('use-button-label')) : $this->translate('forms.button.use'));
		} else {
			$useButton = "";
		}

		$el = Html::el('div')->setClass('col-sm-8')->setHtml(

			Html::el('input', [
				'type' => 'text',
				'name' => $name . '[street]',
				'value' => $this->street,
				'placeholder' => isset($placeholders[0]) ? $this->translate($placeholders[0]) : NULL,
				'class' => $nameContainer . '[street] form-control formAddressInput',
				'data-block-id' => $nameContainer,
				'autocomplete' => 'off',
				'autocomplete' => 'chrome-off',
			])->setId($this->getHtmlId())

		)
			. Html::el('div')->setClass('col-sm-4')->setHtml(

				Html::el('input', [
					'type' => 'text',
					'name' => $name . '[houseNumber]',
					'value' => $this->houseNumber,
					'placeholder' => isset($placeholders[3]) ? $this->translate($placeholders[3]) : NULL,
					'class' => $nameContainer . '[houseNumber] form-control formAddressInput',
					'data-block-id' => $nameContainer,
					'autocomplete' => 'off',
					'autocomplete' => 'chrome-off',
				])->setId($this->getHtmlId())->setAttribute('data-nette-rules', $rules)

			)

			. Html::el('div')->setClass('col-sm-8')->setHtml(

				Html::el('div')->setClass('whisperer-box')->setHtml(

					Html::el('input', [
						'type' => 'text',
						'name' => $name . '[city]',
						'value' => $this->city,
						'placeholder' => isset($placeholders[1]) ? $this->translate($placeholders[1]) : NULL,
						'class' => $nameContainer . '[city] form-control formAddressInput',
						'data-whisperer-list' => $nameContainer . '[whispererListCity]',
						'data-block-id' => $nameContainer,
						'autocomplete' => 'off',
						'autocomplete' => 'chrome-off'
					])->setAttribute('data-nette-rules', $rules)
						. Html::el('ul', [
							'class' => $nameContainer . '[whispererListCity] whispererList',
							'data-parent-input' => $nameContainer . "[city]",
							'data-block-id' => $nameContainer
						])

				)
			)

			. Html::el('div')->setClass('col-sm-4')->setHtml(

				Html::el('div')->setClass('whisperer-box')->setHtml(

					Html::el('input', [
						'type' => 'text',
						'name' => $name . '[postCode]',
						'value' => $this->postCode,
						'placeholder' => isset($placeholders[2]) ? $this->translate($placeholders[2]) : NULL,
						'class' => $nameContainer . '[postCode] form-control formAddressInput',
						'data-whisperer-list' => $nameContainer . '[whispererListPostCode]',
						'data-block-id' => $nameContainer,
						'autocomplete' => 'off',
						'autocomplete' => 'chrome-off'
					])->setAttribute('data-nette-rules', $rules)
						. Html::el('ul', [
							'class' => $nameContainer . '[whispererListPostCode] whispererList',
							'data-parent-input' => $nameContainer . "[postCode]",
							'data-block-id' => $nameContainer
						])

				)
			)

			. Html::el('div')->setClass('col-sm-12')->setHtml($useButton);


		return Html::el('div')->setClass('row')
			->setHtml($el)
			->setId($nameContainer)
			//->setAttribute('data-urbitech-form-address', 'addressWhisperer')
			->setAttribute('data-urbitech-form-position', $this->getOption("data-urbitech-form-position"))
			->setAttribute('data-country', $this->getOption("data-country"))
			->setAttribute('data-autofill-position', $this->getOption("data-autofill-position") ?: 0);
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
		return $control->houseNumber
			&& $control->city
			&& Validators::validatePostCode($control->postCode);
	}


	public static function register()
	{
		Container::extensionMethod('addAddressInput', function (Container $container, $name, $label = NULL, $callback = NULL) {
			return $container[$name] = new AddressInput($label);
		});
	}
}
