/*!
 * fmog.js 0.1
 * http://lab.hakim.se/fmog
 * MIT licensed
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	var CANVAS_WIDTH = 170,
		CANVAS_HEIGHT = 170,
		TAG_HEIGHT = 30,
		TAG_WIDTH = 200,
		TAG_FONT_SIZE = 13,
		TAG_TEXT  = 'Fork me on GitHub';

	var container,
		canvas,
		context,

		world = {
			width: 1,
			height: 1,
			gravity: 1
		},

		handle = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			ox: -TAG_WIDTH * 0.58, 
			oy: -TAG_HEIGHT * 0.3,
			rotation: 45,
			detached: false
		},

		spring = {
			start: new Point( -TAG_WIDTH * 0.58, -TAG_HEIGHT * 0.3 ),
			end: new Point( -TAG_WIDTH * 0.58, -TAG_HEIGHT * 0.3 )
		},

		mouse = new Point();

	function initialize() {

		var container = document.querySelector( '.fmog' );

		if( container ) {
			
			canvas = document.createElement( 'canvas' );
			context = canvas.getContext( '2d' );

			resize();

			container.style.width = world.width + 'px';
			container.style.height = world.height + 'px';
			container.appendChild( canvas );

			animate();

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mousedown', onMouseDown, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			window.addEventListener( 'resize', resize, false );

		}

	}

	function resize() {
		// if( handle.detached ) {
			world.width = window.innerWidth;
			world.height = window.innerHeight;
		// }
		// else {
		// 	world.width = CANVAS_WIDTH;
		// 	world.height = CANVAS_HEIGHT;
		// }

		canvas.width = world.width;
		canvas.height = world.height;
	}

	function onMouseMove( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	function onMouseDown( event ) {
		
	}

	function onMouseUp( event ) {
		
	}

	function animate() {

		// TODO: Reduce size
		context.clearRect( 0, 0, world.width, world.height );

		update();
		render();

		requestAnimFrame( animate );
	}

	function update() {
		var distance = mouse.distanceTo( world.width, 0 );

		if( distance < TAG_WIDTH ) {
			handle.detached = true;
		}
		else if( !mouse.down && distance > TAG_WIDTH * 2 ) {
			handle.detached = false;
		}

		if( handle.detached ) {
			var tx = mouse.x - world.width,
				ty = mouse.y;

			handle.vy *= 0.96;
			handle.vy += world.gravity;

			if(  )

			handle.y += handle.vy;

			// handle.x += ( tx - handle.x ) * 0.1;
			// handle.y += ( ty - handle.y ) * 0.1;

			handle.ox *= 0.9;
			handle.oy += ( -TAG_WIDTH - handle.oy ) * 0.1;
			handle.rotation += ( 90 - handle.rotation ) * 0.1;
		}
		else {
			handle.x *= 0.9;
			handle.y *= 0.9;

			handle.ox += ( ( -TAG_WIDTH * 0.58 ) - handle.ox ) * 0.1;
			handle.oy += ( ( -TAG_HEIGHT * 0.3 ) - handle.oy ) * 0.1;
			handle.rotation += ( 45 - handle.rotation ) * 0.1;
		}
	}

	function render() {
		context.save();
		context.translate( world.width, -TAG_HEIGHT / 2 );
		context.translate( handle.ox, handle.oy );
		context.translate( handle.x, handle.y );
		context.rotate( handle.rotation / 180 * Math.PI );

		context.fillStyle = '#aa0000';
		context.fillRect( 0, 0, TAG_WIDTH, TAG_HEIGHT );

		context.strokeStyle = 'rgba( 255, 255, 255, 0.3 )';
		context.strokeRect( 1.5, 1.5, TAG_WIDTH-3, TAG_HEIGHT-3 );
		context.strokeStyle = '';

		context.shadowBlur = 4;
		context.shadowColor = 'rgba( 0, 0, 0, 0.4 )';
		context.font = 'bold ' + TAG_FONT_SIZE + 'px Arial';
		context.fillStyle = '#ffffff';
		context.fillText( TAG_TEXT, ( TAG_WIDTH - context.measureText( TAG_TEXT ).width ) / 2, ( TAG_HEIGHT / 2 ) + 4 );

		context.restore();
	}

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame 		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame		||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})();

	/**
	 * Defines a 2D position.
	 */
	function Point( x, y ) {
		this.x = x || 0; 
		this.y = y || 0;
	}

	Point.prototype.distanceTo = function( x, y ) {
		var dx = x-this.x;
		var dy = y-this.y;
		return Math.sqrt(dx*dx + dy*dy);
	};

	Point.prototype.clone = function() {
		return new Point( this.x, this.y );
	};

	Point.prototype.interpolate = function( x, y, amp ) {
		this.x += ( x - this.x ) * amp;
		this.y += ( y - this.y ) * amp;
	};

	initialize();

})();

