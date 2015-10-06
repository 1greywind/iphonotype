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
.service('state', function(){
	return {
		
		examples: [
			{src: "files/examples/curves_admiralt.jpg", id: 'curves_admiralt' },
			{src: "files/examples/curves_door.jpg", id: 'curves_door' },
			{src: "files/examples/curves_evpatoria.jpg", id: 'curves_evpatoria' },
			{src: "files/examples/curves_isakiy.jpg", id: 'curves_isakiy' },
			{src: "files/examples/curves_rails.jpg", id: 'curves_rails' },
			{src: "files/examples/curves_stones.jpg", id: 'curves_stones' },
			{src: "files/examples/curves_tree.jpg", id: 'curves_tree' },
			{src: "files/examples/curves_tree2.jpg", id: 'curves_tree2' },
			{src: "files/examples/curves_trees_and_water.jpg", id: 'curves_trees_and_water' },
			{src: "files/examples/curves_trees_and_water2.jpg", id: 'curves_trees_and_water2' },
			{src: "files/examples/evpatoria.jpg", id: 'evpatoria' },
			{src: "files/examples/rails.jpg", id: 'rails' },
			{src: "files/examples/stones.jpg", id: 'stones' },
			{src: "files/examples/tree.jpg", id: 'tree' },
			{src: "files/examples/tree2.jpg", id: 'tree2' },
			{src: "files/examples/trees_and_water.jpg", id: 'trees_and_water' },
			{src: "files/examples/trees_and_water2.jpg", id: 'trees_and_water2' }
		],
		
		mode: "normal",
		state: "home",
		invert_print:  true,
		min_time:  1,
		max_time:  1001,
		test_steps:  10,
		test_strip_margin:  10,
		steps_in_scale:  20,
		before_test_delay:  4000,
		after_test_delay:  3000,
		table_style:  0,
		
		print_url:  "",
		before_print_delay:  5000,
		after_print_delay:  5000,
		print_exposure_time:  1000,
		grayscale_print:  false,
		invert_print:  true
	}
	
})
.controller('mainController', ['$scope', 'state', '$timeout', '$document', '$window', 'sounds', function($s, st, $t, $doc, $w, sounds){
	
	$s.state = st
	st.mode = "normal"
	st.state = "home"
	st.invert_print = true
	st.min_time = 1
	st.max_time = 1001
	st.test_steps = 10
	st.test_strip_margin = 10
	st.steps_in_scale = 20
	st.before_test_delay = 4000
	st.after_test_delay = 3000
	st.table_style = 0
	
	st.print_url = ""
	st.before_print_delay = 5000
	st.after_print_delay = 5000
	st.print_exposure_time = 1000
	st.grayscale_print = false
	st.invert_print = true
	
	var drawing_methods = [draw_neg_test_table, draw_test_table]
	
	this.set_mode = function(mode) {
		st.mode = mode
	}
	
	this.begin_test = function() {
		st.state = "screen"
		var test_duration = drawing_methods[st.table_style]()
		
		var delay = test_duration + st.after_test_delay
		
		$t(function(){ sounds.start.play()}, st.before_test_delay - 2000)
		$t(function(){ sounds.complete.play()}, test_duration)
		
		$t(function() {
			st.state = "home"
		}, delay)
	}
	
	this.begin_print = function() {
		
		if (st.print_url != "") {
			
			st.state = "screen"
			
			load_image(st.print_url)
		}
		else if (st.example_id != "") {
			
			st.state = "screen"

			on_image_load($doc[0].getElementById(st.example_id))
		}
		
	}
	
	function load_image(url) {
		var img = $doc[0].createElement("img")
		img.src = url
		img.onload = function() {
			on_image_load(img)
		}
	}
	
	function on_image_load(img) {
		var delay = st.before_test_delay + st.print_exposure_time + st.after_test_delay
		
		var b = function(){
			
			sounds.start.removeEventListener("ended", b)
			
			draw_print_image(img)
			
			$t(function(){
				
				black_fill_canvas()
				sounds.complete.play()
				
				$t(function() {
					st.state = "home"
				}, st.after_print_delay)
				
			}, st.print_exposure_time)
		}
		
		$t(function(){ sounds.start.play()}, st.before_test_delay - 1000)
		sounds.start.addEventListener("ended", b)

		
		$t(function() {
			st.state = "home"
		}, delay)
	}
	
	function black_fill_canvas() {
		var canvas = $doc[0].querySelector('#screen')
		var ctx	= canvas.getContext('2d')
		ctx.fillStyle = "rgb(0, 0, 0)"
		ctx.fillRect(0, 0, canvas.width, canvas.height)
	}
	
	function draw_print_image(img) {
		var canvas = $doc[0].querySelector('#screen')
		
		canvas.width = $w.innerWidth
		canvas.height = $w.innerHeight

		var ctx	= canvas.getContext('2d')
		ctx.fillStyle = "rgb(0, 0, 0)"
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		
		var k = Math.min(canvas.width/img.width, canvas.height/img.height)
		var w = img.width*k
		var h = img.height*k
		var x = (canvas.width - w)/2
		var y = (canvas.height -h)/2
		
		ctx.drawImage(img, x, y, w, h)
		
		var bitmapData = ctx.getImageData(x, y, w, h)
		
		if (st.grayscale_print) {
			grayscale(bitmapData)
		}
		
		if (st.invert_print) {
			invert(bitmapData)
		}
		
		ctx.putImageData(bitmapData, x, y);
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
		
		var steps = st.steps_in_scale
		var fraction = st.test_strip_margin/100
		var table_width = canvas.width * (1 - fraction)
		var table_height = canvas.height * (1 - fraction)
		var start_x = canvas.width * fraction/2
		var start_y = canvas.height * fraction/2
		var step_h = (table_height/steps)
		var step_w = step_h
		
		var delay = st.after_test_delay
		var duration_step = (st.max_time - st.min_time)/st.test_steps
		
		var gap = (table_width - step_w * st.test_steps) / (st.test_steps - 1)
		
		for (var i=0; i<st.test_steps; i++) {
			
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
		
		var steps = st.steps_in_scale
		var fraction = st.test_strip_margin/100
		var table_width = canvas.width * (1 - fraction)
		var table_height = canvas.height * (1 - fraction)
		var start_x = canvas.width * fraction/2
		var start_y = canvas.height * fraction/2
		var step_h = (table_height/steps)
		var step_w = step_h
		
		var delay = st.after_test_delay
		var duration_step = (st.max_time - st.min_time)/st.test_steps
		
		var gap = (table_width - step_w * st.test_steps) / (st.test_steps - 1)
		
		for (var i=0; i<st.test_steps; i++) {
			
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
	
	function grayscale(bitmapData) {
		var pixels = bitmapData.data;
		for (var i = 0, n = pixels.length; i < n; i += 4) {
			var grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
			pixels[i] = grayscale;
			pixels[i+1] = grayscale;
			pixels[i+2] = grayscale;
		}
	}

	function invert(bitmapData) {
		var pixels = bitmapData.data;
		for (var i = 0; i < pixels.length; i += 4) {
			pixels[i]   = 255 - pixels[i];   // red
			pixels[i+1] = 255 - pixels[i+1]; // green
			pixels[i+2] = 255 - pixels[i+2]; // blue
		}
	} 
}])
.directive('recentImages', ['$document', function($doc){
	
	return {
		scope: {
			selectedUrl: "=ngModel"
		},
		template: "<div>123</div>",
		link: function($s, $el, $attr) {
			
			var cont = $doc[0].createElement('div')
			
			var elem = $el[0]
			//elem.parentNode.insertBefore(cont, elem)
			
			console.log("link")
		}		
	}
}])