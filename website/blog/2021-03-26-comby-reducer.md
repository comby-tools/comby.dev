---
id: comby-reducer
title: A simple program reducer for any language
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

I've been fuzzing compilers for less familiar languages like Solidity and Diem (for smart contracts), and up-and-coming languages like Zig. [More on that fuzzing effort here](https://blog.trailofbits.com/2021/03/23/a-year-in-the-life-of-a-compiler-fuzzing-campaign/).
A fun part of that is looking at programs that crash the compilers. Reducing
those programs to submit in bug reports... less so. Thing is, I want to submit programs that are small and comprehensible for maintainers, and doing things by hand got tedious after about 5 reports. There _are_ tools for reducing programs out there, but none really checked the boxes I wanted. So I wrote [`comby-reducer`](https://github.com/comby-tools/comby-reducer#readme) to check those boxes, and things became a lot more fun:

<input type="checkbox" checked> Works on basically any language syntax or structured format (including e.g., DSLs)
<br>
<input type="checkbox" checked> Syntax-aware (not just regex), but without strictly requiring grammar definitions
<br>
<input type="checkbox" checked> Easy to define and include/exclude transformations (declarative, no scripting)
<br>
<input type="checkbox" checked> Easy to see what it did (so I can tweak transformations)
<br>
<input type="checkbox" checked> Easy to install and invoke

Basically, something dead simple that allows easy tweaking for transforming syntax.

## How it works

`comby-reducer` is built using [`comby`](https://github.com/comby-tools/comby),
which supports a lightweight way of rewriting syntactic structures of a
program's parse tree, like expressions and function blocks. Comby is
language-aware and understands basic syntax of code, strings, and comment syntax
for many languages. Absent language-specific parsers, `comby` uses a generic
parser that works well for syntactic constructs in DSLs and less mainstream
languages. You can [learn more about comby here](https://comby.dev/docs/overview).

`comby-reducer` uses a JavaScript library transpiled from `comby`'s core parser
engine, and a couple of functions for transforming a program to a fixed point.

Let's move on to examples. If you want, you can learn more about how program
reducers work by checking out the [resources at the end of this post](#learn-more).

## A program reduction tour

I found this program crashed the [`Move` compiler](https://github.com/diem/diem/tree/main/language/move-lang).

```rust
module M {
    resource struct R {}
    struct Cup<T> {}

    fun t0(x8: u8, x64: u64, x128: u128) {
continue;
        (false as u8);
        (true as u128);

        (() as u64);
        (1,1
);

        (0 as bool);
        (0 as address);
        R = (0 as R);
        (0 as Cup<u8>);
        (0 as ());
        (0 as (u64, u8));

        (x"1234" as u64);
    }
}
```

`comby-reducer` reduces the program to something I'd be happy to submit in a bug report:

```rust
module M {
    resource struct R {}
    fun t0() {
        R = ();
    }
}
```

Move as a similar syntax to Rust, and like many languages, uses parentheses `()`
and braces `{}` to delineate and nest expressions that correspond to an
underlying parse tree. `comby-reducer` understands these syntactic constructs
well, and can transform content inside balanced parentheses and braces (but won't
get confused if special characters like `(` happen inside strings or comments).

This program crashes the [Zig](https://ziglang.org/) compiler:

```zig
const BitField = packed struct {
            a: u3,
            b: u3,
            c: u2,
        };

        fn foo(error.Hi
) u3 {
            return bar(&bit_field.b);
        }

        fn bar(x: *const u3) u3 {
            return x.*;
        }

        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
```

and reduces to another happy candidate for a bug report:

```zig
        fn foo(error.Hi) u3 {}
        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
```

And here's an reduced Solidity contract:

<details>
  <summary><strong>Expand to see original program</strong></summary>


```solidity
pragma experimental ABIEncoderV2;
contract C {
    function f(uint256[] calldata x, uint256 s, uint256 e) external returns (uint256) {
        (x[s:e]).length;
    }
    function f(uint256[] calldata x, uint256 s, uint256 e, uint256 ss, uint256 ee) external returns (uint256) {
        return uint256[](x[s:e][ss:ee]).length;
    }
    function f_s_only(uint256[] calldata x, uint256 s) external returns (uint256) {
        return uint256[](x[s:]).length;
    }
    function f_e_only(uint256[] calldata x, uint256 e) external returns (uint256) {
        return uint256[](x[:e]).length;
    }
    function g(uint256[] calldata x, uint256 s, uint256 e, uint256 idx) external returns (uint256) {
 111111111111111111256[](x[s:e])[idx];
    }
    function gg(uint256[] calldata x, uint256 s, uint256 e, uint256 idx) external returns (uint256) {
        return x[s:e][idx];
    }
    function gg_s_only(uint256[] calldata x, uint256 s, uint256 idx) external returns (uint256) {
        return x[s:][idx];
    }
    function gg_e_only(uint256[] calldata x, uint256 e, uint256 idx) external returns (uint256) {
        return x[:e][idx];
    }
}
```

</details>

```solidity
contract C {
    function f(uint256[] calldata x, uint256 s, uint256 e) external returns (uint256) {
        (x[s:e]).length;
    }
}
```

## Declaring transformations

`comby-reducer` uses a handful of around 22 transformations to produce the above.
These are [in the repo](https://github.com/comby-tools/comby-reducer/blob/master/transforms/config.toml),
but you can also see a sample of them by expanding the below tab to get a sense of things. Transformations are
defined using [comby syntax](https://comby.dev/docs/syntax-reference), and we'll walk through some of them.

<details>
  <summary><strong>Some simple reduction transformations</strong></summary>

```toml
[delete_paren_content]
match='(:[1])'
rewrite='()'
rule='where nested'

[delete_brace_content]
match='{:[1]}'
rewrite='{}'
rule='where nested'

# Helps put blank bodies across newlines on the same line for line deletion.
[blank_brace]
match='{ }'
rewrite='{}'

[delete_line]
match=':[x\n]'
rewrite=''

[delete_string_content]
match='":[x]"'
rewrite='""'

[remove_first_paren_element]
match='(:[1],:[2])'
rewrite='(:[2])'
```

</details>

```toml
[delete_paren_contents]
match='(:[1])'
rewrite='()'
rule='where nested'
```

This transform matches any content between balanced parentheses (including
newlines) and deletes the content. The `:[1]` is a variable that can be used in
the rewrite part. By default, `comby-reducer` will try to apply this
transformation at the top-level of a file, wherever it sees `(...)`. The
`rule='where nested'` tells comby-reducer that it should also attempt to reduce
nested matches of `(...)` inside other matched `(...)`. In general, parentheses
are a common syntax to nest expressions in programs, so it makes sense to add
`rule='where nested'`.

Another one is

```
[remove_first_paren_element]
match='(:[1],:[2])'
rewrite='(:[2])'
```

Program syntax often use call or function-like syntax that comma-separate
parameters or arguments inside parenthes. This transformation attempts to remove
elements in such syntax. This transform doesn't have a rule part, since it might
not be as fruitful to attempt nested reductions inside of `:[1]` or `:[2]`. But,
we could easily add it.

## Observing and replaying reduction

While running `comby-reducer`, I noticed that programs would often reduce to structures like:

```solidity
function foo() {
}
```

After some sequence of transformations, a block might end up empty, but contain whitespace. To crunch these, I added the transformation

```toml
[blank_brace]
match='{ }'
rewrite='{}'
```

This transformation simply deletes contiguous whitespace (including newlines).
In turn, this often lead to a reduction to, say, `func () {}` which then ends up
being removed by a transformation that deletes lines. Nice!

Given I had an easy way to introduce new transformations like these, I wanted
more observability into how transformations behaved. This helped me understand
what I could add to help reduction along, or even just discover transformations
that would improve formatting.

For example, I noticed one Zig program reduced to:

```zig
        fn foo(error.Hi
) u3 {}
        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
```

I just wanted to group the first pair of parentheses pair on one line like `fn
foo(error.Hi) u3 {}`. So I just added something that would match all content up
to trailing whitespace within balanced parentheses:

```toml
[delete_trailing_paren_whitespace]
match='(:[1] )'
rewrite='(:[1])'
```

To make this process a bit more snazzy, I added a way to replay transformations.
`comby-reducer` takes a `--record` argument, and the output can be replayed with
`comby-reduce-replay`, which makes it possible to step through the process.
Here's an example where I manually step through the Zig reduction.

<video style="width:100%;margin-top:0.5em;border-radius:5px" autoPlay controls>
  <source src="/img/zig-reduce-simple.mp4" type="video/mp4">
  Your browser does not support the video tag. Have a look at the screenshot examples below.
</video>



<details>
  <summary><strong>Expand to see HTML rendering of transformation steps</strong></summary>

<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">000.step 2021-03-26 04:50:53.499923-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">001.step 2021-03-26 04:50:54.572018-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,16 +1,16</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>const BitField = packed struct {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            a: u3,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            b: u3,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            c: u2,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        };
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>            return bar(<span style="color:#880000">&amp;bit_field.b</span>);
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn bar(x: *const u3) u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return x.*;
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">001.step 2021-03-26 04:50:54.572018-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">002.step 2021-03-26 04:50:55.616110-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,16 +1,16</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>const BitField = packed struct {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            a: u3,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            b: u3,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            c: u2,
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        };
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return bar();
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        fn bar(<span style="color:#880000">x: *const u3</span>) u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return x.*;
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">002.step 2021-03-26 04:50:55.616110-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">003.step 2021-03-26 04:50:57.132244-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,16 +1,12</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>const BitField = packed struct {
<span style="color:#000000"><span style="background-color:#888800">!|</span></span><span style="color:#880000">            a: u3,</span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span><span style="color:#880000">            b: u3,</span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span><span style="color:#880000">            c: u2,</span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        };
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return bar();
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn bar() u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return x.*;
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">003.step 2021-03-26 04:50:57.132244-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">004.step 2021-03-26 04:50:57.748298-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,12 +1,10</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>const BitField = packed struct {};
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        fn foo(error.Hi) u3 {
<span style="color:#000000"><span style="background-color:#888800">!|</span></span><span style="color:#880000">            return bar();</span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn bar() u3 {
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>            return x.*;
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">004.step 2021-03-26 04:50:57.748298-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">005.step 2021-03-26 04:50:58.356352-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,10 +1,8</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>const BitField = packed struct {};
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {}
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        fn bar() u3 {
<span style="color:#000000"><span style="background-color:#888800">!|</span></span><span style="color:#880000">            return x.*;</span>
<span style="color:#000000"><span style="background-color:#888800">!|</span></span>        }
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">005.step 2021-03-26 04:50:58.356352-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">006.step 2021-03-26 04:50:59.464450-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,8 +1,6</span> ============================================================
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>const BitField = packed struct {};
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {}
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#880000">-|</span></span><span style="color:#880000">        fn bar() u3 {}</span>
<span style="color:#000000"><span style="background-color:#880000">-|</span></span><span style="color:#880000">        </span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>
<pre style="font-family:consolas,monospace">
<span style="color:#880000">------ </span><span style="font-weight:bold">007.step 2021-03-26 04:51:01.000586-04:00</span>
<span style="color:#008800">++++++ </span><span style="font-weight:bold">008.step 2021-03-26 04:51:01.596638-04:00</span>
<span style="color:#000000"><span style="background-color:#c0c0c0">@|</span></span><span style="font-weight:bold">-1,5 +1,4</span> ============================================================
<span style="color:#000000"><span style="background-color:#880000">-|</span></span><span style="color:#880000">const BitField = packed struct {};</span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        fn foo(error.Hi) u3 {}
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>
<span style="color:#000000"><span style="background-color:#c0c0c0"> |</span></span>        export fn entry() usize { return @sizeOf(@TypeOf(foo)); }
</pre>

</details>

You can [find out more about replaying in the repo](https://github.com/comby-tools/comby-reducer#comby-reducer-replay).


## Comparison to afl-tmin

It's useful to compare some reduction to `afl-tmin`, which was a
readily-available reducer for our afl-instrumented Solidity and Move compilers.
Because `afl-tmin` exploits coverage information, it can be very effective at
minimizing the size of inputs irrespective of format (e.g., it works for text
inputs like our crashing programs, and binary formats like JPEG). At the same
time, the catch-all coverage-guided approach in `afl-tmin` doesn't exploit
properties of the input domain. E.g., in our case, we want to reduce around
parentheses, or preserve syntactic elements or formatting, and can tailor
transformations around that.

For example, the reduced Move program by `comby-reducer` gives

```rust
module M {
    resource struct R {}
    fun t0() {
        R = ();
    }
}
```

while `afl-tmin` gives


```rust
module M{resource struct R{}struct C{}fun t(x:u){();();();R=();()}}
```

The `afl-tmin` variety has some redundant syntax, eagerly deletes whitespace
that help with readability, and renames the original function `t0` to `t`. These
are not all horrible things, but there isn't much room for tweaking.

Another example produced by `comby-reduce`



```rust
module M {
    struct Box3<T1, T2, T3> {}
    fun cpy<C: copyable>() {}
    fun t3<U, C: copyable>() {
        cpy(Box3<U, U> {});
    }
}
```

versus `afl-tmin`:

```rust
module M{struct S{}resource struct C{}struct o{}struct Bo00<>{}fun h(r:R){}fun y(r:R){}fun t(){}fun t<>(){}fun t(){();(Bo00<U>{})}}
```

<details>
  <summary><strong>Original program for the above reductions</strong></summary>

  ```rust
module M {
    struct S {}
    resource struct Coin {}
    struct Box<T> {}
    struct Box3<T1, T2, T3> {}

    fun both<R: resource, C: copyable>(r: R, c: C) {
        abort 0
    }

    fun cpy<C: copyable>(c: C) {
        abort 0
    }

    fun rsrc<R: resource>(r: R) {
        abort 0
    }


    fun t0() {
        both(S{}, Coin{});
        both(0, Coin{})
    }

    fun t1<R: resource, C: copyable>() {
        both(Box<C> {}, Box<R> {})
    }

    fun t2<R: resource, C: copyable>() {
        rsrc(Box3<C, C, C> {});

        cpy(Box3<R, C, C> {});
        cpy(Box3<C, R, C> {});
        cpy(Box3<C, C, R> {});

        cpy(Box3<C, R, R> {});
        cpy(Box3<R, C, R> {});
        cpy(Box3<R, R, C> {});

        cpy(Box3<R, R, R> {});
    }

    fun t3<U, C: copyable>() {
        cpy(Box3<U, C, C> {});
        cpy(Box3<C, U, C> {});
        cpy(Box3<C, C, U> {});

        cpy(Box3<C, U, U> {});
        cpy( C,Box3<U, U> {});
        cpy(Box3<U, U, C> {});

        cpy(Box3<U, U, U> {});
    }
}
  ```

</details>

## Try it

See the [GitHub repository](https://github.com/comby-tools/comby-reducer) for
usage examples and more technical details. Note that `comby-reducer` is new,
developed with simplicity, and not yet very battle tested; feel free to post
issues in the GitHub issue tracker. If you want help with comby syntax, post in
the [Gitter channel](https://gitter.im/comby-tools/community).

## Learn more

There are a lot of reducer tools and techniques out there. The academic in me
would love to explore and compare these more deeply, but the engineer in me
doesn't have the time. 🙂

So instead, here are some related tools and topics that you might want to
explore further.

- The [Reducing chapter](https://www.fuzzingbook.org/html/Reducer.html) in The
Fuzzing Book provides a deeper explanation of reducers, and particularly [grammar-based reduction](https://www.fuzzingbook.org/html/Reducer.html#Grammar-Based-Input-Reduction). In this sense, `comby-reducer` can be seen as a coarse, syntax-only
grammar-based reducer that doesn't need you to write or understand the grammar,
nor write any scripts or visitors to hook into a parse tree. Instead,
transformations are specified declaratively and appeal to intuitive notions
around syntax common to many languages.

- This deep-dive [article on test-case reduction](https://blog.trailofbits.com/2019/11/11/test-case-reduction/)
including various references to existing tools.

- A favorite mentioned here is [C-reduce](https://github.com/csmith-project/creduce)
(which also works well on non-C languages). It is an especially nice resource
for explaining [interestingness tests](https://embed.cs.utah.edu/creduce/using/)
which can further guide how and when the input is transformed.
