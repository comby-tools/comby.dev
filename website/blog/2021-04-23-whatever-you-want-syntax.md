---
id: whatever-you-want-syntax
title: Whatever You Want syntax for rewriting code
author: Rijnard
authorURL: https://twitter.com/rvtond
authorImageURL: https://pbs.twimg.com/profile_images/1146126296889593858/jM_N3HPx_400x400.png
---

<style>
table td {
   padding: 0px;
   border: none;
}
table tr {
   padding: 0px;
   border: none;
}
</style>

What if you could specify a pattern that... and it ...


Like many pattern-matching languages,
[`comby`](https://github.com/comby-tools/comby) recognizes some reserved syntax
that has special meaning for matching an input. Think of a `grep` pattern like
`.*`. Here the reserved syntax `.` means mean "match any character" and `*`
means "repeat matching the previous expression zero or more times". In the rest
of this post I'll just call this reserved syntax a metasyntax. `comby`
predominantly uses a metasyntax like that looks like this:

`:[`_`var`_`]`

which roughly means "match anything within well-delimited syntax and hold those
contents in a variable _var_". There are some variations of this syntax for
other matching behaviors, you can [find the reference
here](https://comby.dev/docs/cheat-sheet) but it's not so important right now.

In some sense, syntax variety is the spice of programming languages. If you're
designing a new language you have to pick _something_, and you're probably going
balance picking some familiar syntax constructs (a la "parentheses seem
reasonable for arithmetic expressions, we're not barbarians") but then also
sprinkle in some unique things so that your grammar isn't accidentally
isomorphic to Java. Once set, you'll famously retain the loyalty of early
adopters ([`make` used tabs rather than spaces to not disrupt existing
users](https://beebo.org/haycorn/2015-04-20_tabs-and-makefiles.html)), or
[dismay an academic on twitter](https://twitter.com/ShriramKMurthi/status/1359543291587551239). It's
really your privilege.

I didn't really like picking a metasyntax for `comby`. It's difficult to
anticipate what the consequences of settling on a syntax would be. Maybe I'm
designing myself into a corner and it'll make future syntax extensions
impossible. Maybe the syntax will cause an Angular programmer to break out in
hives. I just wanted it to be minimal, and I wanted it to be easy to assign
matched contents to variables. Not the obscure `(?P<name>pattern)` syntax of
named groups in some regular expression dialects.

Since then, I've wanted to experiment with other syntax. For example, I noticed
that the `gofmt` tool will accept Greek letters as variables that bind to
expressions.

```bash
gofmt -r 'α[β:len(α)] -> α[β:]'
```

And so I latched onto this idea of being less fastidious about syntax design. We
have color themes for our IDEs, why not syntax themes for our tools?

> Interstitial: Yes, allowing different language syntax can lead to fragmented
> and inconsistent tooling. But who am I to deprive you from shooting yourself
> in the foot, o mighty developer. Besides, if the tooling is malleable, maybe
> we can shape it to be in line, and consistent with, pervading opinions.

I factored out the metasyntax definition in `comby` to end up with Whatever You
Want (WYW) syntax. With WYW it's possible to attach the native matching behavior
(semantics) implemented in `comby` to _basically_ arbitrary syntax. Syntax
definitions are defined in JSON. The rest of this post showcases some WYW
definitions: the reasonable-but-mundane, the slightly-creative, the laughable,
and the deplorable.

## Default syntax definitions

Just to ground ourselves, below is the JSON definition for the default `comby`
metasyntax. Entries correspond to the matching behavior described in the
[reference](https://comby.dev/docs/syntax-reference). No need to dwell on this
format--have a look at the detailed page for [defining your own metasyntax]() if you want particulars.
Here's an invocation of a swap transformation with the default syntax:

```bash
echo 'swap(x, y)' | \
comby -stdin \
'swap(:[1], :[2])' 'swap(:[2], :[1])'
```

produces

```diff
@|-1,1 +1,1 ============================================================
-|swap(x, y)
+|swap(y, x)
```

<details>
  <summary><strong>Expand for JSON definition</strong></summary>

```json
{
  "syntax": [
    [ "Hole", [ "Everything" ], [ "Delimited", ":[", "]" ] ],
    [ "Hole", [ "Expression" ], [ "Delimited", ":[", ":e]" ] ],
    [ "Hole", [ "Alphanum" ],   [ "Delimited", ":[[", "]]" ] ],
    [ "Hole", [ "Non_space" ],  [ "Delimited", ":[", ".]" ] ],
    [ "Hole", [ "Line" ],       [ "Delimited", ":[", "\\n]" ] ],
    [ "Hole", [ "Blank" ],      [ "Delimited", ":[ ", "]" ] ],
    [ "Regex", ":[", "~", "]" ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>

## Dolla dolla bills

Dolla syntax is an entirely reasonable alternative syntax where `$` prefixes
variables alphanumeric variables.


```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax dolla.json \
'swap($1, $2)' 'swap($2, $1)'
```

This is a common and familiar syntax in Bash, Perl, PHP, and similar languages.
It is also a bit more terse than the default `comby` syntax. If you're wondering
"what if I want to match a the literal syntax `$var`, won't that conflict with
this metasyntax?", you'd be right. One way to avoid this is to change the
metasyntax, but that can become inconvenient. Comby deals with syntax conflicts
in a generic way by allowing an escape hatch via regular expression matching.
That is, regular expression syntax recognizes escape sequences (e.g., `\.` to
match `.` literally) so we can just match conflicting syntax literally via
regular expression escaping.

The one prerequisite is that you just need to define your own metasyntax for
embedding regular expressions in the syntax definition. This way, you get a
built-in escape hatch without having to define another syntax for escaping or
quoting conflicting syntax. For example, we could define an embedding regular
expression metasyntax like `$<variable>~<regex>$` (the syntax definition allows
you to customize the prefix and suffix syntax `$` and `~` parts here). Then you
can match `$var` literally with a pattern like `$1~$var.`.

```bash
echo 'swap($x, $y)' | \
comby -stdin -custom-metasyntax dolla.json \
'swap($1~$x., $2)' 'swap($2, $1)' # matches the first $x literally
```

```diff
@|-1,1 +1,1 ============================================================
-|swap($x, $y)
+|swap($y, $x)
```

<details>
  <summary><strong>JSON definition of Dolla metasyntax</strong></summary>

```json

{
  "syntax": [
    [ "Hole", [ "Everything" ], [ "Delimited", "$*", null ] ],
    [ "Hole", [ "Expression" ], [ "Delimited", "$", null ] ],
    [ "Hole", [ "Alphanum" ],   [ "Delimited", "$$", null ] ],
    [ "Regex", "$", "~", "." ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}

```

</details>


## Lambda syntax

To use similar Greek letters like the `gofmt` `α[β:]` syntax, I made it possible
to associate any unicode string with the matching behaviors that `comby`
supports. This is legitimately useful for avoiding syntax conflicts, and also
very terse.


```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax lambda.json \
'swap(α, β)' 'swap(β, α)'
```

And if we wanted to match any kind of function name like `swap`, we could use a variable λ.

```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax lambda.json \
'λ(α, β)' 'λ(β, α)'
```

I like this. The only challenge is that I can't easily find these symbols on my
keyboard.

<details>
  <summary><strong>JSON definition of Lambda metasyntax</strong></summary>

```json
{
  "syntax": [
    [ "Hole", [ "Everything" ], [ "Delimited", "place-holder", null ] ],
    [ "Hole", [ "Everything" ],
        [ "Reserved_identifiers",
            [ "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ", "Φ", "Ψ", "Ω" ]
        ]
    ],
    [ "Hole", [ "Expression" ],
        [ "Reserved_identifiers",
            [
                "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ",
                "μ", "ξ", "π", "ρ", "ς", "σ", "τ", "υ", "φ", "χ", "ψ",
                "ω"
            ]
        ]
    ],
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>


## Emoji Movie

I did say any unicode string, so emojis count.

```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax emoji.json \
'swap(🐵, 🍌)' 'swap(🍌, 🐵)'
```

When variables are used multiple times in a pattern, it implies that they should
be textually equal. For example, if we wanted to check that two arguments of an
`add` function are are equal, we could write a transformation like this:

```bash
echo 'add(x, x)' | \
comby -stdin \
'add(:[v], :[v])' 'multiply(2, :[v])'
```

```diff
@|-1,1 +1,1 ============================================================
-|add(x, x)
+|multiply(2, x)
```

This equals relation is still valid when the syntax is redefined. So we can
instead write this in the preferred emoji syntax.

```bash
echo 'add(x, x)' | \
comby -stdin -custom-metasyntax emoji.json \
'add(😂, 😂)' 'multiply(2, 😂)'
```


<details>
  <summary><strong>JSON definition of Lambda metasyntax</strong></summary>

```json
{
  "syntax": [
    [ "Hole", [ "Everything" ], [ "Delimited", "place-holder", null ] ],
    [ "Hole", [ "Everything" ],
        [ "Reserved_identifiers",
            [ "❤️", "💙", "💚", "💜", "💛", "🧡" ]
        ]
    ],
    [ "Hole", [ "Expression" ],
        [ "Reserved_identifiers",
            [ "😂", "🚡", "😃", "😬", "😈", "🐵", "✋", "😻", "🍌" ]
        ]
    ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>


## Wutspace

I did say any unicode string, so of course whitespace is allowed. If whitespace
conflicts with the some other part of the pattern, you'll have to find an escape
mechanism to match whitespace literally. This is WYW syntax: your syntax, your
problems 🙂. If we use whitespace as identifiers, we'll need unique one so that
they don't imply that matches are equal. So we'll choose `<space>` and
`<space><space>` in the swap example:


```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax wutspace.json \
'swap( ,  )' 'swap(  , )'
```

<details>
  <summary><strong>JSON definition of Wutspace metasyntax</strong></summary>

```json
{
  "syntax": [
    // Currently a placeholder is needed if we only care about Reserved_idenitifersl to avoid trickery.
    // Order is significant.
    [ "Hole", [ "Everything" ], [ "Delimited", "place-holder", null ] ],
    [ "Hole", [ "Everything" ],
        [ "Reserved_identifiers",
            [ "  ", " " ]
        ]
    ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>

## suǝɹɐd

That's parens upside down. Because it's (un)naturally possible to define
inverted parentheses as variable delimiters.

```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax inverted-parens.json \
'swap()1(, )2()' 'swap()2(, )1()'
```


<details>
  <summary><strong>JSON definition of inverted parens metasyntax</strong></summary>

```json
{
  "syntax": [
   [ "Hole", [ "Everything" ], [ "Delimited", ")", "(" ] ],
   [ "Hole", [ "Expression" ], [ "Delimited", "))", "((" ] ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>

## Dangling

But for maximum confusion, just define a prefix `)` for variables. Comby won't
confuse that metasyntax with well-balanced parentheses because metasyntax takes
priority during parsing.


```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax dangling.json \
'swap()1, )2)' 'swap()2, )1)'
```

<details>
  <summary><strong>JSON definition of Dangling metasyntax</strong></summary>

```json
{
  "syntax": [
   [ "Hole", [ "Everything" ], [ "Delimited", ")", null ] ],
   [ "Hole", [ "Expression" ], [ "Delimited", "))", null ] ]
  ],
  "identifier":
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
}
```

</details>


###




##

More reading:


SDF3

[racket](https://docs.racket-lang.org/guide/pattern-macros.html)
