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

## How does Comby compare to tools like Semgrep and Coccinelle?

Comby's functionality overlaps with declarative languages for matching and
changing code. While there are many related tools in this space, the most directly related
are [Semgrep](https://github.com/returntocorp/semgrep) and [Coccinelle](https://coccinelle.gitlabpages.inria.fr/website/).

### Semgrep

**Short version.** Comby tries to generically support all languages and data
formats at some level of syntax support and expressivity. To do that it
sacrifices the ability to recognize many predefined language-specific
constructs, allowing more freeform pattern writing and matching. Comby can be
more forgiving and flexible for matching partial syntax in programs that
correspond meaningfully to code structure, with less language-specific precision
than what's possible in Semgrep. Semgrep can provide higher fidelity,
language-specific structural matching subject to language and parser support,
and in some cases may be less flexible because it is more strict about the
patterns it accepts.

**Long version.** Semgrep provides similar matching functionality that overlaps with
Comby. The way it does this is by first parsing programs for various languages
into a tree structure. User-supplied patterns are interpreted and matched
against these tree structures.

Semgrep uses language parsers that often know more about the details of a
language's grammar (ergo, program terms) than Comby. For example, Semgrep's Go
parser may recognize a Go function and label it in a parse tree, whereas Comby
can only recognize syntactic constructs that correspond to a function in Go.
This means there's significant overlap: For example, Comby can plausibly
identify Go functions, as long as the Comby pattern corresponds precisely enough
to the Go grammar syntax for functions. Using Comby for finding Go functions is
in some way analogous to writing your own custom "Go function parser" using
Comby's syntax (and those patterns end up roughly looking like a Go function,
because of the declarative nature of things), whereas in Semgrep this notion is
predefined. In Semgrep, matching a Go function comes down to your pattern being
recognized as something that could match a Go function, and Semgrep looks to
match that predefined construct in a tree, where it is already labeled as a Go
function, after Semgrep has parsed the program.

Underneath the hood, Comby uses no tree definition, but turns patterns into an
executable routine (a language-aware parser) where the tree structure is
implicit in this executable routine. In theory, the syntax matched by this
routine could dump a serialized parse tree, but this isn't implemented :-). With
this design, Comby sacrifices this ability to recognize many predefined language
constructs in order to support a more freeform pattern writing and matching
process. This loses precision for deeply recognizing all of a program's
structures, and may fall short of your needs depending on your use case.

**What works well in Semgrep but not Comby.** In many cases, Semgrep's dedicated
parsers can better recognize language constructs for your use case that could be
awkward to match or write with Comby. For example, there's no builtin way to
match indentation-sensitive Python blocks with Comby at this time, but Semgrep's
parser will parse and label those precisely in a tree.

**What works well in Comby but not Semgrep.** Semgrep's parsers may be overly
strict about the program constructs they recognize, which can make it
restrictive when trying to match partial fragments of syntactic expressions. For
example, at the time of writing, the pattern `switch {$X}` or `if len($X) == 0`
are not valid Go patterns in Semgrep [[1](https://semgrep.dev/s/0gYw),
[2](https://semgrep.dev/s/D8RG)] (likely because these patterns don't correspond
to a recognized Go construct in entirety). You'd need to complete a pattern to
something that is recognizable, like `if len($X) == 0 {$Y}`, which does match
[[1](https://semgrep.dev/s/WeyE)]. Comby doesn't have such restrictions and the
analogous Comby patterns `switch {:[X]}` or `if len(:[X]) == 0` work as expected
[[1](https://bit.ly/3jJThHl), [2](https://bit.ly/35L4ZfK)].

**Performance.** There's no dedicated benchmark comparing Comby and Semgrep in
the overlap of their functionality, which would take a lot of effort to answer
definitively. There are enough non-overlapping features (i.e., expressive
differences) in these tools that the right choice for your use case probably
comes down to your expressive needs rather than speed. As an admittedly crude
measure, and without making any general claims, the runtime for a simple
pattern on a large Go file appear comparable:

| Version      | Pattern    | Time  | Full command                                                  |
|--------------|------------|-------|---------------------------------------------------------------|
| Comby 0.18.4 | `len(...)` | 187ms | `time comby 'len(...)' '' parser.go -match-only &> /dev/null` |
| Semgrep 0.29 | `len(...)` | 490ms | `time semgrep -e 'len(...)' --lang=go parser.go &> /dev/null` |

<!-- There's also: -->
<!-- time semgrep -e 'return &ast.$X{...}' --lang=go parser.go -->
<!-- vs -->
<!-- comby 'return &ast.:[X]{...}' '' parser.go -matcher .go -match-only  -stats &> /dev/null -->
<!-- but comby finds 6 more matches than semgrep because semgrep expects a match to conform strictly to -->
<!-- return $X, not return $X, nil or return $X, error. Here are the missing matches: -->
<!-- parser.go:937:return &ast.FuncType{Func: pos, Params: params, Results: results} -->
<!-- parser.go:1727:return &ast.BadStmt{From: x[0].Pos(), To: colon + 1} -->
<!-- parser.go:1734:return &ast.SendStmt{Chan: x[0], Arrow: arrow, Value: y} -->
<!-- parser.go:1744:return &ast.ExprStmt{X: x[0]} -->
<!-- parser.go:2512:return &ast.BadDecl{From: pos, To: p.pos} -->
<!-- parser.go:2581:return &ast.File -->
<!-- Let's not get into that for the sake of the reader. -->

Time is the average of 10 consecutive command
invocations, run on Macbook Pro 13-inch 2.3 GHz Intel Core i5, 8 GB RAM.
Both tools find 18 matches in a 2,591 line [parser.go](https://sourcegraph.com/github.com/golang/go@5a267c840ae16c1cc7352caa14da5f500d03d338/-/blob/src/go/parser/parser.go) file from the Go compiler.

### Coccinelle
Coccinelle uses a declarative syntax for matching constructs like function
calls, if-statements, expression blocks, and so on for the C language. Some
notable differences are that Coccinelle provides a patch-like format to express
transformations (handy when you want to inline smaller changes in a broader
context) and metavariable declarations (handy for developing and organizing more
sophisticated patterns). For an example, see the file
[null_ref.cocci](https://coccinelle.gitlabpages.inria.fr/website/rules/mini_null_ref2.html).
Coccinelle works only for the C language, and may struggle to parse files that
contain non-standard C constructs, like GCC inline assembly. Recent Coccinelle
work has started expanding support for Java. In contrast, Comby's syntax targets
a wide range of languages and is more robust to matching patterns in the
presence of unrecognized constructs. Comby is more suited to writing quick
find-replace patterns for languages beyond C, and works well on C languages too.
