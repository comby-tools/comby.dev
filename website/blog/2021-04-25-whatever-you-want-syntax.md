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
blockquote {
    text-align: center;
    background: white;
    border: 2px solid rgba(1, 1, 1, .1);
    border-radius: 10px;
    border-top: 0px;
    border-bottom: 0px;
#    border-right: 0px;
#    border-left: 0px;
}
</style>

> We have color themes for our IDEs. We should have syntax themes for our tools.

Search and Replace commands could look like this.

`swap($1, $2)` → `swap($2, $1)`

`swap(α, β)` → `swap(β, α)`

`swap(🐵, 🍌)` → `swap(🍌, 🐵)`

With Whatever You Want (WYW) syntax, it's really up to you.

---

Like many pattern-matching languages,
[`comby`](https://github.com/comby-tools/comby) recognizes some reserved syntax
that has special meaning for matching input. Think of a `grep` pattern like
`.*`. Here the reserved syntax `.` means mean "match any character" and `*`
means "repeat matching the previous expression zero or more times". In the rest
of this post I'll just call this reserved syntax a metasyntax. `comby`
predominantly uses a metasyntax that looks like this:

`:[`_`var`_`]`

which roughly means "match anything within well-balanced syntax for some
language _L_ and bind those contents to variable _var_". There are some
variations of this syntax for other matching behaviors (you can [find the
reference here](../../../../docs/syntax-reference)) but that's not
important for this post.

In some sense, syntax variety is the spice of programming languages. If you're
designing a new language you have to pick _something_, and you're probably going
to balance picking some familiar syntax (a la "parentheses seem reasonable for
arithmetic expressions, we're not barbarians") but then also sprinkle in some
unique things so that your grammar isn't accidentally isomorphic to Java. Your
decisions may retain the loyalty of early adopters (`make` famously stuck with
tabs instead of spaces [to not disrupt the early dozen or so
users](https://beebo.org/haycorn/2015-04-20_tabs-and-makefiles.html)). Or you
might [dismay academics on twitter](https://twitter.com/ShriramKMurthi/status/1359543291587551239).
Whatever you decide, it's really your privilege.

I didn't really like settling on a metasyntax for `comby`. It's difficult to
anticipate what the consequences of settling on a syntax are. Maybe I'm
designing myself into a corner and it'll make future syntax extensions
impossible. Maybe the syntax will cause an Angular programmer to break out in
hives. I just wanted it to be minimal, and I wanted it to be easy to assign
matched contents to variables. Not something like `(?P<name>pattern)` syntax of
named groups in some regular expression dialects.

Since then, I've wanted to experiment with other syntax. For example, I noticed
that the [`gofmt` tool shows an example using Greek unicode letters as variables](https://golang.org/cmd/gofmt/#hdr-Examples).

```bash
gofmt -r 'α[β:len(α)] -> α[β:]'
```

And so I latched onto this idea of being less fastidious about syntax design.

Yes, allowing different language syntax can lead to fragmented and inconsistent
tooling. But who am I to deprive you from shooting yourself in the foot, O
mighty developer? Besides, if the tooling is malleable, maybe we can shape it to
be in line and consistent with pervading opinions.

I factored out the metasyntax definition in `comby` to support Whatever You
Want syntax. With WYW syntax it's possible to attach the native matching
behavior (semantics) implemented in `comby` to basically arbitrary syntax.
Syntax definitions are defined in JSON. The rest of this post showcases some WYW
definitions: the reasonable, the laughable, and the deplorable.

## Default syntax definition

To ground things, the examples below run a transformation on the input `swap(x,
y)` and rewrites it to `swap(y, x)`. Here's an invocation of a swap transformation in the
default metasyntax.

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

Below is the JSON definition for this metasyntax. Entries correspond to the
matching behavior described in the
[reference](../../../../docs/syntax-reference). No need to dwell on this
format--this blog post is really just about enjoying the show. Have a look at
the detailed page for [defining your own metasyntax](../../../../docs/advanced-usage#custom-comby-metasyntax) if you want particulars
after reading.

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
It is also a bit more terse than the default `comby` syntax. You might be
wondering You might ask "What if I want to match a the literal syntax `$var`,
won't that conflict with this metasyntax?". See the [section on escaping](#on-escaping) later
in this post if you're interested in this corner case.

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

To use similar Greek letters like the `α[β:]` syntax show before, I made it
possible to associate any unicode string with the matching behaviors that
`comby` supports. This is legitimately useful for avoiding syntax conflicts, and
also very terse.


```bash
echo 'swap(x, y)' | \
comby -stdin -custom-metasyntax lambda.json \
'swap(α, β)' 'swap(β, α)'
```

And if we wanted to match any kind of function name like `swap`, we could use a
variable λ if desired.

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
instead equivalently write this in preferred emoji syntax.

```bash
echo 'add(x, x)' | \
comby -stdin -custom-metasyntax emoji.json \
'add(😂, 😂)' 'multiply(2, 😂)'
```

```diff
@|-1,1 +1,1 ============================================================
-|add(x, x)
+|multiply(2, x)
```

<details>
  <summary><strong>JSON definition of Emoji metasyntax</strong></summary>

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

Any unicode string. So of course whitespace is allowed. If whitespace conflicts
with the some other part of the pattern, you'll have to find an escape mechanism
to match whitespace literally. This is WYW syntax: your syntax, your problems
🙂. If we use whitespace as identifiers, we'll need unique ones when we don't
want matches to be equal. So we'll choose `<space>` and `<space><space>` to demo
the `swap` example. We're also going remove spaces in our input, because that
introduces ambiguity. But anyway, you end up in a world where this can make some
kind of sense.

```bash
echo 'swap(x,y)' | \
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

For maximum confusion, just define a prefix `)` for variables. Comby won't
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

## Summary

There you have it. Maybe you'd like to define a templating language with
`{{var}}` or something else, it's Whatever You Want. For the curious reader, and
to characertize some of the technical details more concretely, I cover some more
thoughts on related tools and techniques below.

### On syntax definitions

**Language workbenches** define programming languages to the nth degree--not
only the syntax, but also static and dynamic semantics, and more. A prime
example is [Spoofax](http://www.metaborg.org/en/latest/index.html).
[SDF3](http://www.metaborg.org/en/latest/source/langdev/meta/lang/sdf3/introduction.html)
is Spoofax's interface for defining language syntax. Generally, syntax
definition here defines a grammar of input syntax to recognize, and parsing the
input yields a concrete syntax tree or abstract syntax tree representation. This
tree is later interpreted or evaluated by another program to perform some
computation.

The WYW metasyntax definition in `comby` operates rather differently. It only
lets you define a comparatively simple syntax for some fields in a JSON format
(you're not defining a grammar here, just some parts of it). And then, those
definitions are only associated with preexisting computations that `comby`
implements (roughly, language-aware context-free matching). Indeed,
`comby` is built on the premise that no explicit parse tree or abstract syntax
tree is needed at all to perform its syntax-tree rewriting. The `comby`
metasyntax definitions directly parameterize matching behavior and there is no
in-between tree representation. Because there is no in-between tree
representation, the use cases and goals of `comby` metasyntax definitions are
simpler and rather less powerful than syntax definition frameworks found in
language workbenches.

**Macros** are a well-known abstraction in languages that can (re)define syntax.
[Racket `define-syntax`](https://docs.racket-lang.org/reference/define.html) and
[Rust macros](https://doc.rust-lang.org/rust-by-example/macros.html) are
notable. Macro definitions are different compared to `comby` metasyntax
definitions in this post in the sense that macro systems can generally
introduce arbitrary computation. With `comby`, the metasyntax definitions only
parameterize existing match behaviors.

### On escaping

What happens if you define a metasyntax where `$x` is a variable but you want to
match the literal string `$x`? One way to avoid this is to change the
metasyntax, but that can be inconvenient. Comby deals with syntax conflicts in a
generic way by allowing an escape hatch via regular expression matching. Because
regular expression syntax recognizes escape sequences (e.g., `\.` to match `.`
literally) we can just match conflicting syntax literally via regular expression
escaping. This way, you get embedded regular expression matching (should you
choose to make use of it) and a built-in escape hatch for those rare cases of
conflicting syntax. As far as corner cases for quoting and escape hatches go, I
find it's simpler to just piggyback on an established regular expression
language that uses `\`-escaping rather than expose an entirely new interface
that requires you to invent a custom escape syntax.

To make this work, `comby` just needs a metasyntax definition for embedding
regular expressions. By default, `comby` uses `:[<variable>~<regex>]` for
embedding regular expressions. We could define an alternative metasyntax like
`$<variable>~<regex>.` Here the syntax definition allows you to customize the
prefix and suffix syntax `$` and `~` parts. The suffix, in this case `.`, is
important so that we can recognize when to stop scanning this metasyntax, since
the expression `<regex>` may be any character allowed by the regular expression
language. Once this part is defined, you can match `$var` literally with a
pattern like `$1~$var.`.

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

As far as search-replace tools, it's worth mentioning a related idea here in
`sed`. It's a lesser known fact that `sed` actually accepts arbitrary characters
to delimit search and replace patterns. Most online examples use `/`:

```
$ echo 'http' | sed 's/http/https/'
> https
```

But you can really choose any character. This is especially useful when the
input contains `/`, which you'd need to escape otherwise. Instead of

```
$ echo 'http://' | sed 's/http:\/\//https:\/\//'
> https://
```

You could use a `~`:

```
$ echo 'http://' | sed 's~http://~https://~'
> https://
```
