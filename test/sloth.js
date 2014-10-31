(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Sloth = factory();
  }
}(this, function() {
"use strict";

/**
 * @namespace
 */
var sloth = {};


/**
 * @constructor Sloth.Base
 *
 * @param {jQuery object} $element (Parent for all animated elements)
 */
function Sloth($element, settings) {
  if (typeof $element === 'undefined') {
    printError('Cannot initialize Sloth, no element given.');
    return;
  }

  // settings
  this.settings = $.extend({}, Sloth.defaultSettings, settings || {});

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
  this.calculateDimensions();
  this.parseSource();

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

  for (var size in this.settings.versions) {
    if (this.settings.versions.hasOwnProperty(size)) {
      var version = this.settings.versions[size];

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
  if (pixelRatio > 1 && !!this.settings.retina) {
    this.source += this.settings.retina;
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
  sourceGetterFn = this.settings.sourceGetterFunction;
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
    this.ratio = this.settings.ratio;
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
  ratio: 16 / 9,
  sourceGetterFunction: defaultSourceGetterFunction
};


/**
 * Load
 * -> Loop over each element that matches the jQuery selector,
 *    make an inline sloth if its tagname is IMG
 *    and otherwise make a background sloth
 *
 * @param {String} selector (jQuery selector)
 * @param {Object} settings
 */
Sloth.load = function (selector, settings) {
  $(selector).each(function () {
    if (this.tagName.toLowerCase() === 'img') {
      new sloth.Inline($(this), settings);

    } else {
      new sloth.Background($(this), settings);

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


/**
 * Default source get function
 *
 * Based on Mr. Henry asset URL's:
 * - //c.assets.sh/rgABo46c_YGa5cwq-w
 * - //c.assets.sh/rgABo46c_YGa5cwq-w/original
 *
 * @param  {String} modifier
 *
 * @return {String}
 */
function defaultSourceGetterFunction(modifier) {
  var src = this.$element.attr("data-src").split("/");

  // Replace current modifier
  if ( src.length == 5 ) {
    src[4] = modifier;

  // Append modifier
  } else {
    src.push(modifier);

  }

  return src.join("/");
}

/**
 * @constructor Sloth.Background
 */
function BackgroundSloth($element, settings) {
  this.constructor.call(this, $element, settings);
}


/**
 * Inherit from Base
 */
BackgroundSloth.prototype = $.extend({}, sloth.Base.prototype);
BackgroundSloth.prototype.constructor = sloth.Base;


/**
 * @export
 */
sloth.Background = BackgroundSloth;



/**
 * [Preloading]
 *
 * On load (inherits from sloth.base)
 */
BackgroundSloth.prototype.onLoad = function ($img) {
  var $element = this.$element;

  $element.find('.sloth__background').css('background-image', 'url(' + $img.attr('src') + ')').fadeIn(880, function () {
    $element.removeClass('is-loading');
  });
};


/**
 * On error (inherits from sloth.base)
 */
BackgroundSloth.prototype.onError = function () {
  this.$element.removeClass('is-loading')
               .addClass('is-errored');

  try {
    console.error('Could not load', this.source);
  } catch(err) {}
};




/**
 * [Other]
 *
 * Wrap (inherits from sloth.base)
 */
BackgroundSloth.prototype.wrap = function () {
  var $background = $('<div class="sloth__background" />'),
      backgroundProperties = {
        'background': this.$element.css('background'),
        'background-style': this.$element.css('background-style')
      };

  this.$element.addClass('sloth is-loading');

  // Make sure position:absolute on children is relative to the current element
  if (this.$element.css('position') === 'static' || this.$element.css('position') === 'relative') {
    this.$element.css('position', 'relative');
  }

  if (this.$element.html().length > 0) {
    // Wrap content
    this.$element.wrapInner(
      $('<div class="sloth__content" />').css({
        'position': 'relative',
        'z-index': 2
      })
    );
  }

  // Stretch background, inherit background properties from element
  if (backgroundProperties.background === '') {
    // Empty strings means either we're not in Chrome (inherits shorthand) or no background properties were set
    // Just to make sure we should loop some background properties
    delete backgroundProperties.background;
    var properties = ['background-size', 'background-repeat', 'background-position', 'background-origin', 'background-clip', 'background-color'];

    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      backgroundProperties[property] = this.$element.css(property);
    }
  }

  $background.css({
    'position': 'absolute',
    'top': 0,
    'left': 0,
    'right': 0,
    'bottom': 0,
    'z-index': 1,
  }).css(backgroundProperties).hide().appendTo(this.$element);
};

/**
 * @constructor Sloth.Inline
 */
function InlineSloth($element, settings) {
  this.constructor.call(this, $element, settings);
}


/**
 * Inherit from Base
 */
InlineSloth.prototype = $.extend({}, sloth.Base.prototype);
InlineSloth.prototype.constructor = sloth.Base;


/**
 * @export
 */
sloth.Inline = InlineSloth;



/**
 * [Preloading]
 *
 * On load (inherits from sloth.base)
 */
InlineSloth.prototype.onLoad = function ($img) {
  var $wrapper = this.$element.closest('.sloth');
  var assumed_height;
  var orientation;

  // set width to the actual css property or inherited width
  // instead of fixed placeholder
  $wrapper.css('width', this.width);

  // compensate the difference between the assumed ratio
  // and the actual image height
  assumed_height = (this.initialWidth / $img.width()) * $img.height();

  // Get the orientation
  if ( this.width / assumed_height == 1 ) {
    orientation = 'is-square';

  } else if ( this.width / assumed_height < 1 ) {
    orientation = 'is-portrait';

  } else {
    orientation = 'is-landscape';

  }

  // fade in element
  this.$element
    .hide()
    .attr('src', $img.attr('src'))
    .fadeIn(880, function () {
      $wrapper.removeClass('is-loading');
    });

  // Animate wrapper to assumed height
  $wrapper
    .addClass(orientation)
    .animate({
      height: assumed_height
    }, 220, function () {
      $wrapper.css('height', '');
    });
};


/**
 * On error (inherits from sloth.base)
 */
InlineSloth.prototype.onError = function () {
  var $wrapper = this.$element.closest('.sloth');

  $wrapper.removeClass('is-loading')
          .addClass('is-errored');

  try {
    console.error('Could not load', this.source);
  } catch (err) {}
};



/**
 * [Other]
 *
 * Calculate dimensions (inherits from sloth.base)
 */
InlineSloth.prototype.calculateDimensions = function () {
  var $parent = this.$element.parent(),
      width = parseInt(this.$element.css('width'), 10);

  // -- width
  if (!!width) {
    // element has specified width
    this.initialWidth = width;
    this.width = (this.$element.get(0).style.width !== '') ?
      this.$element.get(0).style.width :
      this.initialWidth;

  } else {
    // inherit width
    this.initialWidth = parseInt(this.$element.parent().css('width'));
    this.width = this.initialWidth;

    // when having a max-width specified, the image doesn't need a set width
    if (this.$element.css('max-width') !== 'none') {
      this.width = '';
    }

  }

  // -- height
  this.initialHeight = this.initialWidth * (1 / this.ratio);
};


/**
 * Wrap (inherits from sloth.base)
 */
InlineSloth.prototype.wrap = function () {
  var $wrapper = $('<span class="sloth is-loading" />'),
      wrapper_opts;

  wrapper_opts = {
    'width': this.initialWidth,
    'height': this.initialHeight,
    'display': 'inline-block',
    'font-size': 0
  };

  if ( this.$element.css('max-width') !== 'none' ) {
    $.extend(wrapper_opts, { 'max-width': this.$element.css('max-width') });
  }

  // take in the reserved space in the dom
  $wrapper.css(wrapper_opts);

  // since the wrapper took over the positioning of the image,
  // make the image fill the wrapper
  this.$element.css({
    'display': 'block',
    'width': '100%',
    'position': 'relative',
    'z-index': 2
  });

  this.$element.wrap($wrapper);
};

return sloth;
}));
