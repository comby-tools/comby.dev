---
id: advanced-usage
title: Advanced Usage
sidebar_label: Advanced Usage
---

<style>
.blockquote-playground {
    // background-color:#00000000;
    border-left: 2px solid #ffa504;
    border-bottom: 2px solid #ffa504;
    border-left: 0px;
//    border-radius: 20px 0px 0px 20px;
    border-radius: 0px 20px 20px 0px;
    text-align: right;
    padding: 0px 10px 0px 0px;
    align: right;
    width: 115px;
    margin-left: 85%;
}
</style>

## Rules

Comby includes a small rule language that you can use to perform additional
operations for matches and rewrites. Rules start with the word `where`, and can
perform [equality checks](#equality), [rewriting](#rewrite-expressions), or
nested [pattern matching](#pattern-match-expressions).

### Equality

A rule can check whether two variables are syntactically
equal. For example, we can check for duplicate expressions in if-conditions with
the following match template and rule:

```bash
if (:[left_side] && :[right_side])
```

```bash
where :[left_side] == :[right_side]
```

This matches code where the programmer perhaps made a mistake and duplicated an
expression without changing a variable like `x` to `y`:

```bash
if (x == 500 && x == 500)
```

<blockquote class="blockquote-playground"> <a href="https://bit.ly/2Na9UAS">playground ↗</a> </blockquote>

You can use the `!=` operator to check inequality. Multiple conditions can be
separated by a comma, and mean "logical and". The following adds a condition to
ignore our match case above:

```bash
where :[left_side] == :[right_side], :[left_side] != "x == 500"
```

<blockquote class="blockquote-playground"> <a href="https://bit.ly/2NaaCOy">playground ↗</a> </blockquote>

Variables can be compared to other variables or string contents (enclosed by
double quotes).

### Rewrite expressions

A `rewrite { ... }` expression can rewrite syntax captured in a hole. This is
useful for rewriting repetitions of a pattern. This example converts arguments
of a dict to a JSON-like format, where `dict(foo=bar,baz=qux)` becomes
`{"foo": bar, "baz": qux}`:

`dict(:[args])` => `:[args]`

`where rewrite :[args] {  ":[[k]]=:[[v]]" -> "\":[k]\": :[v]" }`

<blockquote class="blockquote-playground"> <a href="https://bit.ly/30d3Tss">playground ↗</a> </blockquote>

The pattern rewrites every matching instance of `:[[k]]=:[[v]] to ":[k]": :[v]`.
The contents of the `:[args]` hole are overwritten if the rewrite pattern fires.
Note that the left and right hand sides inside the `{ ... }` need enclosing
string quotes. This means that our pattern needs to escape the double quotes on
the right hand side.

Conceptually, a rewrite rule works the same way as a toplevel match and rewrite
template, but only for a particular hole, and has the effect of overwriting the
hole contents when there are substitutions.

It is possible to have sequences of rewrite expressions in a rule. Here a second
rewrite expression adds quotes around `:[v]`:

```bash
where
rewrite :[args] {  ":[[k]]=:[[v]]" -> "\":[k]\": :[v]" },
rewrite :[args] {  ": :[[v]]" -> ": \":[v]\"" }
```

<blockquote class="blockquote-playground"> <a href="https://bit.ly/306lB0H">playground ↗</a> </blockquote>

The rewrite expressions are evaluated in a left-to-right sequence and overwrite
`:[args]` in every case where expressions succeed. Rewrite expressions always
return true, even if they don't succeed in rewriting a pattern. What this means
for the example above is that the first rewrite expression will be attempted on
`:[args]`. Even if it does not succeed in rewriting any patterns, the second
rewrite expression will also be attempted. If neither rewrite expression change
the contents of `:[args]`, it remains unchanged in the output of the toplevel
rewrite template.

It is not currently possible to nest rewrite statements.

### Pattern Match expressions

> Pattern match expressions are in active development and may change slightly in meaning
> or syntax, but are currently available to use or experiment with.

Here is an example using the nested matching syntax:

```bash
where match :[left_side] {
| "x == 600" -> false
| "x == 500" -> true
}
```

The match `{ ... }` says to match the text bound to `:[left_side]` against each
of the match cases | match_case, and to perform the filter on the right-hand
side of the `->` when the pattern matches. Nested matching statements can nest:

```bash
where match :[left_side] {
| "x == 500" ->
  match :[right_side] {
  | "x == 500" -> true
  | "x == 600" -> false
  }
| "x == 600" -> false
}
```

## Custom language definitions

Hopefully the language you're interested is already [supported](overview#does-it-work-on-my-language) or
works with the generic matcher. If you have your own DSL or data format, you can
define a small language definition for it in a simple JSON file, and pass it as
a custom matcher. Just define the following supported language constructs in
JSON, like this:

```json
{
   "user_defined_delimiters":[
      [
         "case",
         "esac"
      ]
   ],
   "escapable_string_literals":{
      "delimiters":[
         "\""
      ],
      "escape_character":"\\"
   },
   "raw_string_literals": [],
   "comments":[
      [
         "Multiline",
         "/*",
         "*/"
      ],
      [
         "Until_newline",
         "//"
      ]
   ]
}
```

Put the contents above in a JSON file, like `my-language.json`, and then specify
your file with the `-custom-matcher` flag. Here's how to run the custom language
rewrite on all files with the extension `.newlang`:

```plaintext
comby -custom-matcher my-language.json 'match...' 'rewrite...' .newlang
```

If you want your missing language to be built into Comby, open a feature
request, or have a look at the languages file which can be modified for
additional languages.

Note that languages can currently be added and expanded with respect to
_syntactic_ code structures that Comby recognizes: balanced delimiters,
comments, and kinds of string literals. By design, it currently isn't possible
to further refine the meaning of syntax into keywords or high-level structures
like functions.

## Substituting fresh identifiers

Rewrite templates may contain the syntax `:[id()]` which generates a random
alphanumeric identifier in the output. This is useful, for example,
when creating fresh variable names during a refactor.

```plaintext
var a_:[id()] = 42
var :[left] = :[[right]] + 1
```
<blockquote class="blockquote-playground"> <a href="https://bit.ly/3fg8H4r">playground ↗</a> </blockquote>

To reference the same identifier in multiple places in the template, simply supply a label to `id`, like so:

```plaintext
anon_:[id(my_label)] = func(){:[body]}
anon_:[id(my_label)]()
```

<blockquote class="blockquote-playground"> <a href="https://bit.ly/30xWQKK">playground ↗</a> </blockquote>
