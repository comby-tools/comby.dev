---
id: configuration
title: Configuration Files
sidebar_label: Configuration Files
---

## TOML Format

You can configure comby to run a suite of patterns in a single file. The file
format uses [TOML](https://github.com/toml-lang/toml). Here is an example file
that contains two rewrite patterns:

```toml
[my-first-pattern]

match="Array.prototype.slice.call(:[arguments]);"

rewrite="Array.from(:[arguments])"

[my-second-pattern]
# A multiline example.

match='''
function :[[fn]](:[1], :[2]) {
  :[body]
};'''

rewrite='''
function :[[fn]](:[2], :[1]) {
  :[body]
};'''

rule='where :[fn] != "divide"'
```

Start a pattern by giving it a section name like `[my-first-pattern]`. You can
add as many patterns as you like, but each name must be unique in the file.
Multiple patterns are run in _alphabetical order by name_.

After each section like `[my-first-pattern]`, you should specify:

- `match=...` for the match template
- `rewrite=...` for the rewrite template
- `rule=...` (optional) valid [rule](advanced-usage#rules)

Like the example above, the templates should be quoted. Use triple quotes for
multiline templates. Use a single `'` or `'''` to avoid escaping double quotes, as
done for `rule=...` above.

Over time, the configuration file will allow more options and flags. If you have a special request,
please [create an issue](https://github.com/comby-tools/comby/issues/new).

## Running

You can run the above configuration on the contents below. For example, put the
following in a file `in.js` where you will run `comby`:

```
Array.prototype.slice.call(arguments);

function multiply(x, y) {
  return x * y;
};

function divide(x, y) {
  return x / y;
};
```

Create a file to store your patterns. For example, place the above contents in a
file like `comby.toml`. Run it on a set of files that have the `.js` extension
like this:

```text
comby -config comby.toml -f .js
```

> Currently, it's important to use the `-f` option for filtering files when using -config, or comby will think it is an anonymous argument for a command line template. [Subcommands](https://github.com/comby-tools/comby/issues/193) will help resolve this issue.

You can add additional flags, like `-i`, `-exclude`, `-matcher` and so on, as usual.

It's possible to specify more than one config file, for example:

```text
comby -config one.toml,two.toml,three.toml -f .js
```

However, all pattern names must be unique across all of these files.
