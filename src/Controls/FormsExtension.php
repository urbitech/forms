<?php

namespace URBITECH\Forms\DI;

use Nette;
use Nette\DI\CompilerExtension;


final class FormsExtension extends CompilerExtension {
	
	public function afterCompile(Nette\PhpGenerator\ClassType $class)
	{

		$init = $class->methods["initialize"];
		
		$init->addBody('\URBITECH\Forms\Controls\AddressInput::register();');
		$init->addBody('\URBITECH\Forms\Controls\PositionInput::register();');
		
	}
}