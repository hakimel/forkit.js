# forkit.js

An experimental animated ribbon which reveals a curtain of additional content.

Curious about how this looks in action? [Check out the demo page](http://lab.hakim.se/forkit-js/).

## Events

Open/close events are dispatched from the main ```.forkit``` element:

```javascript
document.querySelector( '.forkit' ).addEventListener( 'forkit-open', function() {
  // fired when the curtain is pulled down
} );

document.querySelector( '.forkit' ).addEventListener( 'forkit-close', function() {
  // fired when the curtain retracts
} );
```

# License

MIT licensed

Copyright (C) 2017 Hakim El Hattab, http://hakim.se
