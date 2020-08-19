# Readable Promises 

A [Promises/A+](https://promisesaplus.com/) compliant simplified implementation inspired on [JS Promises](https://tc39.es/ecma262/#sec-promise-objects).

For learning purposes only.

All the Promises implementations I've seen around are too simplified (they don't pass the compliance tests), or too difficult to read (they're optimized for performance or have extra features).

This implementation aims to be simple (~120 lines) and readable, while still being 100% compliant.

If you find answering [these 9 questions](https://danlevy.net/javascript-promises-quiz/?s=r) more difficult than you expected, it'd probably help to have a look into how Promises really work under the hood.

## This is not meant for production use. 

It passes the Promises/A+ [Compliance Test Suite](https://github.com/promises-aplus/promises-tests) but other than that it's stripped to the bare minimum.

The code is optimized for readability at the expense of everything else. This means:

- It lacks input checking and comprehensive error checking.
- No attention was paid to performance or efficiency (no dereferencing of handler lists after promise settles, liberal use of closures instead of pure functions, etc).
- Instead of a class it uses a simple factory / closure pattern. This eliminates a lot of noise (`this`, `.bind`, etc) and avoids exposing `_not_really_private` variables, but it also means memory usage is higher, you can't use `extends` and `instanceof`, etc.

## How to use

Use `git clone` to download the repository.  
Read the code, play with it. The API is the same as JS promises, but only the constructor, `.then` and `.catch` are implemented.

To run the Promises/A+ tests:  
```
cd readable-promises
npm install
npm test
```