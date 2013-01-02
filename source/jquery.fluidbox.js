/*!
 * fluidBox - jQuery Plugin
 * version: 1.0
 * @requires jQuery v1.6 or later
 * @requires Modernizr v2.5 or later
 *
 * Copyright (c) 2012 - 2013 Maarten de Boer - info@maartendeboer.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

$(function() {

	var F = $.fluidbox = function() {
		F.open.apply(this, arguments);
	};
	
	$.extend(F, {

		_currentCollection: {},
		_currentIndex: null,
		_currentOptions: {},
		
		_isLoading: false,
		_isOpening: false,
		_isClosing: false,
		_isTouch: false,
		
		/** Quick access variables for layout */
		_overlay: {},
		_outer: {},
		_inner: {},
		_loading: {},
		
		/** Default options */
		defaults: {
			resize: true,
			preload: true,
			touch: true,
			touchButtons: true,
			templates: {
				inner: '<div id="fluidbox-inner"></div>',
				outer: '<div id="fluidbox-outer"></div>',
				overlay: '<div id="fluidbox-overlay"></div>',
				loading: '<div id="fluidbox-loading"></div>',
				title: '<div id="fluidbox-title"></div>',
				buttons: {
					close: '<div id="fluidbox-btn-close"></div>',
					next: '<div id="fluidbox-btn-next"></div>',
					prev: '<div id="fluidbox-btn-prev"></div>'
				}
			},
			positions: {
				buttons: {
					close: 'outer',
					next: 'inner',
					prev: 'inner',
				},
				title: 'inner'
			},
			keys: {
				next: [39, 40],
				prev: [37, 38],
				close: [27]
			},
			animation: {
				open: 'fadeIn',
				close: 'fadeOut',
				next: {
					in: 'fadeInRight',
					out: 'fadeOutLeft'
				},
				prev: {
					in: 'fadeInLeft',
					out: 'fadeOutRight'
				}
			}
		},
		
		/** Injects necessary html templates for the overlay */
		_createOverlay: function() {
			$(F._currentCollection).trigger("fluidboxBeforeCreate");
		
			// Outer (containing inner)
			if($('#fluidbox-outer').length == 0) {
				$('body').append(F._currentOptions.templates.outer);
				$('#fluidbox-outer').append(F._currentOptions.templates.inner);
			}
			
			// Overlay
			if($('#fluidbox-overlay').length == 0) {
				$('body').append(F._currentOptions.templates.overlay);
				$('#fluidbox-overlay').click(function() {
					F.close();
				});
			}
			
			// Loading
			if($('#fluidbox-loading').length == 0) {
				$('body').append(F._currentOptions.templates.loading);
			}
			
			// Title
			if($('#fluidbox-title').length == 0 && F._currentOptions.positions.title !== false) {
				$('#fluidbox-'+ F._currentOptions.positions.title).append(F._currentOptions.templates.title);
			}
			
			// Navigation buttons
			if(!F._isTouch || F._isTouch && F._currentOptions.touchButtons) {
				if(F._currentOptions.positions.buttons.close !== false) {
					$('#fluidbox-'+ F._currentOptions.positions.buttons.close).append(F._currentOptions.templates.buttons.close);
					$('#fluidbox-btn-close').click(function() {
						F.close();
					});				
				}
				if(F._currentOptions.positions.buttons.next !== false) {
					$('#fluidbox-'+ F._currentOptions.positions.buttons.next).append(F._currentOptions.templates.buttons.next);
					$('#fluidbox-btn-next').click(function() {
						F.next();
					});
				}	
				if(F._currentOptions.positions.buttons.prev !== false) {
					$('#fluidbox-'+ F._currentOptions.positions.buttons.prev).append(F._currentOptions.templates.buttons.prev);
					$('#fluidbox-btn-prev').click(function() {
						F.prev();
					});
				}
			}
			
			// Helper vars
			F._overlay = $('#fluidbox-overlay');
			F._outer = $('#fluidbox-outer');
			F._inner = $('#fluidbox-inner');
			F._loading = $('#fluidbox-loading');
			F._title = $('#fluidbox-title');
			
			$(F._currentCollection).trigger("fluidboxAfterCreate");
		},
		
		/** Clean up bound events */
		_unbindEvents: function() {
			// Unbind window events
			$(window).unbind('keydown.fluidbox');
			$(window).unbind('resize.fluidbox');
			
			// Unbind overlay
			F._overlay.unbind('click');
			
			// Unbind navigation buttons
			if(!F._isTouch || F._isTouch && F._currentOptions.touchButtons) {
				$(F._currentOptions.templates.buttons.close).unbind('click');
				$(F._currentOptions.templates.buttons.next).unbind('click');
				$(F._currentOptions.templates.buttons.prev).unbind('click');
			}
		},
		
		/** Bind events */
		_bindEvents: function() {
			$(F._currentCollection).trigger("fluidboxBeforeBind");
		
			// Key events
			$(window).bind('keydown.fluidbox', function(e) {
				if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
					if ($.inArray(e.keyCode, F._currentOptions.keys.close) > -1) {
						F.close();
						e.preventDefault();
					} else if ($.inArray(e.keyCode, F._currentOptions.keys.next) > -1) {
						F.next();
						e.preventDefault();
					} else if ($.inArray(e.keyCode, F._currentOptions.keys.prev) > -1) {
						F.prev();
						e.preventDefault();
					}
				}
			});

			// Smart resize
			if(F._currentOptions.resize) {
				$(window).bind("resize.fluidbox", F.resize);
			}
			
			// Animation events
			if(Modernizr.csstransitions) {
				F._bindAnimationEvents();
			}
			
			// Touch events
			if(F._isTouch) {
				F._bindTouchEvents();
			}
			
			$(F._currentCollection).trigger("fluidboxAfterBind");
		},
		
		/** Bind CSS3 animation events */
		_bindAnimationEvents: function() {
			// Animation completed event
			$(document).bind('oanimationend animationend webkitAnimationEnd MSAnimationEnd', function(e) {			
				$(e.target).removeClass();
				
				// Loading
				if($(e.target).is(F._loading)) {
					if(!F._isLoading) {
						F._loading.hide();
					}
				}
				
				// Overlay
				if($(e.target).is(F._overlay)) {				
					if(F._isClosing) {						
						F._overlay.remove();
						F._outer.remove();
						F._loading.remove();
						
						$('html').css({ overflow: '' });
						
						$(document).unbind('oanimationend animationend webkitAnimationEnd MSAnimationEnd');
					}
				}
				
				// Outer
				if($(e.target).is(F._outer)) {
					if(F._isClosing) {
						F._outer.remove();
					}
				}
				
				// Outer ghost (out-animation ghost)
				if($(e.target).is($('#fluidbox-outer-ghost'))) {
					$('#fluidbox-outer-ghost').remove();
				}				
			});
		},
		
		/** Bind touch events */
		_bindTouchEvents: function() {
			F._outer.hammer({
				drag: false,
				transform: false,
				swipe: true,
				tap: false,
				hold: false
			});
			
			F._outer.on('swipe', function(e) {
				if(e.direction == "left") {
					F.next();
				}
				else if(e.direction == "right") {
					F.prev();
				}
			});
		},
		
		/**
		 * Show or hide loading animation
		 * @param bool loading Set true if loading (show), false for not loading (hide)
		 */
		_showLoading: function(loading) {			
			if(typeof loading == "undefined") {
				var loading = true;
			}
			
			F._isLoading = loading;
			F._loading.removeClass();
			
			if(F._isLoading) {
				F._loading.addClass('animated fadeIn');
				F._loading.show();
			} else {
				F._loading.addClass('animated fadeOut');
			}
		},
		
		/** Preload collection */
		_preloadCollection: function() {
			for(var i = 0; i < F._currentCollection.length; i++) {
				var img = new Image();
				img.src = $(F._currentCollection[i]).attr('href');
			}
		},
		
		/**
		 * Initialize and show Fluidbox overlay
		 * @constructs
		 */
		open: function(collection, options) {
			F._currentCollection = collection;
			
			// Merge options with defaults
			F._currentOptions = $.extend(true, {}, F.defaults, options);			
			F._currentIndex = F._currentOptions.index;
			
			// Set opening / Closing
			F._isOpening = true;
			F._isClosing = false;
			
			// Check touch support and option
			F._isTouch = typeof Hammer == 'function' && Modernizr.touch && F._currentOptions.touch;
			
			// Add overlay
			F._createOverlay();
			
			$(F._currentCollection).trigger("fluidboxBeforeOpen");
			
			// Show overlay
			F._overlay.addClass('animated fadeIn opening');
			F._overlay.show();
			
			// Disable overflow on HTML
			$('html').css({ overflow: 'hidden' });
			
			// Show image
			F.show(F._currentIndex, 'open');
			
			// Bind events
			F._bindEvents();
			
			// Preload
			if(F._currentOptions.preload) {
				F._preloadCollection();
			}
			
			$(F._currentCollection).trigger("fluidboxAfterOpen");
		},
		
		/** Close overlay and unbind events */
		close: function() {
			$(F._currentCollection).trigger("fluidboxBeforeClose");
		
			// Set closing
			F._isClosing = true;
			
			// Animate overlay and loading image
			F._overlay.removeClass().addClass('animated fadeOut closing');
			
			// Animate image or loading image
			if(!F._isLoading) {
				F._outer.removeClass().addClass('animated ' + F._currentOptions.animation.close + ' closing');
			}
			else {
				F._loading.removeClass().addClass('animated fadeOut');
			}
				
			F._unbindEvents();
			
			$(F._currentCollection).trigger("fluidboxAfterClose");
		},
		
		/** 
		 * Show next image in collection (if available) 
		 * @param string animDirection Animation direction (up | down | left | right)
		 */
		next: function() {
			if(F._currentCollection.length <= 1)
				return;
				
			F.show(F._currentIndex == F._currentCollection.length - 1 ? 0 : F._currentIndex + 1, 'next');
		},
		
		/** 
		 * Show previous image in collection (if available) 
		 * @param string animDirection Animation direction (up | down | left | right)
		 */
		prev: function() {
			if(F._currentCollection.length <= 1)
				return;
			
			F.show(F._currentIndex == 0 ? F._currentCollection.length - 1 : F._currentIndex - 1, 'prev');
		},
		
		/** 
		 * Show image by index in collection (if available else show first image) 
		 * @param int index Index of image to show from collection
		 * @param string direction Optional direction parameter (next | prev | open)
		 */
		show: function(index, direction) {			
			if(index == 'undefined' || index < 0 || index > F._currentCollection.length)
				index = 0;
			
			// Determine direction
			if(!direction) {
				if(index > F._currentIndex || index < F._currentIndex) {
					direction = index > F._currentIndex ? 'next' : 'prev';
				}
				else {
					direction = 'open';
				}
			}
			
			console.log(F._inner.html());
			
			// Set current index
			F._currentIndex = index;
			
			// Fade out previous item
			if(direction !== 'open') {
				F._outer.removeClass();
				
				// Animate
				if(direction == 'prev')
					F._outer.addClass('animated ' + F._currentOptions.animation.prev.out);	
				else if(direction == 'next')
					F._outer.addClass('animated ' + F._currentOptions.animation.next.out);
				
				// Fade out ghost overlay (previous image) if previous image is not still loading
				if(!F._isLoading) {
				
					// Clone existing overlay
					var oldOverlay = $(F._outer).clone(true);
					
					// Set unique ID
					$(oldOverlay).attr('id', 'fluidbox-outer-ghost');
					
					// Animate
					$(oldOverlay).removeClass();
					if(direction == 'prev')
						$(oldOverlay).addClass('animated ' + F._currentOptions.animation.prev.out);
					else if(direction == 'next')
						$(oldOverlay).addClass('animated ' + F._currentOptions.animation.next.out);
						
					$(oldOverlay).show();
					$('body').append(oldOverlay);
				}
			}
			
			// Reset title
			F._title.replaceWith(F._currentOptions.templates.title);
			F._title = $('#fluidbox-title');
			
			// Reset inner body
			F._inner.children('img').first().remove();
			
			// Preload image and show when loaded
			var currentElement = F._currentCollection[index];
			var currentImage = new Image();			
			currentImage.onload = function() {
				$(F._currentCollection).trigger("fluidboxBeforeShow", index, direction, this);
				
				// Replace image and animate
				F._inner.append('<img src="'+$(currentElement).attr('href')+'" width="'+this.width+'" height="'+this.height+'" />');
				
				// Set title
				F._title.append($(currentElement).attr('title'));
				
				// Animate
				F._outer.removeClass();				
				if(direction == 'open')
					F._outer.addClass('animated ' + F._currentOptions.animation.open + ' opening');
				else if(direction == 'prev')
					F._outer.addClass('animated ' + F._currentOptions.animation.prev.in);
				else if(direction == 'next')
					F._outer.addClass('animated ' + F._currentOptions.animation.next.in);
				
				// Hide loading
				F._showLoading(false);
				
				// Show new image
				F._outer.show();
				
				// Resize image
				if(F._currentOptions.resize) 
					F.resize();
					
				$(F._currentCollection).trigger("fluidboxAfterShow", index, direction, this);
			}
			currentImage.src = $(currentElement).attr('href');
			
			// Show loading indicator
			F._showLoading();
		},
		
		/** Resize the overlay */
		resize: function() {
			var origWidth = $(F._inner).children('img').attr('width');
			var origHeight = $(F._inner).children('img').attr('height');
			
			var winWidth = $(window).width();
			var winHeight = $(window).height() - (F._outer.height() - F._inner.height());
			
			if(origWidth > winWidth || origHeight > winHeight) {
				var iRatio = Math.min(winWidth / origWidth, winHeight / origHeight);
				F._outer.css({
					'width': F._outer.width(origWidth * iRatio),
					'margin-left': '-' + (origWidth * iRatio) / 2 + 'px',
					'margin-top': '-' + F._outer.height() / 2 + 'px'
				});
			} else {
				F._outer.css({
					'width': origWidth,
					'margin-left': '-' + origWidth / 2 + 'px',
					'margin-top': '-' + origHeight / 2 + 'px'
				});
			}
		}
	});
	
	$.fn.fluidbox = function(options) {
		var that = $(this);
		var options = options || {};
		
		this.click(function(e) {
			e.preventDefault();
			
			var collection;
			
			// Filter current collection on "rel" attribute
			if($(this).attr('rel')) {
				collection = that.filter('[rel='+ $(this).attr('rel') +']');
			}
			
			// Set opening index
			options.index = collection.index(this);
			
			$.fluidbox(collection, options);
		});
	};
	
});