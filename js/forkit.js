/*!
 * forkit.js 0.2
 * http://lab.hakim.se/forkit-js
 * MIT licensed
 *
 * The state of the code is crude at best, will clean it up soon.
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	var STATE_CLOSED = 0,
		STATE_DETACHED = 1,
		STATE_OPENED = 2,

		TAG_HEIGHT = 30,
		TAG_WIDTH = 200,

		// Factor of page height that needs to be dragged for the 
		// curtain to fall
		DRAG_THRESHOLD = 0.36;

		VENDORS = [ 'Webkit', 'Moz', 'O', 'ms' ];

	var ribbonElement,
		stringElement,
		tagElement,
		curtainElement,

		state = STATE_CLOSED,

		// Ribbon text, correlates to states
		closedText = '',
		detachedText = '',
		openedText = '',

		gravity = 2,

		closedX = TAG_WIDTH * 0.4,
		closedY = -TAG_HEIGHT * 0.5,
		openedX = 0,
		openedY = -TAG_HEIGHT,

		velocityX = 0,
		velocityY = 0,
		rotation = 45,

		dragX = 0,
		dragY = 0,

		targetY = 0,
		currentY = 0,

		dragging = false,
		dragTime = 0,

		anchorA = new Point( closedX, closedY ),
		anchorB = new Point( closedX, closedY ),

		mouse = new Point();

	function initialize() {

		ribbonElement = document.querySelector( '.forkit' );
		curtainElement = document.querySelector( '.forkit-curtain' );

		if( ribbonElement ) {

			// Fetch label texts from DOM
			closedText = ribbonElement.getAttribute( 'data-text' ) || '';
			detachedText = ribbonElement.getAttribute( 'data-text-active' ) || 'Drag down >';
			openedText = ribbonElement.getAttribute( 'data-text-opened' ) || 'Close';

			// Construct the sub-elements required to represent the 
			// tag and string that it hangs from
			ribbonElement.innerHTML = '<span class="string"></span>'
										+ '<span class="tag">' + closedText + '</span>';

			stringElement = ribbonElement.querySelector( '.string' );
			tagElement = ribbonElement.querySelector( '.tag' );

			animate();

			ribbonElement.addEventListener( 'click', onRibbonClick, false );
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mousedown', onMouseDown, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			window.addEventListener( 'resize', layout, false );

		}

	}

	function onMouseDown( event ) {
		if( curtainElement && state === STATE_DETACHED ) {
			event.preventDefault();

			dragTime = Date.now();
			dragging = true;

			dragX = event.clientX;
			dragY = event.clientY;
		}
	}

	function onMouseMove( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	}

	function onMouseUp( event ) {
		if( state !== STATE_OPENED ) {
			state = STATE_CLOSED;
			dragging = false;
		}
	}

	function onRibbonClick( event ) {
		if( curtainElement ) {
			event.preventDefault();

			if( state === STATE_OPENED ) {
				close();
			}
			else if( Date.now() - dragTime < 300 ) {
				open();
			}
		}
	}

	function layout() {
		if( state === STATE_OPENED ) {
			targetY = window.innerHeight;
		}
	}

	function open() {
		dragging = false;
		state = STATE_OPENED;
		tagElement.innerHTML = openedText;
	}

	function close() {
		dragging = false;
		state = STATE_CLOSED;
		tagElement.innerHTML = closedText;
	}

	function detach() {
		state = STATE_DETACHED;
		tagElement.innerHTML = detachedText;
	}

	function animate() {
		update();
		render();

		requestAnimFrame( animate );
	}

	function update() {
		var distance = distanceBetween( mouse.x, mouse.y, window.innerWidth, 0 );

		if( state === STATE_OPENED ) {
			targetY = Math.min( targetY + ( window.innerHeight - targetY ) * 0.2, window.innerHeight );
		}
		else {

			// Detach the tag when we're close enough
			if( distance < TAG_WIDTH * 1.5 ) {
				detach();
			}
			// Re-attach the tag if the user mouse away
			else if( !dragging && state === STATE_DETACHED && distance > TAG_WIDTH * 2 ) {
				close();
			}

			if( dragging ) {
				targetY = Math.max( mouse.y - dragY, 0 );

				if( targetY > window.innerHeight * DRAG_THRESHOLD ) {
					open();
				}
			}
			else {
				targetY *= 0.8;
			}

		}

		if( dragging || state === STATE_DETACHED ) {
			var containerOffsetX = ribbonElement.offsetLeft;

			velocityY *= 0.94;
			velocityY += gravity;

			var offsetX = ( ( mouse.x - containerOffsetX ) - closedX ) * 0.2;
			
			anchorB.x += ( ( closedX + offsetX ) - anchorB.x ) * 0.1;
			anchorB.y += velocityY;

			var strain = distanceBetween( anchorA.x, anchorA.y, anchorB.x, anchorB.y );

			if( strain > 40 ) {
				velocityY -= Math.abs( strain ) / 40;
			}

			var dy = Math.max( mouse.y - anchorB.y, 0 ),
				dx = mouse.x - ( containerOffsetX + anchorB.x );

			var angle = Math.min( 130, Math.max( 50, Math.atan2( dy, dx ) * 180 / Math.PI ) );

			rotation += ( angle - rotation ) * 0.1;
		}
		else if( state === STATE_OPENED ) {
			anchorB.x += ( openedX - anchorB.x ) * 0.2;
			anchorB.y += ( openedY - anchorB.y ) * 0.2;

			rotation += ( 0 - rotation ) * 0.15;
		}
		else {
			anchorB.x += ( anchorA.x - anchorB.x ) * 0.2;
			anchorB.y += ( anchorA.y - anchorB.y ) * 0.2;

			rotation += ( 45 - rotation ) * 0.2;
		}
	}

	function render() {

		currentY += ( targetY - currentY ) * 0.3;

		curtainElement.style.top = - 100 + Math.min( ( currentY / window.innerHeight ) * 100, 100 ) + '%';
		ribbonElement.style[ prefix( 'transform' ) ] = transform( 0, currentY, 0 );
		
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

