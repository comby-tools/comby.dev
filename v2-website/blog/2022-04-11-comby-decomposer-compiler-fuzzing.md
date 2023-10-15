---
id: comby-decomposer-compiler-fuzzer
title: Deconstructing programs for compiler fuzzing
author: Rijnard
authorURL: "https://twitter.com/rvtond"
authorImageURL: "https://pbs.twimg.com/profile_images/1668091943950364675/ok0uhR3s_400x400.jpg"
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

> I don't want to write a grammar specification for fuzzing compilers. <br><br> I want a shot at crashing the Rust compiler within 24 hours of fuzzing. <br><br> I happen to have test programs for the compiler. Let's just get fuzzing already.


Fuzzing is the process of generating varied inputs to feed into a program,
where the objective is to discover inputs that crash the program.  These
crash-inducing inputs often reveal subtle bugs.  Fuzzing _compilers_ adds an
interesting twist because they expect rather structured inputs (like valid Rust
source code) that encode a lot of logical complexity for compilers to reason
about (think computational constructs like control flow, recursion, and type
checking). 

This post is about creatively using source code in compiler tests to exercise
interesting compiler behavior quickly (and hopefully crash the compiler sooner
than you would otherwise!). The big idea is to
first deconstruct example source programs, then do some criss-cross applesauce
that recombines program fragments to generate new inputs. 
In essence: use
concrete programs to create a combinatorial space of potentially valid and
unique programs that fuzzing can generate and explore over time. 


![](../../../../img/compiler-decompose-fuzz.svg)


There's a [related paper I co-authored <b>↗</b>](https://agroce.github.io/cc22.pdf) with
data that shows that yes, these techniques can likely surface bugs sooner. In
this post I focus on the part of that work that I personally found most
interesting.  


A bit of background on fuzzing compilers. We know compilers expect programs
that conform to a language grammar. Exploiting knowledge of a language grammar
is a well-known way to try and exercise interesting parts of a compiler [[1](https://www.fuzzingbook.org/html/Grammars.html)]. The
basic idea there is that you can use a grammar to _generate_ various programs
that might end up causing the compiler to run into some corner case and crash
(yay!). Using a grammar means you're more likely to generate valid programs.
This matters because your favorite fuzzer (like
[AFL++](https://github.com/AFLplusplus/AFLplusplus)) might otherwise end up
spending a lot of time in shallow, less interesting parts of a compiler (think
parse errors and error handling for obviously invalid programs) before
discovering paths that lead to deeper compiler logic (say code generation and
optimization). But it can be a lot of effort to write a grammar specification,
or turn it into an input generator. Just generally annoying.  Can we sidestep
getting into all that?

Another way to approach this is to say "Well, I know fuzzing compilers means
trying structured inputs that conform to the underlying grammar. I happen to
have programs from the compiler's test suite. Let's get fuzzing already." And
yes, that's a grand way to start off: grab the already-valid programs,
optionally have the fuzzer trim the corpus based on some feedback from
instrumentation, and off you go. And now we get to the part where I
tell you "Hey hang on, before you run off, we can get a bit more creative with
those tests. It's cheap and pretty easy to get started, and you might just find bugs that much quicker.
Have you heard of [comby-decomposer](https://github.com/comby-tools/comby-decomposer)?"

## Deconstructing programs with [comby-decomposer](https://github.com/comby-tools/comby-decomposer)

Existing programs in a compiler's test suite typically hand-crafted by expert
compiler writers to test phases like parsing, type checking, optimization, and
code generation. These tests are extremely valuable for exercising broad
functionality of a compiler, and it only makes sense to include them in the
fuzzing corpus if we're going to hunt for corner cases. Tuning the initial
corpus can reasonably stop here, and it's fairly "safe" to just rely on
feedback-driven fuzzers to synthesize valid, interesting, and 
[structured input over time. <b>↗</b>](https://lcamtuf.blogspot.com/2014/11/pulling-jpegs-out-of-thin-air.html)
But we have an opportunity to be a bit smarter when it comes to compiler
fuzzing.  

Let's not _only_ start off with just the initial programs, but also use
those initial programs to create new, unique combinations of likely-valid and
never-before-seen programs. This is what I created
[comby-decomposer](https://github.com/comby-tools/comby-decomposer) for,
a tool that chops up program source code in basically any way you'd like.
Let's look at an example using this test program inspired by the [Solidity contract language](https://sourcegraph.com/github.com/ethereum/solidity/-/blob/test/libsolidity/syntaxTests/nameAndTypeResolution/002_undeclared_name.sol).


```
function f(uint256 arg) public {
  g(notfound);
}
```

One interesting way to chop this up is to recognize that valid and varied expressions
exist between balanced delimiters like `(...)` or blocks delineated by
`{...}`. We don't need to know all the details of the Solidity grammar. Just by
eyeballing the concrete test program, we can intuit that there are interesting
terms or expressions inside general syntax like parentheses and
braces.

`comby-decomposer` takes a [comby pattern](https://comby.dev/docs/syntax-reference) like `(:[1])`
and will then split up the input program into two sets with respect to this pattern. First a
set of templates, which is just the original program templatized with respect
to the holes input pattern (you can think of this as _un_-substituting matches).
Second, the set of fragments matching holes in the input pattern. We can use
any `comby` pattern. In this example, let's use the
input patterns `(:[1])` and `{:[1]}`. Here's the diagram of terms matched
between the delimiters, and the two output sets generated (templates left,
fragments right).

![](../../../../img/program-deconstruct.svg)

This output gives a lot of freedom for building new programs: any of these
fragments may be substituted into any of the templates (and there's a server
included in
[comby-decomposer](https://github.com/comby-tools/comby-decomposer#on-demand-input-generation)
to generate these inputs randomly and on-demand).  The combinations for this
simple program aren't very interesting or necessarily valid.  This simple
example also shows just one hole created in templates, but `comby-decomposer` will
create templates with multiple holes too, or holes for nested terms.  The point
is to apply this idea to an entire test suite, yielding a combinatorial space
of potentially unique and valid programs to explore over time. 

## Fuzz results: what difference does [comby-decomposer](https://github.com/comby-tools/comby-decomposer) make?



`comby-decomposer` supplements the 
hybrid fuzzing approach explained in [the paper I mentioned before](https://agroce.github.io/cc22.pdf) to generate more varied inputs earlier during fuzzing.
The main takeaway for
`comby-decomposer` is that using the tool with hybrid strategies
generally found more bugs within a 24-hour window than approaches without it
(we ran 210 days worth of fuzzing to create a controlled experiment and we say
"more bugs" by counting unique bugs according to ground truth developer fixes,
not fuzzer bucketing which is inaccurate). In the extreme, 
using `comby-decomposer` found on average 7 bugs in the Zig compiler whereas all
other approaches found less than 3 on average. Many of the unique findings are interesting, in the
sense that they trigger [crashes in code analysis and generation <b>↗</b>](https://docs.google.com/spreadsheets/d/1k79eqGpYgXAcwtDbHoIhUjezmlviZrV9M9ueL_JJJ5A/edit#gid=0). 
Some crashing programs found exclusively by `comby-decomposer` are quite large, even after running [comby-reducer](../../../../blog/2021/03/26/comby-reducer). These likely trigger
more complex reasoning in the compiler:

```zig
var frame: ?anyframe = null;
        export fn a() void {
            _ = async rangeSum(10);
        }
        fn rangeSum(x: i32) i32 {
            suspend {
while(1==1)
                frame = @frame();
            }
            if (x == 0) return 0;
            var child = rangeSumIndirect;
            return child + 1;
        }
        fn rangeSumIndirect(x: i32) i32 {
            if (x == 0) return 0;
            var child = rangeSum;
            return child + 1;
        }
```

### Let's crash the Rust compiler?

Anecdotally, I took `comby-decomposer` for a spin on the latest Rust compiler
while writing this post.  It found one crashing input in just 20 hours, here's
the reduced version:


```rust
extern "" {
async fn partial_init() -> u32 {
async fn hello_world() {}
}
}
```

Unfortunately (for me) this bug was already found and [reported](https://github.com/rust-lang/rust/issues/95829) by
[fuzz-rustc](https://github.com/dwrensha/fuzz-rustc) just a couple of days
prior.  But I take solace knowing that there's a sporting chance to find
crashing inputs for the Rust compiler in less than 24 hours. For this fuzzing
campaign I ran on just a single core and decomposed only more recent regression
tests (around 200 odd tests).
This because recent regressions are more juicy for testing, in case a
fix may be incomplete. The 200 tests yielded around 1,600 templates and 1,300
fragments. 

### Running it yourself

👉To do program decomposition, check out the main
[comby-decomposer](https://github.com/comby-tools/comby-decomposer) project.

👉For fuzzing, check out this modified [AFL fuzzer for
compilers](https://github.com/agroce/afl-compiler-fuzzer#01-usage) that
works with the `comby-decomposer` server to request new inputs on-demand. 

👉Have other grand ideas to fuzz compilers and wondering if this could be useful? Post in the [issue tracker](https://github.com/comby-tools/comby-decomposer/issues/new) or [DM @rvtond](https://twitter.com/rvtond).

## When to choose [comby-decomposer](https://github.com/comby-tools/comby-decomposer)

There are two fundamentally practical ideas that make `comby-decomposer` one of the best tools for breaking up programs today:

- <b>You can generate well-formed templates and fragments for practically [any language](../docs/overview#does-it-work-on-my-language)</b> because it builds on `comby` to parse the program. It even decomposes nested syntax (a practically impossible task for regex-based engines). Want templates and fragments for Kotlin? Just find some Kotlin programs and tell `comby-decomposer` they're Kotlin files.

- <b>You can decompose programs with respect to _any_ pattern that `comby` recognizes.</b> You don't have to decompose with respect to a pattern like `(:[1])` in the example. Maybe you're fuzzing a domain where you only want to decompose with respect to numbers. So, you could just specify a regular expression pattern like `[0-9]`. Since `comby` supports regular expression matching too, you'd just specify this in `comby` with  `[~[0-9]+]` [see the docs for more <b>↗</b>](https://github.com/comby-tools/comby-decomposer#customizing-decomposition).

[comby-decomposer](https://github.com/comby-tools/comby-decomposer) was developed in part to make it extremely easy to generate
inputs and fuzz compilers for domain-specific applications
([Solidity](https://docs.soliditylang.org/en/v0.8.13/) and
[Move](https://move-book.com/) for smart contracts) and up-and-coming languages
like [Zig](https://ziglang.org/).  Other tools exist to generate programs for
testing and fuzzing ([CSmith](https://github.com/csmith-project/csmith)
anyone?) and maybe they're more suitable or mature for your language. But none
are as dead simple and broadly language general to the degree that `comby`
makes possible. So that's why `comby-decomposer` exists now. 
