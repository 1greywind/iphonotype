angular.module('iphonotype', [])
.controller('mainController', ['$scope', function($s){
	
	$s.state = "home"
	$s.invert_print = true
}])