# banksy

> Street art between [woofmark][2] and [horsey][1]

# Install

```shell
npm install banksy --save
```

# Features

Banksy helps you integrate the autocompletion features of [horsey][1] into a [woofmark][2] editor. It does this as unobtrusively as possible, by listening for a few events and running commands on your `editor` instance. Afterwards, the `banksy` instance destroys the `horse` when you're done with it, properly cleaning up after itself.

# Usage

Granted that you want to integrate a [horsey][1] instance into a [woofmark][2] editor, you can use `banksy` to alleviate the load, as it can be pretty confusing to make the two work in tandem.

# `banksy(el, options)`

After instantiating both the `editor` and the `horse`, use `banksy` to paint a bridge between the two.

```js
var editor = woofmark(el);
var horse = horsey(el);
var bridge = banksy(el, {
  editor: editor,
  horse: horse
});
```

That's it, now `horse` will work as you'd expect on all types of input for the `woofmark` editor.

# `bridge.destroy()`

To properly destroy the bridge, you can run `bridge.destroy()`. Note that this will destroy the `horse` instance as well, calling `horse.destroy()`.

# License

MIT

[1]: https://github.com/bevacqua/horsey
[2]: https://github.com/bevacqua/woofmark
