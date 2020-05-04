# nativescript-fading-scroll-view

![Android](/android.png)
![iOS](/ios.png)

## Installation

Describe your plugin installation steps. Ideally it would be something like:

```javascript
tns plugin add nativescript-fading-scroll-view
```

## Usage


In app.js
```
Vue.registerElement('FadingScrollView', () => require('nativescript-fading-scroll-view').FadingScrollView)
```

In xml
```
<FadingScrollView fadePercentage="0.3" scroll="onScroll">
...
</FadingScrollView>
```

## API

This plugin acts exactly like NativeScript core ui ScrollView, only with fading edge effects.
If you don't want any fading edge effect, set fadePercentage="0" (or just use ScrollView, of course).

Remember that if the exact height isn't specified, the fading edge effect won't work in Android.

| Property | Default | Description |
| --- | --- | --- |
| fadePercentage | 0.3 | Strength of fade effect (value in range [0, 0.5]) |

## License

Apache License Version 2.0, January 2004
