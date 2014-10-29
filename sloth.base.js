/**
 * @namespace
 */
var sloth = {};


/**
 * @constructor Sloth.Base
 *
 * @param {jQuery object} $element (Parent for all animated elements)
 */
function Sloth($element) {
  if (typeof $element === 'undefined') {
    printError('Cannot initialize Sloth, no element given.');
    return;
  }

  // settings
  Sloth.settings = Sloth.settings || Sloth.defaultSettings;

  // element
  this.$element = $element;
  this.isInline = this.$element[0].tagName.toLowerCase() === 'img';

  // space properties
  this.initialWidth = 0;
  this.initialHeight = 0;
  this.width = 0;

  // initialize and bind
  this.init().bind();
}


/**
 * @export
 */
sloth.Base = Sloth;


/**
 * Init
 * -> Initialize everything
 *
 * @return {Sloth} instance for chainability
 */
Sloth.prototype.init = function () {
  this.parseOptions();
  this.parseSource();

  this.calculateDimensions();
  this.wrap();

  this.preload($.proxy(this.onLoad, this));

  return this;
};



/**
 * [Preloading]
 *
 * Preload
 * -> Make new img element, attach events and add the source
 *
 * @param {function} callback
 */
Sloth.prototype.preload = function (callback) {
  var $img = $(new Image());

  $img.hide().appendTo($(document.body))
      .on('load', function () {
        callback($img);
        $img.remove();
      })
      .on('error', $.proxy(this.onError, this))
      .attr('src', this.source);
};


/**
 * On load
 * -> Preload 'load' callback
 *
 * @context {Sloth} instance
 * @param {jQuery Object} $img (loaded image)
 */
Sloth.prototype.onLoad = function ($img) {};


/**
 * On error
 * -> Preload 'error' callback
 *
 * @context {Sloth} instance
 */
Sloth.prototype.onError = function () {};



/**
 * [Parsers & Getters]
 *
 * Parse source
 * -> Determine version and then the source
 */
Sloth.prototype.parseSource = function () {
  var pixelRatio = window.devicePixelRatio ||
                   window.webkitDevicePixelRatio ||
                   window.mozDevicePixelRatio;

  var modifier,
      neededWidth;

  // determine version
  pixelRatio = (typeof pixelRatio === 'undefined') ? 1 : parseFloat(pixelRatio);

  for (var size in Sloth.settings.versions) {
    if (Sloth.settings.versions.hasOwnProperty(size)) {
      var version = Sloth.settings.versions[size];

      if (this.initialWidth > parseInt(size, 10)) {
        modifier = version;
      } else {
        break;
      }
    }
  }

  // get source
  this.source = this.getSource(modifier);

  // retina
  if (pixelRatio > 1 && !!Sloth.settings.retina) {
    this.source += Sloth.settings.retina;
  }
};


/**
 * Get source
 * -> Run source getter function (from the settings, if defined)
 *    to get the correct source, and use 'data-src-version' and
 *    'data-src' as fallbacks
 *
 * @params {String} modifier (aka. version)
 */
Sloth.prototype.getSource = function (modifier) {
  var el, source, sourceGetterFn;

  // target
  el = this.$element;

  // custom source getter function
  sourceGetterFn = Sloth.settings.sourceGetterFunction;
  if (sourceGetterFn) source = sourceGetterFn.call(this, modifier);

  // default (and fallback)
  if (!source || !source.length) source = el.attr('data-src-' + modifier);
  if (!source || !source.length) source = el.attr('data-src');

  // return
  return source;
};


/**
 * Parse options
 * -> Attribute options with their fallbacks
 */
Sloth.prototype.parseOptions = function () {
  // ratio
  if (!!this.$element.attr('data-ratio')) {
    var ratio = this.$element.attr('data-ratio').split(':'),
        width = parseInt(ratio[0], 10),
        height = (!!ratio[1]) ? parseInt(ratio[1], 10) : 1;

    this.ratio = width / height;
  } else {
    this.ratio = Sloth.settings.ratio;
  }
};



/**
 * [Other]
 *
 * Calculate dimensions
 * -> Determine initial width and height of the element
 *    and the actual width
 */
Sloth.prototype.calculateDimensions = function () {
  this.initialWidth = parseInt(this.$element.css('width'), 10);
  this.initialHeight = this.initialWidth * (1 / this.ratio);
  this.width = (this.$element.get(0).style.width !== '') ? this.$element.get(0).style.width : this.initialWidth;
};


/**
 * Wrap
 * -> Wraps the main element (this.$element) if needed
 */
Sloth.prototype.wrap = function () {
  return this;
};


/**
 * Bind
 * -> Binds events
 */
Sloth.prototype.bind = function () {
  return this;
};


/**
 * Unbind
 * -> Unbinds events
 */
Sloth.prototype.unbind = function () {
  return this;
};



/**
 * [@constructor level]
 *
 * Default settings
 * -> Should not be modified directly (ie. always extend from this obj)
 */
Sloth.defaultSettings = {
  versions: {
    220: 'small',
    640: 'medium',
    1280: 'large'
  },
  retina: '',
  ratio: 16 / 9
};


/**
 * Extend from default settings
 * -> Utility function
 *
 * @return {Object}
 */
Sloth.extendFromDefaultSettings = function (settings) {
  return $.extend({}, Sloth.defaultSettings, settings || {});
};


/**
 * Load
 * -> Loop over each element that matches the jQuery selector,
 *    make an inline sloth if its tagname is IMG
 *    and otherwise make a background sloth
 *
 * @param {String} selector (jQuery selector)
 */
Sloth.load = function (selector) {
  $(selector).each(function () {
    if (this.tagName.toLowerCase() === 'img') {
      new sloth.Inline($(this));
    } else {
      new sloth.Background($(this));
    }
  });
};



/**
 * [Private]
 *
 * Print error
 */
function printError(message) {
  if (window.console && window.console.error) {
    console.error(message);
  }
}
