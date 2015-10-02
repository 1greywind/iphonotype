angular.module('iphonotype', [])
.service('sounds', function(){
	
	return {
		clock: new Audio('files/snd/clock.wav'),
		start: new Audio('files/snd/start.wav'),
		ding: new Audio('files/snd/ding.wav'),
		complete: new Audio('files/snd/end.wav'),
		
		stopAll: function() {
			clock.pause()
			complete.pause()
			ding.pause()
			start.pause()
		}
	}
})
.controller('mainController', ['$scope', '$timeout', '$document', '$window', 'sounds', function($s, $t, $doc, $w, sounds){
	
	$s.mode = "normal"
	$s.state = "home"
	$s.invert_print = true
	$s.min_time = 1
	$s.max_time = 1001
	$s.test_steps = 10
	$s.test_strip_margin = 10
	$s.steps_in_scale = 20
	$s.before_test_delay = 4000
	$s.after_test_delay = 3000
	$s.table_style = 0
	
	$s.print_delay = 5000
	$s.print_exposure_time = 1000
	
	var drawing_methods = [draw_neg_test_table, draw_test_table]
	
	this.set_mode = function(mode) {
		$s.mode = mode
	}
	
	this.begin_test = function() {
		$s.state = "test"
		var test_duration = drawing_methods[$s.table_style]()
		
		var delay = test_duration + $s.after_test_delay
		
		$t(function(){ sounds.start.play()}, $s.before_test_delay - 2000)
		$t(function(){ sounds.complete.play()}, test_duration)
		
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
		ctx.strokeStyle = "rgb(0, 0, 0)"
		ctx.font = "12px sans";
		ctx.textAlign = "center"
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
			
			var draw = draw_test_strip(ctx, start_x + (gap+step_w)*i, start_y, step_w, step_h, steps, current_duration + " ms")
			
			var clear = function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height)
			}
			
			$t(draw, delay)
			$t(clear, delay + current_duration)
			
			delay += current_duration
		}
		
		return delay
	}

	function draw_neg_test_table() {
	
		var canvas = $doc[0].querySelector('#screen')
		
		canvas.width = $w.innerWidth
		canvas.height = $w.innerHeight

		var ctx	= canvas.getContext('2d')
		ctx.strokeStyle = "rgb(255, 255, 255)"
		ctx.font = "12px sans";
		ctx.textAlign = "center"
		ctx.fillStyle = "rgb(0, 0, 0)"
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		
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
			
			var draw = draw_test_strip(ctx, start_x + (gap+step_w)*i, start_y, step_w, step_h, steps, current_duration + " ms")
			
			var clear = function() {
				ctx.fillStyle = "rgb(0, 0, 0)"
				ctx.fillRect(0, 0, canvas.width, canvas.height)
			}
			
			$t(draw, delay)
			$t(clear, delay + current_duration)
			
			delay += current_duration
		}
		
		return delay
	}
	
	function draw_test_strip(ctx, x, y, step_w, step_h, steps, label) {
		return function() {
			
			sounds.ding.play()

			ctx.strokeRect(x, y, step_w, step_h*steps)
			
			for (var i=0; i<steps; i++) {
				var val = Math.round((255/(steps-1))*i)
				var color = "rgb($, $, $)".replace(/\$/g, val)
				ctx.fillStyle = color
				var ty = y + step_h*i
				ctx.fillRect(x, ty, step_w, step_h)
			}
			
			ctx.strokeText(label, x + step_w/2, ty + step_h + 20)
		}
	}
}])