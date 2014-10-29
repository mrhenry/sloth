/**
 * @constructor Sloth.Background
 */
function BackgroundSloth($element, options) {
  this.constructor.call(this, $element, options);
}


/**
 * Inherit from Base
 */
BackgroundSloth.prototype = new sloth.Base();
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
