# Sloth

Sloth is a **lazy image loading** solution that works on both inline images and as background images, on any viewport, on any device.

*Crafted with love by [@pieterbeulque](//github.com/pieterbeulque) & [@icidasset](//github.com/icidasset) at [@mrhenry](github.com/mrhenry)*


## Options

Options can be set globally on the `Sloth` object.

```js
Sloth.settings = {
  forceLoad: false, // This will ignore load when in viewport
  versions: {
    220: 'small',
    640: 'medium',
    1280: 'large'
  },
  retina: '',
  ratio: 16 / 9
};
```

By default the versions are controlled according to the Mr. Henry asset URL structure `//c.assets.sh/ID/SIZE`.

You can add your own source get function by setting the following setting:

```js
Sloth.settings = {
  sourceGetterFunction: function(modifier) {
    // add or replace modifier script
  }
};
```

Or by adding corresponding data-src-VERSION attributes. Note that you have to disable the source getter function:

```js
Sloth.settings = {
  sourceGetterFunction: false
};
```

Versions keys are min-widths with the data attribute suffix as value: `220: 'small'` will look for `data-src-small` if the elements width is between 220 and 640 pixels. If `data-src-{{size}}` is not found, it falls back to `data-src`.

Retina is the suffix to append on high pixel density screens. It checks for `devicePixelRatio` and will add the suffix to the source if bigger than one.

Ratio is the default ratio to use on inline images when loading. You can set this per image with a `data-ratio="4:3"` attribute, but this is the fallback.


## Usage

Install [https://github.com/protonet/jquery.inview](https://github.com/protonet/jquery.inview)

### Default globals pattern

```js
Sloth.Base.load('[data-src]');
```

### CommonJS pattern

```js
var Sloth = require('sloth/dist/sloth');

Sloth.Base.load('[data-src]');
```
