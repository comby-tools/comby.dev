---
id: basic-usage
title: The Basics
sidebar_label: Basic Usage
---

<style>
blockquote {
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

## Overview

Comby is a tool for searching and rewriting code. You start by writing a simple
template to match syntax. Take a look at this Go function:

```go
func main() {
    fmt.Println("hello world")
}
```

We can match the arguments to `fmt.Println` with this _match template_ using
Comby syntax:

```plaintext
fmt.Println(:[arguments])
```

The `:[arguments]` part is called a hole. It saves the matched part to a
variable. In this case, the variable is called arguments, but we could have
called it something else, like `:[1]` or `:[the_1st_arg]`. Your choice! As long
as it only contains alphabet characters, numbers, or underscores.

The `:[arguments]` hole matches the "hello world" string. We can use it in a
_rewrite template_ to rewrite the function, like this one:

```
fmt.Println(fmt.Sprintf("comby says %s", :[arguments]))
```

Comby takes the match and rewrite templates and replaces the matched part in
place to produce:

```
func main() {
  fmt.Println(fmt.Sprintf("comby says %s", "hello world"))
}
```

To run this example on the command line, put the original code in a file `main.go` and run:

```bash
comby 'fmt.Println(:[args])' 'fmt.Println(fmt.Sprintf("comby says %s", :[args]))' .go
```

Or see it in action in the online [playground ↗](https://bit.ly/2XpttJG)


*All other characters are interpreted literally* except for [recognized syntax](syntax-reference).
There's a bit of detail about whitespace that you'll
find at the end of this page. The point is that you *never* have to escape any
characters in your template. Just say what you mean!

## How matching works

The way `:[hole]` starts and stops matching depends on the code structure around
it. We can also use the syntax `...` to mean a hole that we don't give a name
to. Let's look at a next example. There's some Javascript code on the left, and
a match template on the right:

<style>
table thead {
 visibility: collapse;
}
table td {
  width: 25em;
  min-width: 25em;
  max-width: 25em;
  border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}
table td:nth-child(2n) {
  border: 2px dotted gray;
  border-top: none;
  border-bottom:none;
}
code {
  background-color: #f0f0f0;
}
table tr {
  background-color: #f0f0f0;
}
</style>

|                                                                                   |                                     |
|-----------------------------------------------------------------------------------|-------------------------------------|
| <code class="hljs">if (width <= 1280 && height <= 800) {<br/>&nbsp;    return 1; <br/>}</code> | <code>if (:[var] <= :[rest])</code> |

> [playground ↗](https://bit.ly/2Xiw1cf)

`:[var]` matches until it sees the `<=` part coming after it and matches
`width`. `:[rest]` matches the rest of the condition: `1280 && height <= 800`.
These holes match lazily: they look for the shortest way to satisfy the match.
One way to refine matching is to add concrete context around holes based on what
we care about. For example, we could match `height` to `:[height]` with either templates

-- `if (... && :[height] ...)` or

-- `if (... :[height] <= 800)`

What we use just depends on what we care about in the surrounding code. Note we
used `...` as a hole to avoid giving a descriptive name.

When `:[hole]` occurs outside of delimiters, at the top-level of a template,
then matching continues up to the end of the line, or until we encounter block
syntax like `{...}` in JavaScript, whichever comes first. See the example
`if :[hole]` on the [playground ↗](https://bit.ly/31xX5Wg).

## Structural matching

If holes only matched lazily up to patterns like `<=` it wouldn't be much more
special than using `.*?` in regex to match a bunch of characters. But matching
is smarter than that. In many languages, balanced delimiters like `()`, `[]` and
`{}` are always balanced. By default, a match template like `(:[1])` will only
match characters inside well-balanced parentheses. There are two example matches
for `(:[1])` in this code:

```plaintext
result = foo(bar(x)) + foobar(baz(x));
```

> [playground ↗](https://bit.ly/2ZwvV1F)

The hole binds to `bar(x)` and `baz(x)` respectively, which we can easily
rewrite to a different call `qux(x)`, for example. You may notice that the `(x)`
part is a nested match. By default, Comby will match at the toplevel, but nested
matches can be found with added context (e.g., `bar(:[1])`), or by extracting
and rerunning Comby on modified code. Note that writing a regular expression to
do the same is not easy (simple attempts like [`\(.*\)`↗](https://regexr.com/4fssh)
or [`\(.*?\)` ↗](https://regexr.com/4fssk) don't work).

Let's change the code above and make it a little more interesting. Suppose it
was this Javascript snippet:

```javascript
var result = foo(bar(x /* arg 1) */)) + foobar("(");
```

> [playground ↗](https://bit.ly/2Xm12Mk)

Now there's quite a bit of complexity if we want to match the arguments of foo
and foobar. A block comment `/* arg 1) */` is inlined for `bar`. Because this is a
comment, it shouldn't matter whether the parenthesis inside are balanced or not.
The same goes for the string literal argument to `foobar`: it's not a parenthesis
in the code. The special thing here is that our original match template `(:[1])`
can stay *exactly the same* and still matches the two arguments (in this case, it
captures the comment and string)

```
var result = foo(bar(x /* arg 1) */)) + foobar("(");
```

> [playground ↗](https://bit.ly/2Zy5PYG)

Comby understands this interaction between delimiters, strings, and comments and
makes reasonable guesses for your language based on file extension. You can also
force a particular matcher with a command line option, see the [Quick Reference](cheat-sheet#select-the-language-to-parse).
And, you can always fall back to a generic matcher for files or languages that
are not explicitly supported. You can find out more about [language support and extension](advanced-usage#custom-language-definitions).

Note that if we tried to use a regex above, our pattern would need to understand
that `/* */` delineates comments, otherwise it would get confused by the
parenthesis inside! The same problem comes up for the string literal argument,
which contains an unbalanced parenthesis. A regular expression that takes all of
this into account would get ugly fast, and that's only for Javascript!

## Using regular expressions

Comby supports combining regular expressions with structural matching. The basic
syntax is `:[hole~regex]` where `regex` is some PCRE regular expression.
For example:

```text
:[fn~\w+](:[arg~\d+])
```

This template matches syntax that look like calls which have one argument consisting only of numbers:

```
foo(777)          // match
bar(not_a_number) // no match
baz(123)          // match
```

> [playground ↗](https://bit.ly/2D9pcSq)


There is one special rule to keep in mind when you use regex. Comby will try its
best to _first_ match your regular expression before carrying on with
matching the rest of the template. In Comby, regular expressions in the template
are _inlined_ and part of matching. This gives you a lot of power, because you
can match anything you like, including special syntax like parentheses. But that
also means that regular expressions can swallow syntax that prevents
well-structured matching.

For example, a template like `foo(:[hole~.*])` will not match `foo(bar)`. The
regex `.*` means Comby will greedy match zero or more of _any_ character,
including `)`. Comby will reach a point where `hole` matches `bar)`, and will
then expect a `)` in the template, but the `)` will already have been matched by
the regular expression.

So: be careful about inling regex holes. For convenience, Comby provides some
additional hole syntax for safe regular expressions. For example, the syntax
`:[[hole]]` can be used instead of `:[hole~\w+]`. Another available safe option
is to first extract syntax without regular expressions, and then use
[rules](advanced-usage#submatching-with-regular-expressions) to match the
extracted syntax with regular expressions. This is similar to piping the
contents to regex matching.

## About whitespace

Comby tries to make matching code forgiving. Whitespace in the template, like a
single space, multiple contiguous spaces, or newlines are interpreted all the
same: Comby will match the corresponding whitespace in the source code, but will
not care about matching the exact number of spaces, or distinguish between
spaces and newlines. Not being strict about whitespace tends to be the right
default decision for code in most languages. It means our previous match
templates all still work in these cases where our Javascript code is formatted
differently:

```
if (width <= 1280
    && height <= 800) {
    return 1;
}
```

> [playground ↗](https://bit.ly/2Xh2tMk)

```
if (width     <= 1280
    && height <= 800) {
    return 1;
}
```

> [playground ↗](https://bit.ly/2XaGTZV)

If you're wondering about indentation-sensitive languages like Python, be sure to check out the [FAQ](faq#what-about-indentation-sensitive-languages).
