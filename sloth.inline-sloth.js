/**
 * @namespace
 */
var sloth = sloth || {};


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
  var $wrapper = this.$element.closest('.sloth'),
      assumedHeight,
      orientation;

  // set width to the actual css property or inherited width
  // instead of fixed placeholder
  $wrapper.css('width', this.width);

  // compensate the difference between the assumed ratio
  // and the actual image height
  assumedHeight = (this.initialWidth / $img.width()) * $img.height();

  // Get the orientation
  if (this.width / assumedHeight == 1) {
    orientation = 'is-square';
  } else if (this.width / assumedHeight < 1) {
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
      height: assumedHeight
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
    this.initialWidth = this.width = width;

    if (this.$element.get(0).style.width !== '') {
      this.width = this.$element.get(0).style.width;
    }
  } else {
    // inherit width
    this.initialWidth = this.width = parseInt(this.$element.parent().css('width'));

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
      wrapperOptions;

  wrapperOptions = {
    'width': this.initialWidth,
    'height': this.initialHeight,
    'display': 'inline-block',
    'font-size': 0
  };

  if (this.$element.css('max-width') !== 'none') {
    $.extend(wrapperOptions, { 'max-width': this.$element.css('max-width') });
  }

  // take in the reserved space in the dom
  $wrapper.css(wrapperOptions);

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
