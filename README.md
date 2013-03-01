# Fluidbox
Fluidbox is a simple, lightweight but modern lightbox plugin written in javascript using jQuery and CSS3. Lightbox plugins are quite commonly used on modern websites to show users an image, multiple images or other content using a modal dialog.

Documentation/demo page: <http://mdeboer.github.com/jquery-fluidbox/>

Images on demo page courtesy of Maarten de Boer <info@maartendeboer.net>

Copyright (c) 2012 - 2013 Maarten de Boer - <info@maartendeboer.net>

## Features
* Easy implementation into your website
* Smooth transitions with CSS3 using Animate.css
* Touch screen support with multi-touch gestures using Hammer (optional)
* Support for mobile phones and tablets
* Works in browsers without CSS3 animation support!
* Lot's of customization support

*Also, check the issues tracker for more coming features or post your own ideas!*

## Getting started

To get started: include jQuery, Modernizr, Hammer (optional) and Fluidbox in the HEAD of your page like this:
  
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <!-- Necessary -->
        <script language="javascript" src="js/jquery-1.8.3.min.js"></script>
        <link rel="stylesheet" href="css/animate.min.css">
        
        <!-- Optional -->
		<script language="javascript" src="js/modernizr.custom.min.js"></script>
        <script language="javascript" src="js/hammer.min.js"></script>
        
        <!-- Fluidbox -->
        <script language="javascript" src="js/jquery.fluidbox.js"></script>
        <link rel="stylesheet" href="css/jquery.fluidbox.css">
    </head>
    ...

After that, include some images (or links to images) in your document to be used with fluidbox. Give them all a class attribute, for example: 'fluidbox'. Optionally include a rel attribute to group images into a gallery or leave it out to show a single image.

	<a href="images/image1_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 1"><img src="images/image1_thumbnail" /></a>
	<a href="images/image2_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 2"><img src="images/image2_thumbnail" /></a>
	
or:

	<a href="images/image1_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 1">Link to image 1</a>
	<a href="images/image2_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 2">Link to image 2</a>

Last thing we need to do is initialize Fluidbox!

	$(document).ready(function() {
		$('.fluidbox').fluidbox();
	});
	
For more information and examples please see the documentation/demo page in the demo folder or check out the online version: <http://mdeboer.github.com/jquery-fluidbox/>

Enjoy!
	