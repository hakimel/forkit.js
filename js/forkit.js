/*!
 * forkit.js 0.1
 * http://lab.hakim.se/forkit-js
 * MIT licensed
 *
 * The state of the code is crude at best, will clean it up soon.
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	var TAG_HEIGHT = 30,
		TAG_WIDTH = 200,
		DRAG_THRESHOLD = 0.1;

		VENDORS = [ 'Webkit', 'Moz', 'O', 'ms' ];

	var ribbonElement,
		stringElement,
		tagElement,
		targetElement,

		activeText = '',
		inactiveText = '',

		gravity = 2,

		originalX = TAG_WIDTH * 0.4,
		originalY = -TAG_HEIGHT * 0.5,

		velocityX = 0,
		velocityY = 0,
		rotation = 45,

		dragX = 0,
		dragY = 0,

		targetY = 0,

		detached = false,
		dragging = false,
		released = false,

		anchorA = new Point( originalX, originalY ),
		anchorB = new Point( originalX, originalY ),

		mouse = new Point();

	function initialize() {

		ribbonElement = document.querySelector( '.forkit' );
		targetElement = document.querySelector( '.forkit-target' );

		if( ribbonElement ) {

			// Fetch label texts from DOM
			activeText = ribbonElement.getAttribute( 'data-text-active' ) || '';
			inactiveText = ribbonElement.getAttribute( 'data-text' ) || '';

			// Construct the sub-elements required to represent the 
			// tag and string that it hangs from
			ribbonElement.innerHTML = '<span class="string"></span>'
										+ '<span class="tag">' + inactiveText + '</span>';

			stringElement = ribbonElement.querySelector( '.string' );
			tagElement = ribbonElement.querySelector( '.tag' );

			animate();

			ribbonElement.addEventListener( 'click', onRibbonClick, false );
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mousedown', onMouseDown, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

		}

	}

	function onMouseMove( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	function onMouseDown( event ) {
		if( targetElement ) {
			event.preventDefault();

			dragging = true;

			dragX = event.clientX;
			dragY = event.clientY;
		}
	}

	function onMouseUp( event ) {
		dragging = false;
	}

	function onRibbonClick( event ) {
		if( targetElement ) {
			event.preventDefault();
		}
	}

	function animate() {
		update();
		render();

		requestAnimFrame( animate );
	}

	function update() {
		var distance = distanceBetween( mouse.x, mouse.y, window.innerWidth, 0 );

		// Detach the tag when we're close enough
		if( distance < TAG_WIDTH * 1.5 ) {
			detached = true;
			tagElement.innerHTML = activeText;
		}
		// Re-attach the tag if the user mouse away
		else if( !dragging && distance > TAG_WIDTH * 2 ) {
			detached = false;
			tagElement.innerHTML = inactiveText;
		}

		if( dragging ) {
			targetY = Math.max( mouse.y - dragY, 0 );
		}
		else if( !released ) {
			targetY *= 0.8;
		}

		if( detached ) {
			var containerOffsetX = ribbonElement.offsetLeft;

			velocityY *= 0.94;
			velocityY += gravity;

			var offsetX = ( ( mouse.x - containerOffsetX ) - originalX ) * 0.2;
			
			anchorB.x += ( ( originalX + offsetX ) - anchorB.x ) * 0.1;
			anchorB.y += velocityY;

			var strain = distanceBetween( anchorA.x, anchorA.y, anchorB.x, anchorB.y );

			if( strain > 40 ) {
				velocityY -= Math.abs( strain ) / 40;
			}

			var dy = Math.max( mouse.y - anchorB.y, 0 ),
				dx = mouse.x - ( containerOffsetX + anchorB.x );

			var angle = Math.atan2( dy, dx ) * 180 / Math.PI;
			angle = Math.min( 130, Math.max( 50, angle ) );

			rotation += ( angle - rotation ) * 0.1;
		}
		else {
			anchorB.x += ( anchorA.x - anchorB.x ) * 0.2;
			anchorB.y += ( anchorA.y - anchorB.y ) * 0.2;

			rotation += ( 45 - rotation ) * 0.2;
		}
	}

	function render() {

		targetElement.style.top = - 100 + Math.min( ( targetY / window.innerHeight ) * 100, 100 ) + '%';
		ribbonElement.style[ prefix( 'transform' ) ] = transform( 0, targetY, 0 );
		
		tagElement.style[ prefix( 'transform' ) ] = transform( anchorB.x, anchorB.y, rotation );

		var dy = anchorB.y - anchorA.y,
			dx = anchorB.x - anchorA.x;

		var angle = Math.atan2( dy, dx ) * 180 / Math.PI;

		stringElement.style.width = anchorB.y + 'px';
		stringElement.style[ prefix( 'transform' ) ] = transform( anchorA.x, 0, angle );

	}

	function prefix( property, el ) {
		var propertyUC = property.slice( 0, 1 ).toUpperCase() + property.slice( 1 );

		for( var i = 0, len = VENDORS.length; i < len; i++ ) {
			var vendor = VENDORS[i];

			if( typeof ( el || document.body ).style[ vendor + propertyUC ] !== 'undefined' ) {
				return vendor + propertyUC;
			}
		}

		return property;
	}

	function transform( x, y, r ) {
		return 'translate('+x+'px,'+y+'px) rotate('+r+'deg)';
	}

	function distanceBetween( x1, y1, x2, y2 ) {
		var dx = x1-x2;
		var dy = y1-y2;
		return Math.sqrt(dx*dx + dy*dy);
	}

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

	initialize();

})();

