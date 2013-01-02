# Fluidbox
Fluidbox is a simple, lightweight but modern lightbox plugin written in javascript using jQuery and CSS3. Lightbox plugins are quite commonly used on modern websites to show users an image, multiple images or other content using a modal dialog.

Demo page: <http://mdeboer.github.com/jquery-fluidbox/>

Copyright (c) 2012 - 2013 Maarten de Boer - <info@maartendeboer.net>

## Features
* Easy implementation into your website
* Smooth transitions using CSS3 using Animate.css
* Touch screen support using Hammer (optional)
* Basic support for mobile phones and tablets

### Coming soon
* Support for browsers without CSS3 support using fallback mode
* Better support for (older) mobile phones and tablets

*Also, check the issues tracker for more coming features or post your own ideas!*

## Getting started

To get started: include jQuery, Modernizr, Hammer (optional) and Fluidbox in the HEAD of your page like this:
  
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <!-- Necessary -->
        <script language="javascript" src="js/jquery-1.8.3.min.js"></script>
        <script language="javascript" src="js/modernizr.custom.min.js"></script>
        <link rel="stylesheet" href="css/animate.min.css">
        
        <!-- Optional -->
        <script language="javascript" src="js/hammer.min.js"></script>
        
        <!-- Fluidbox -->
        <script language="javascript" src="js/jquery.fluidbox.js"></script>
        <link rel="stylesheet" href="css/jquery.fluidbox.css">
    </head>
    ...

After that, include some images (or links to images) in your document to be used with fluidbox. Give them all a class, for example: 'fluidbox'. Optionally include a `rel` tag to group images into a gallery or leave it out to show a single image.

	<a href="images/image1_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 1"><img src="images/image1_thumbnail" /></a>
	<a href="images/image2_big.jpg" class="fluidbox" rel="sample-gallery" title="Image 2"><img src="images/image2_thumbnail" /></a>
	
Last thing we need to do is initialize Fluidbox!

	$(document).ready(function() {
		$('.fluidbox').fluidbox();
	});
	
## Options
<table>
  <tr>
    <th>Name</th>
    <th>Values</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>animation</td>
    <td>Object</td>
    <td>N/A</td>
    <td>Object containing the animations for every action. Please see source code for more info.</td>
  </tr>
  <tr>
    <td>keys</td>
    <td>Object</td>
    <td>N/A</td>
    <td>Object containing the keycodes for every action (next, prev, close). Please see source code for more info.</td>
  </tr>
  <tr>
    <td>positions</td>
    <td>Object</td>
    <td>N/A</td>
    <td>Object containing positions for certain elements like buttons and title, set to false to disable an element. Please see source code for more info.</td>
  </tr>
  <tr>
    <td>preload</td>
    <td>true, false</td>
    <td>true</td>
    <td>Preload all images in collection</td>
  </tr>
  <tr>
    <td>resize</td>
    <td>true, false</td>
    <td>true</td>
    <td>Trigger resize logic on window resize</td>
  </tr>
  <tr>
    <td>templates</td>
    <td>Object</td>
    <td>N/A</td>
    <td>Object containing the html templates of every part of the lightbox. Please see source code for more info.</td>
  </tr>
  <tr>
    <td>touch</td>
    <td>true, false</td>
    <td>true</td>
    <td>Enable touch support when available (requires Hammer.js)</td>
  </tr>
  <tr>
    <td>touchButtons</td>
    <td>true | false</td>
    <td>true</td>
    <td>Show navigation buttons when touch is activated</td>
  </tr>
</table>
