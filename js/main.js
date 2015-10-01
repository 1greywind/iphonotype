angular.module('iphonotype', [])
.controller('mainController', ['$scope', '$timeout', '$document', '$window', function($s, $t, $doc, $w){
	
	$s.state = "home"
	$s.invert_print = true
	$s.min_time = 1
	$s.max_time = 1001
	$s.test_steps = 10
	$s.test_strip_margin = 10
	$s.steps_in_scale = 20
	$s.before_test_delay = 5000
	$s.after_test_delay = 5000
	
	$s.print_delay = 5000
	$s.print_exposure_time = 1000
	
	this.begin_test = function() {
		console.log("here", $s.state)
		$s.state = "test"
		var test_duration = draw_test_table()
		
		var delay = test_duration + $s.after_test_delay
		
		$t(function() {
			$s.state = "home"
		}, delay)
	}
	
	this.begin_print = function() {
				
	}

	function draw_test_table() {
	
		var canvas = $doc[0].querySelector('#screen')
		
		canvas.width = $w.innerWidth
		canvas.height = $w.innerHeight

		var ctx	= canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		
		var steps = $s.steps_in_scale
		var fraction = $s.test_strip_margin/100
		var table_width = canvas.width * (1 - fraction)
		var table_height = canvas.height * (1 - fraction)
		var start_x = canvas.width * fraction/2
		var start_y = canvas.height * fraction/2
		var step_h = (table_height/steps)
		var step_w = step_h
		
		var delay = $s.after_test_delay
		var duration_step = ($s.max_time - $s.min_time)/$s.test_steps
		
		var gap = (table_width - step_w * $s.test_steps) / ($s.test_steps - 1)
		
		for (var i=0; i<$s.test_steps; i++) {
			
			var current_duration = duration_step*(i+1)
			
			var draw = draw_test_strip(ctx, start_x + (gap+step_w)*i, start_y, step_w, step_h, steps)
			
			var clear = function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height)
			}
			
			$t(draw, delay)
			$t(clear, delay + current_duration)
			
			console.log(duration_step, i, current_duration, delay, delay + current_duration)
			
			delay += current_duration
		}
		
		return delay
	}
	
	function draw_test_strip(ctx, x, y, step_w, step_h, steps) {
		return function() {
			ctx.strokeRect(x, y, step_w, step_h*steps)
			
			for (var i=0; i<steps; i++) {
				var val = Math.round((255/(steps-1))*i)
				var color = "rgb($, $, $)".replace(/\$/g, val)
				ctx.fillStyle = color
				ctx.fillRect(x, y + step_h*i, step_w, step_h)
			}
		}
	}
}])