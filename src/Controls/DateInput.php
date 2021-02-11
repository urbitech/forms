<?php

/**
 * Nette Forms date input
 */

namespace URBITECH\Forms\Controls;

use Nette\Forms\Container;
use Nette\Forms\Form;
use Nette\Utils\Html;
use Nette\Forms\Helpers;


class DateInput extends \Nette\Forms\Controls\BaseControl
{
	/** @var string */
	private	$day = '';

	private $month = '';

	private $year = '';


	public function __construct($label = NULL)
	{
		parent::__construct($label);
		$this->addCondition(Form::FILLED)
			->addRule(__CLASS__ . '::validateDate', 'forms.date.validDate');
	}


	public function setValue($value)
	{
		if ($value === NULL) {
			$this->day = $this->month = $this->year = '';
		} else {
			$date = \Nette\Utils\DateTime::from($value);
			$this->day = $date->format('j');
			$this->month = $date->format('n');
			$this->year = $date->format('Y');
		}
		return $this;
	}


	/**
	 * @return DateTimeImmutable|NULL
	 */
	public function getValue()
	{
		return self::validateDate($this)
			? (new \DateTimeImmutable)->setDate($this->year, $this->month, $this->day)->setTime(0, 0)
			: NULL;
	}


	/**
	 * @return bool
	 */
	public function isFilled(): bool
	{
		return $this->day !== '' || $this->month !== '' || $this->year !== '';
	}


	public function loadHttpData(): void
	{
		$this->day = $this->getHttpData(Form::DATA_LINE, '[day]');
		$this->month = $this->getHttpData(Form::DATA_LINE, '[month]');
		$this->year = $this->getHttpData(Form::DATA_LINE, '[year]');
	}


	/**
	 * Generates control's HTML element.
	 */
	public function getControl()
	{
		$name = $this->getHtmlName();
		$placeholders = $this->getOption('placeholder');

		$promptDay = isset($placeholders[0]) ? ['' => $this->translate($placeholders[0])] : [];
		$promptMonth = isset($placeholders[1]) ? ['' => $this->translate($placeholders[1])] : [];


		//$rules = Helpers::exportRules($this->getRules()) ?: NULL;
		$rules = $this->modifyRulesControl(Helpers::exportRules($this->getRules())) ?: NULL;

		$input = Html::el('div')->setClass('col-md-4')->setHtml(
			Helpers::createSelectBox(
				$promptDay + [1 => 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
				['selected?' => $this->day]
			)
				->name($name . '[day]')->setClass('form-control')
				->setAttribute('data-nette-rules', $rules)
		)
			->setId($this->getHtmlId())

			. Html::el('div')->setClass('col-md-4')->setHtml(
				Helpers::createSelectBox(
					$promptMonth + [1 => 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
					['selected?' => $this->month]
				)
					->name($name . '[month]')->setClass('form-control')
					->setAttribute('data-nette-rules', $rules)
			)

			. Html::el('div')->setClass('col-md-4')->setHtml(Html::el('input', [
				'name' => $name . '[year]',
				'value' => $this->year,
				'type' => 'number',
				'min' => 1900,
				'max' => date('Y'),
				'placeholder' => isset($placeholders[2]) ? $this->translate($placeholders[2]) : NULL,
				'class' => 'form-control'
			])->setAttribute('data-nette-rules', $rules));


		return Html::el('div')->setClass('row')
			->setHtml($input);
	}


	private function modifyRulesControl($rules)
	{

		foreach ($rules as $key => $rule) {
			if (isset($rule['control'])) {
				$rules[$key]['control'] .= '[year]';
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
	public static function validateDate(\Nette\Forms\IControl $control)
	{
		return ctype_digit($control->day)
			&& ctype_digit($control->month)
			&& ctype_digit($control->year)
			&& checkdate($control->month, $control->day, $control->year);
	}


	public static function register()
	{
		Container::extensionMethod('addDateInput', function (Container $container, $name, $label = NULL, $callback = NULL) {
			return $container[$name] = new DateInput($label);
		});
	}
}
