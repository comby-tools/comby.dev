---
id: whatever-you-want-syntax
title: Whatever You Want syntax for rewriting program syntax
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

And so I latched onto this idea of being less fastidious about syntax design. I
factored out the metasyntax definition in `comby` to end up with Whatever You
Want (WYW) syntax. With WYW it's possible to attach any of the native matching
behaviors (semantics) in `comby` to _basically_ arbitrary syntax. The rest of
this post showcases some WYW definitions: the reasonable-but-mundane, the
slightly-creative, and the laughable.


### Dolla syntax

```

```

###




##

More reading:


SDF3

[racket](https://docs.racket-lang.org/guide/pattern-macros.html)
