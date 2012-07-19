/*!
 * fmog.js 0.1
 * http://lab.hakim.se/fmog
 * MIT licensed
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	var TAG_HEIGHT = 30,
		TAG_WIDTH = 200,
		TAG_FONT_SIZE = 13,
		TAG_TEXT  = 'Fork me on GitHub';

	var container,
		canvas,
		context,

		world = {
			width: 400,
			height: 400,
			gravity: 2
		},

		handle = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			rotation: 45,
			detached: false
		},

		spring = {
			start: new Point(),
			end: new Point()
		},

		mouse = new Point();

	function initialize() {

		container = document.querySelector( '.fmog' );

		if( container ) {
			
			canvas = document.createElement( 'canvas' );
			context = canvas.getContext( '2d' );
			container.appendChild( canvas );

			container.style.position = 'absolute';
			container.style['top'] = 0;
			container.style['right'] = 0;
			container.style['pointer-events'] = 'none';

			resize();
			animate();

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mousedown', onMouseDown, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			window.addEventListener( 'resize', resize, false );

		}

	}

	function resize() {
		canvas.width = world.width;
		canvas.height = world.height;

		container.style.width = world.width + 'px';
		container.style.height = world.height + 'px';
	}

	function onMouseMove( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	function onMouseDown( event ) {
		
	}

	function onMouseUp( event ) {
		window.open( container.getAttribute( 'href' ), '_self' );
	}

	function animate() {
		// TODO: Reduce size
		// context.clearRect( 0, 0, world.width, world.height );
		canvas.width = canvas.width;

		update();
		render();

		requestAnimFrame( animate );
	}

	function update() {
		var distance = mouse.distanceTo( window.innerWidth, 0 );

		if( distance < TAG_WIDTH ) {
			handle.detached = true;
		}
		else if( !mouse.down && distance > TAG_WIDTH * 2 ) {
			handle.detached = false;
		}

		if( handle.detached ) {
			handle.vy *= 0.94;
			handle.vy += world.gravity;

			spring.end.y += handle.vy;

			var strain = spring.start.distanceTo( spring.end.x, spring.end.y );

			if( strain > 40 ) {
				handle.vy -= Math.abs( strain ) / 40;
			}

			var angleOffset = Math.atan2( mouse.y - spring.end.y, mouse.x - spring.end.x ) * 180 / Math.PI;

			handle.rotation += ( ( 90 + angleOffset ) - handle.rotation ) * 0.1;
		}
		else {
			spring.end.x *= 0.8;
			spring.end.y *= 0.8;

			handle.rotation += ( 45 - handle.rotation ) * 0.1;
		}
	}

	function render() {
		context.save();
		context.translate( world.width - ( TAG_WIDTH * 0.58 ), -TAG_HEIGHT * 0.75 );
		context.translate( spring.end.x, spring.end.y );

		context.save();
		context.translate( -TAG_HEIGHT / 2, 0 );
		context.moveTo( spring.end.x, -spring.end.y );
		context.lineTo( 0, 0 );
		context.lineWidth = 2;
		context.strokeStyle = '#fff';
		context.stroke();
		context.restore();

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

