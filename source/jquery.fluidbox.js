/*!
 * fluidBox - jQuery Plugin
 * version: 1.0
 * @requires jQuery v1.6 or later
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
		_currentIndex: 0,
		_currentOptions: {},
		_overlay: {},
		_outer: {},
		_inner: {},
		_loading: {},
		
		_isLoading: false,
		
		defaults: {
			tpl: {
				image: '<div id="fluidbox-outer"><div id="fluidbox-inner"></div></div>',
				overlay: '<div id="fluidbox-overlay"></div>',
				loading: '<div id="fluidbox-loading"></div>'
			},
			keys: {
				next: [13, 32, 34, 39, 40],
				prev: [8, 33, 37, 38],
				close: [27]
			}
		},
		
		_createOverlay: function() {
			if($('#fluidbox-outer').length == 0) {
				$('body').append(F._currentOptions.tpl.image);
			}
			
			if($('#fluidbox-overlay').length == 0) {
				$('body').append(F._currentOptions.tpl.overlay);
			}
			
			if($('#fluidbox-loading').length == 0) {
				$('body').append(F._currentOptions.tpl.loading);
			}
			
			// Helper vars
			F._overlay = $('#fluidbox-overlay');
			F._outer = $('#fluidbox-outer');
			F._inner = $('#fluidbox-inner');
			F._loading = $('#fluidbox-loading');
		},
		
		_unbindEvents: function() {
			$(window).unbind('keydown.fluidbox');
			$(window).unbind('throttledresize.fluidbox');
			
			F._overlay.unbind('click');
		},
		
		_bindEvents: function() {
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
			
			F._overlay.bind('click', function(e) {
				F.close();
			});
			
			$(window).bind("throttledresize.fluidbox", F.resize);
		},
		
		_showLoading: function() {		
			F._loading.removeClass();
			F._loading.addClass('animated fadeIn');
			F._loading.show();
			
			F._isLoading = true;
		},
		
		_hideLoading: function() {		
			F._isLoading = false;
			F._loading.removeClass();
			F._loading.addClass('animated fadeOut');
		},

		open: function(collection, options) {
			F._currentCollection = collection;
			
			// Merge options with defaults
			F._currentOptions = $.extend(true, {}, F.defaults, options);
			F._currentIndex = F._currentOptions.index;
			
			// Add overlay
			F._createOverlay();
			
			// Show overlay
			F._overlay.addClass('animated fadeIn');
			F._overlay.show();
			
			// Disable overflow
			$('html').css({ overflow: 'hidden' });
			
			F.jumpTo(F._currentIndex, 'open');
			
			F._bindEvents();
		},
		
		close: function() {
			F._overlay.removeClass().addClass('animated fadeOut');			
			F._loading.removeClass().addClass('animated fadeOut');
			
			if(!F._isLoading)
				F._outer.removeClass().addClass('animated fadeOutUp');
			
			F._overlay.bind('oanimationend animationend webkitAnimationEnd MSAnimationEnd', function() {
				F._overlay.remove();
				F._outer.remove();
				F._loading.remove();
				
				$('html').css({ overflow: '' });
			});
			
			F._unbindEvents();
		},
		
		next: function(animDirection) {
			if(F._currentCollection.length <= 1)
				return;
		
			F.jumpTo(F._currentIndex == F._currentCollection.length - 1 ? 0 : F._currentIndex + 1, 'next');
		},
		
		prev: function(animDirection) {
			if(F._currentCollection.length <= 1)
				return;
				
			F.jumpTo(F._currentIndex == 0 ? F._currentCollection.length - 1 : F._currentIndex - 1, 'prev');
		},
		
		jumpTo: function(index, direction) {
			
			if(index < 0 || index > F._currentCollection.length)
				index = 0;
				
			F._currentIndex = index;
			
			// Fade out previous item
			if(direction !== "open") {
				
				F._outer.removeClass();
				if(direction == "prev")
					F._outer.addClass('animated fadeOut');
					
				if(direction == "next")
					F._outer.addClass('animated fadeOut');
				
				if(!F._isLoading) {
					var oldOverlay = $(F._outer).clone();
					
					$(oldOverlay).removeClass();
					
					if(direction == "prev")
						$(oldOverlay).addClass('animated fadeOut');
					if(direction == "next")
						$(oldOverlay).addClass('animated fadeOut');
						
					$(oldOverlay).show();
					$('body').append(oldOverlay);
					
					$(oldOverlay).bind('oanimationend animationend webkitAnimationEnd MSAnimationEnd', function() {
						oldOverlay.remove();
					});
				}
			}
			
			// Preload image and show when loaded
			var currentElement = F._currentCollection[index];
			var currentImage = new Image();
			currentImage.onload = function() {				
				
				// Replace image and animate
				F._inner.html('<img src="'+$(currentElement).attr('href')+'" title="'+$(currentElement).attr('title')+'" />');
				F._inner.css({
					'width': this.width,
					'height': this.height,
				});
				
				F._outer.removeClass();
				if(direction == "open")
					F._outer.addClass('animated fadeInUp');
				
				if(direction == "prev")
					F._outer.addClass('animated fadeIn');
					
				if(direction == "next")
					F._outer.addClass('animated fadeIn');
				
				// Hide loading
				F._hideLoading();
				
				// Show new image
				F._outer.show();
				
				// Resize image
				F.resize();
			}
			currentImage.src = $(currentElement).attr('href');
			
			F._showLoading();
		},
		
		resize: function() {			
			F._outer.css({
				'margin-left': '-' + F._inner.width() / 2 + 'px',
				'margin-top': '-' + F._inner.height() / 2 + 'px'
			});
		}
	});
	
	$.fn.fluidbox = function(options) {
		var that = $(this);
		
		this.click(function(e) {
			e.preventDefault();
			
			var collection;
			var options = options || {};
			
			// Filter current collection on "rel" attribute
			if($(this).attr('rel')) {
				collection = that.filter('[rel='+ $(this).attr('rel') +']');
			}
			
			// Override options
			options.index = collection.index(this);
			
			$.fluidbox(collection, options);
		});
	};
	
});