---
id: faq
title: Frequently Asked Questions
sidebar_label: FAQ
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

## Isn't a regex approach like `sed` good enough?

Sometimes, yes. But often, small changes and refactorings are complicated by
nested expressions, comments, or strings. Consider the following C-like snippet.
Say the challenge is to rewrite the two **if** conditions to the value **1**.
Can you write a regular expression that matches the contents of the two if
condition expressions below, and only those two? Feel free to share your pattern
with [@rvtond](https://twitter.com/rvtond) on Twitter.

```c
if (fgets(line, 128, file_pointer) == Null) // 1) if (...) returns 0
      return 0;
...
if (scanf("%d) %d", &x, &y) == 2) // 2) if (scanf("%d) %d", &x, &y) == 2) returns 0
      return 0;
```
> [playground ↗](https://bit.ly/30935ou)

To match these with comby, all you need is the pattern `if (:[condition])`. As a
small step, add `-matcher .c` to the command so that comby interprets the input
as a C-like language (it doesn't have to be exactly valid C). The replacement
pattern is `if (1)`. There's no thinking about all of the gotchas that could go
wrong when using regex.

## What about indentation-sensitive languages?

Comby does not currently consider whitespace indentation significant. We have
plans to support it though! The idea is that your declarative templates will
match on code that happens at the correct relative indentation level, for
languages like Python. Stay tuned! Of course, a lot of Python code is not
sensitive to whitespace indentation, so Comby is still useful (for example, a
lot of Python 2 to Python 3 conversions can be written with Comby).

## What can I use Comby for?

Comby is well-suited for matching and changing coarse syntactic structures. Uses
include:

→ Custom linter checks and refactors. See the [example
catalog](https://catalog.comby.dev/) for checks in existing tools.

→ Bug hunting. Find unchecked functions, incorrect API calls, or copy-paste
errors with structured matching that is easier and more powerful than regex.

→ Temporarily changing or removing code for tests or analyses. Stubbing or
changing code is useful for suppressing spurious warnings, and for refining
static analyses or fuzzing.

→ A custom templating engine. Because Comby understands balanced delimiters
generically, you can easily roll your own templating engine (for example, by
creating and applying [multiple templates](cheat-sheet#run-multiple-search-and-replace-templates)).

## What is Comby not good at?

When talking about matching or changing code, Comby is not well-suited to
stylistic changes and formatting like "insert a line break after 80 characters".
Pair Comby with a language-specific formatter to preserve formatting (like `gofmt`
for the Go language) after performing a change.

## What features are currently in development or planned for the future?

See the [feature
table](https://github.com/comby-tools/comby/blob/master/docs/FEATURE_TABLE.md)
and [roadmap](https://github.com/comby-tools/comby/blob/master/docs/ROADMAP.md)
in the GitHub repository.
