/*!
 * fluidBox - jQuery Plugin
 * version: 1.0
 * @requires jQuery v1.8 or later
 *
 * Copyright (c) 2012 - 2013 Maarten de Boer - info@maartendeboer.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {
	"use strict";

	$(function() {
		var F = $.fluidbox = {
		
			/** Working set */
			_currentCollection: {},
			_currentIndex: null,
			_currentOptions: {},
			_instance: {},
			
			/** States */
			_isLoading: false,
			_isOpening: false,
			_isClosing: false,
			_isAnimated: false,
			_isDraggable: false,
			
			/** Support libs */
			_hasModernizr: false,
			_hasHammer: false,
			
			/** Quick access variables for layout */
			_overlay: {},
			_viewport: {},
			_outer: {},
			_inner: {},
			_loading: {},
			_title: {},
			
			/** Animation classes */
			_animClasses: "animated flash bounce shake tada swing wobble wiggle pulse flip flipInX flipOutX flipInY flipOutY fadeIn fadeInUp fadeInDown fadeInLeft fadeInRight fadeInUpBig fadeInDownBig fadeInLeftBig fadeInRightBig fadeOut fadeOutUp fadeOutDown fadeOutLeft fadeOutRight fadeOutUpBig fadeOutDownBig fadeOutLeftBig fadeOutRightBig bounceIn bounceInDown bounceInUp bounceInLeft bounceInRight bounceOut bounceOutDown bounceOutUp bounceOutLeft bounceOutRight rotateIn rotateInDownLeft rotateInDownRight rotateInUpLeft rotateInUpRight rotateOut rotateOutDownLeft rotateOutDownRight rotateOutUpLeft rotateOutUpRight lightSpeedIn lightSpeedOut hinge rollIn rollOut",
			
			/** Animation end events */
			_transEndEventNames: 'webkitAnimationEnd animationend oanimationend MSAnimationEnd',
			
			/** Default options */
			defaults: {
				resize: true,
				preload: true,
				touch: true,
				animated: true,
				padding: 50,
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
						prev: 'inner'
					},
					title: 'inner'
				},
				keys: {
					next: [39, 40],
					prev: [37, 38],
					close: [27]
				},
				animations: {
					open: 'fadeIn',
					close: 'fadeOut',
					next: {
						'in': 'fadeInRight',
						'out': 'fadeOutLeft'
					},
					prev: {
						'in': 'fadeInLeft',
						'out': 'fadeOutRight'
					}
				}
			},
			
			/** Injects necessary html templates for the overlay */
			_createOverlay: function() {
				$(F._instance).triggerHandler("fluidboxBeforeCreate");
			
				// Outer (containing inner)
				if($('#fluidbox-outer').length === 0) {				
					$('body').append(F._currentOptions.templates.outer);
					$('#fluidbox-outer').html(F._currentOptions.templates.inner);
				}
				
				// Overlay
				if($('#fluidbox-overlay').length === 0) {
					$('body').append(F._currentOptions.templates.overlay);
				}
				
				// Loading
				if($('#fluidbox-loading').length === 0) {
					$('body').append(F._currentOptions.templates.loading);
				}
				
				// Title
				if($('#fluidbox-title').length === 0 && F._currentOptions.positions.title !== false) {
					$('#fluidbox-'+ F._currentOptions.positions.title).append(F._currentOptions.templates.title);
				}
				
				// Navigation buttons
				if(F._currentOptions.positions.buttons.close !== false && $('#fluidbox-btn-close').length === 0) {
					$('#fluidbox-'+ F._currentOptions.positions.buttons.close).append(F._currentOptions.templates.buttons.close);
				}
				
				if(F._currentCollection.length > 1) {
					if(F._currentOptions.positions.buttons.next !== false && $('#fluidbox-btn-next').length === 0) {
						$('#fluidbox-'+ F._currentOptions.positions.buttons.next).append(F._currentOptions.templates.buttons.next);
					}	
					if(F._currentOptions.positions.buttons.prev !== false && $('#fluidbox-btn-prev').length === 0) {
						$('#fluidbox-'+ F._currentOptions.positions.buttons.prev).append(F._currentOptions.templates.buttons.prev);
					}
				}
				
				// Helper vars
				F._overlay = $('#fluidbox-overlay');
				F._outer = $('#fluidbox-outer');
				F._inner = $('#fluidbox-inner');
				F._loading = $('#fluidbox-loading');
				F._title = $('#fluidbox-title');
				
				// Set helper CSS classes
				if(F._isTouch) {
					F._outer.addClass('touch');
				}
				
				$(F._instance).triggerHandler("fluidboxAfterCreate");
			},
			
			/** Clean up bound events */
			_unbindEvents: function() {
				// Unbind window events
				$(document).unbind('keydown.fluidbox');
				$(window).unbind('resize.fluidbox');
				
				// Unbind overlay
				F._overlay.unbind('click');
				
				// Unbind navigation buttons
				$('#fluidbox-btn-close').unbind('click');
				$('#fluidbox-btn-next').unbind('click');
				$('#fluidbox-btn-prev').unbind('click');
			},
			
			/** Bind events */
			_bindEvents: function() {
				$(F._instance).triggerHandler("fluidboxBeforeBind");
			
				// Key events
				$(document).bind('keydown.fluidbox', function(e) {			
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
						if ($.inArray(e.which, F._currentOptions.keys.close) > -1) {
							F.close();
							e.preventDefault();
						} else if (F._currentCollection.length > 1 && $.inArray(e.which, F._currentOptions.keys.next) > -1) {
							F.next();
							e.preventDefault();
						} else if (F._currentCollection.length > 1 && $.inArray(e.which, F._currentOptions.keys.prev) > -1) {
							F.prev();
							e.preventDefault();
						}
					}
				});
				
				// Overlay
				F._overlay.click(function() { F.close(); });
				
				// Buttons
				$('#fluidbox-btn-close').click(function() { F.close(); });
				$('#fluidbox-btn-next').click(function() { F.next(); });
				$('#fluidbox-btn-prev').click(function() { F.prev(); });
				
				// Scale to full-size and enable dragging
				if(!F._isTouch) {
					F._outer.dblclick(function() {				
						if(F._isDraggable === true) {
							F._isDraggable = false;
						} else {
							F._isDraggable = true;
						}
						
						F.resize();
					});
				}

				// Smart resize
				if(F._currentOptions.resize) {
					$(window).bind("resize.fluidbox", F.resize);
				}
				
				// Animation events
				if(F._isAnimated !== false) {
					F._bindAnimationEvents();
				}
				
				// Touch events
				if(F._isTouch) {
					F._bindTouchEvents();
				}
				
				$(F._instance).triggerHandler("fluidboxAfterBind");
			},
			
			/** Bind CSS3 animation events */
			_bindAnimationEvents: function() {
				if(F._isAnimated === false) {
					return;
				}
			
				// Animation completed event
				$(document).bind(F._transEndEventNames, function(e) {
					$(e.target).removeClass(F._animClasses).removeClass('opening closing');
					
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
							F._inner.remove();
							F._outer.remove();
							F._loading.remove();
							
							$('body').css({ overflow: '' });
							
							$(document).unbind(F._transEndEventNames);
						}
					}
					
					// Outer
					if($(e.target).is(F._outer)) {
						if(F._isClosing) {
							F._outer.remove();
						}
					}

					// Outer ghost (out-animation ghost)
					if($(e.target).hasClass('fluidbox-outer-ghost')) {
						$(e.target).remove();
					}				
				});
			},
			
			/** Bind touch events */
			_bindTouchEvents: function() {		
				F._outer.hammer({
					drag: true,
					transform: true,
					swipe: true,
					tap: true,
					hold: false
				});
				
				// Drag
				F._outer.bind('dragstart', function(e) {
					e.preventDefault();
					F._outer.data('currentX', parseInt(F._outer.css('left'), 10));
					F._outer.data('currentY', parseInt(F._outer.css('top'), 10));
				});
				
				F._outer.bind('drag', function(e) {				
					if(F._isDraggable) {
						e.preventDefault();
						
						F._outer.css({
							'left': Math.round(F._outer.data('currentX') + e.gesture.deltaX),
							'top':  Math.round(F._outer.data('currentY') + e.gesture.deltaY)
						});
					}
				});
				
				F._outer.bind('dragend', function(e) {
					e.preventDefault();
					F._outer.removeData('currentX');
					F._outer.removeData('currentY');
				});
				
				// Double tap (return to normal size)
				F._outer.bind('doubletap', function(e) {
					F._isDraggable = !F._isDraggable;
					F.resize();
				});
				
				// Transform (pinch zoom)
				F._outer.bind('transformstart', function(e) {
					F._outer.data('currentX', parseInt(F._outer.css('left'), 10));
					F._outer.data('currentY', parseInt(F._outer.css('top'), 10));
					F._outer.data('currentWidth', F._outer.width());
					F._outer.data('currentHeight', F._outer.height());				
					F._isDraggable = true;
				});
				
				F._outer.bind('transform', function(e) {		
					var newWidth = Math.round(F._outer.data('currentWidth') * e.gesture.scale),
						newHeight = Math.round(F._outer.data('currentHeight') * e.gesture.scale);
					
					F._outer.css({
						'width': newWidth,
						'left': Math.round(F._outer.data('currentX') + ((F._outer.data('currentWidth') - newWidth) / 2) + e.gesture.deltaX),
						'top': Math.round(F._outer.data('currentY') + ((F._outer.data('currentHeight') - newHeight) / 2) + e.gesture.deltaY)
					});
				});
				
				F._outer.bind('transformend', function(e) {
					F._outer.removeData('currentWidth');
					F._outer.removeData('currentX');
					F._outer.removeData('currentY');
				});
				
				// Swipe
				F._outer.bind('swipe', function(e) {				
					if(!F._isDraggable) {
						if(e.gesture.direction === "left") {
							F.next();
						}
						else if(e.gesture.direction === "right") {
							F.prev();
						}
					}
				});
			},
			
			/**
			 * Show or hide loading animation
			 * @param bool loading Set true if loading (show), false for not loading (hide)
			 */
			_showLoading: function(loading) {
				F._isLoading = loading;
				F._loading.removeClass(F._animClasses);
				
				if(F._isLoading) {
					if(F._isAnimated !== false) {
						F._loading.removeClass(F._animClasses).addClass('animated fadeIn');
						F._loading.show();
					} else {
						F._loading.show();
					}
				} else {
					if(F._isAnimated !== false) {
						F._loading.removeClass(F._animClasses).addClass('animated fadeOut');
					} else {
						F._loading.hide();
					}				
				}
			},
			
			/** Preload collection */
			_preloadCollection: function() {
				var i = 0, img;
				for(i = 0; i < F._currentCollection.length; i = i + 1) {
					img = new Image();
					img.src = $(F._currentCollection[i]).attr('href');
				}
			},
			
			/**
			 * Initialize and show Fluidbox overlay
			 * @constructs
			 */
			open: function(collection, options, instance) {
				F._currentCollection = collection;
				F._instance = instance;
				
				// Merge options with defaults
				F._currentOptions = $.extend(true, {}, F.defaults, options);			
				F._currentIndex = F._currentOptions.index;
				
				// Set opening / Closing
				F._isOpening = true;
				F._isClosing = false;
				
				// Check support libs
				F._hasHammer = typeof Hammer === 'function';
				F._hasModernizr = typeof Modernizr === 'function';
				
				// Check touch support and option
				F._isTouch = F._currentOptions.touch;
				if(F._isTouch && (!F._hasHammer || (F._hasModernizr && !Modernizr.touch))) {
					F._isTouch = false;
					console.log('Touch support not detected or not available (missing hammer.js?), touch disabled.');
				}
				
				// Check animation support
				F._isAnimated = F._currentOptions.animated;
				if(F._isAnimated && F._hasModernizr && !Modernizr.csstransitions) {
					F._isAnimated = false;
					console.log('CSS3 transition support not detected or not available, animations disabled.');
				}
				
				var fluidboxBeforeOpenEvent = $.Event('fluidboxBeforeOpen');
				$(F._instance).triggerHandler(fluidboxBeforeOpenEvent);
				
				if(fluidboxBeforeOpenEvent.isDefaultPrevented()) {
					return;
				}
				
				// Add overlay
				F._createOverlay();
				
				// Show overlay
				if(F._isAnimated !== false) {
					F._overlay.removeClass(F._animClasses).addClass('animated fadeIn opening');
					F._overlay.show();
				} else {
					F._overlay.show();
				}
				
				// Save current scroll position (firefox 'unwanted feature')
				var scrollX = document.body.scrollLeft + document.documentElement.scrollLeft,
					scrollY = document.body.scrollTop + document.documentElement.scrollTop;
					
				// Disable overflow on HTML
				$('body').css({ overflow: 'hidden' });
				
				// Restore scroll position
				window.scrollTo(scrollX, scrollY);	
				
				// Show image
				F.show(F._currentIndex, 'open');
				
				// Bind events
				F._bindEvents();
				
				// Preload
				if(F._currentOptions.preload) {
					F._preloadCollection();
				}
				
				$(F._instance).triggerHandler("fluidboxAfterOpen");
			},
			
			/** Close overlay and unbind events */
			close: function() {
				$(F._instance).triggerHandler("fluidboxBeforeClose");
			
				// Set closing
				F._isClosing = true;
				
				// Unset draggable
				F._isDraggable = false;
				
				// Animate overlay and loading image
				if(F._isAnimated !== false) {
					F._overlay.removeClass(F._animClasses).addClass('animated fadeOut closing');
				} else {
					F._overlay.hide();
				}
				
				// Animate image or loading image
				if(F._isLoading === false) {
					if(F._isAnimated !== false) {
						F._outer.removeClass(F._animClasses).addClass('animated ' + $(F._outer).data('animation').close + ' closing');
					} else {
						F._outer.hide();
					}
				}
				else {
					F._showLoading(false);
					F._outer.hide();
				}
					
				F._unbindEvents();
				
				$(F._instance).triggerHandler("fluidboxAfterClose");
			},
			
			/** 
			 * Show next image in collection (if available) 
			 */
			next: function() {
				if(F._currentCollection.length <= 1 || F._isDraggable || F._isLoading) {
					return;
				}
					
				F.show(F._currentIndex === F._currentCollection.length - 1 ? 0 : F._currentIndex + 1, 'next');
			},
			
			/** 
			 * Show previous image in collection (if available) 
			 */
			prev: function() {
				if(F._currentCollection.length <= 1 || F._isDraggable || F._isLoading) {
					return;
				}
				
				F.show(F._currentIndex === 0 ? F._currentCollection.length - 1 : F._currentIndex - 1, 'prev');
			},
			
			/** 
			 * Show image by index in collection (if available else show first image) 
			 * @param int index Index of image to show from collection
			 * @param string direction Optional direction parameter (next | prev | open)
			 */
			show: function(index, direction) {
                if(F._isLoading) {
                    return;
                }
                
				if(index === 'undefined' || index < 0 || index > F._currentCollection.length) {
					index = 0;
				}
				
				// Determine direction
				if(!direction) {
					if(index > F._currentIndex || index < F._currentIndex) {
						direction = index > F._currentIndex ? 'next' : 'prev';
					}
					else {
						direction = 'open';
					}
				}
				
				// Set current index
				F._currentIndex = index;
				
				// Set variables
				var currentElement = F._currentCollection[index],
					currentImage = new Image(),
					oldOuter = $(F._outer).clone(true);
				
				// Fade out previous item
				if(direction !== 'open' && !F._isLoading) {
					$(F._instance).triggerHandler("fluidboxBeforeHide");
					
					$(F._outer).removeClass(F._animClasses);
					$(F._outer).hide();
					
					$(oldOuter).removeAttr('id');
					$(oldOuter).addClass('fluidbox-outer-ghost');
					$(oldOuter).removeClass(F._animClasses);
					
					$('body').append(oldOuter);
					
					// Animate
					if(F._isAnimated !== false) {
						if(direction === 'prev') {
							$(oldOuter).addClass('animated ' + $(oldOuter).data('animation').prev.out);
						}
						else if(direction === 'next') {
							$(oldOuter).addClass('animated ' + $(oldOuter).data('animation').next.out);
						}
						
						$(oldOuter).show();
					} else {
						$(oldOuter).remove();
					}
					
					$(F._instance).triggerHandler("fluidboxAfterHide");
				}
				
				// Reset title
				F._title.replaceWith(F._currentOptions.templates.title);
				F._title = $('#fluidbox-title');
				
				// Reset inner body
				F._inner.children('img').first().remove();
				
				// Preload image and show when loaded
				currentImage.onload = function() {
					
					// Set current image data
					var eventData = { index: index, target: currentElement, direction: direction, image: this, title: $(currentElement).attr('title'), animation: $.extend(true, {}, F._currentOptions.animations, $(currentElement).data('animation')) };
					
					// Trigger callback
					$(F._instance).triggerHandler("fluidboxBeforeShow", eventData);
					
					// Set animation options for current item
					$(F._outer).data('animation', $.extend(true, {}, F.defaults.animations, eventData.animation));
					
					// Replace image and animate
					F._inner.append('<img src="'+$(currentElement).attr('href')+'" width="'+this.width+'" height="'+this.height+'" />');
					
					// Set title
					F._title.append(eventData.title);
					
					// Animate			
					if(F._isAnimated !== false) {
						if(direction === 'open') {
							F._outer.removeClass(F._animClasses).addClass('animated ' + $(F._outer).data('animation').open + ' opening');
						}
						else if(direction === 'prev') {
							F._outer.removeClass(F._animClasses).addClass('animated ' + $(F._outer).data('animation').prev['in']);
						}
						else if(direction === 'next') {
							F._outer.removeClass(F._animClasses).addClass('animated ' + $(F._outer).data('animation').next['in']);
						}
						
						F._outer.show();
					} else {
						F._outer.show();
					}
					
					// Hide loading
					F._showLoading(false);
					
					// Resize image
					if(F._currentOptions.resize) {
						F.resize();
					}
						
					$(F._instance).triggerHandler("fluidboxAfterShow", eventData);
				};
				
				currentImage.src = $(currentElement).attr('href');
				
				// Show loading indicator
				F._showLoading(true);
			},
			
			/** Resize the overlay */
			resize: function() {
				var origWidth = 0, origHeight = 0,
					winWidth = 0, winHeight = 0,
					vpWidth = 0, vpHeight = 0,
					newWidth = 0, newHeight = 0,
					iRatio = 0;
			
				origWidth = $(F._inner).children('img').attr('width');
				origHeight = $(F._inner).children('img').attr('height');
				
				winWidth = $(window).width();
				winHeight = $(window).height();
				
				vpWidth = winWidth - F._currentOptions.padding;
				vpHeight = winHeight - F._currentOptions.padding;
				
				if((origWidth > vpWidth || origHeight > vpHeight) && !F._isDraggable) {
					iRatio = Math.min(vpWidth / origWidth, vpHeight / origHeight);
					newWidth = Math.round((origWidth * iRatio));
					newHeight = Math.round((origHeight * iRatio));
					F._outer.css({
						'width': newWidth,
						'left': Math.round((F._currentOptions.padding / 2) + ((vpWidth - newWidth) / 2)),
						'top': Math.round((F._currentOptions.padding / 2) + ((vpHeight - newHeight) / 2))
					});
				} else {
					F._outer.css({
						'width': origWidth,
						'left': Math.round((winWidth - origWidth) / 2),
						'top': Math.round((winHeight - origHeight) / 2)
					});
				}
			}
		};
		
		$.fn.fluidbox = function(options) {
			var that = $(this);	
			options = options || {};
			
			this.click(function(e) {
				e.preventDefault();
				
				var collection = [ this ];
				
				// Filter current collection on "rel" attribute
				if($(this).attr('rel')) {
					collection = that.filter('[rel="'+ $(this).attr('rel') +'"]');
					// Set opening index
					options.index = collection.index(this);
				} else {
					options.index = 0;
				}
				
				$.fluidbox.open(collection, options, $(that));
			});
			
			return $(this);
		};
		
	});
})(jQuery);
