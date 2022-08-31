---
id: comby-with-types
title: Find and replace with types
author: Rijnard
authorURL: https://twitter.com/rvtond
authorImageURL: https://pbs.twimg.com/profile_images/1453928889013596163/PHv3cB1g_400x400.jpg 
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
#   text-align: center;
    background: white;
    border: 2px solid rgba(1, 1, 1, .1);
    border-radius: 10px;
    border-top: 0px;
    border-bottom: 0px;
#    border-right: 0px;
#    border-left: 0px;
}

ul {
	list-style-type: none;
}
li {
  list-style-type: none;
}
</style>

> Eventually the realization will hit that you're just trying to approximate what a compiler
usually does, but with a regex pattern [...] and all you really wanted was type information.

One of the earliest code changes I made with `comby` removed redundant code in
the Go compiler. After proposing changes, I soon came to the sad realization
that some of them turned out to be just plain wrong.<sup>[1](#footnotes)</sup> What I missed is that a
value's **type** could affect whether the code was really redundant or not.

The mechanical, syntactic change removes a redundant `nil` check and goes like this:

**Before**
```go
if x != nil {
  for ... := range x {
    ...
  }
}
```

**After**
```go
for ... := range x {
  ...
}
```

The tricky bit is that this change is only valid if `x` is a slice or map, and
not if `x` is a pointer or channel.<sup>[2](#footnotes)</sup> If we only have the syntax to go on, there
really is no way of knowing whether the change is valid. Ever since then I've
wanted a way to pull type information into `comby`. 

Now there's now an experimental way to query type information with
`comby` that solves this kind of issue. The main idea is to write [a rule](../../../../docs/advanced-usage#rules) that pattern matches against
type information in hover tool tips (i.e., type-on-hover data).

```bash
where match :[x].lsif.hover {
  | ... map... -> true
  | ... []... -> true
  | _ -> false
}
```

This kind of rule gives enough flexibility to avoid false positives, filtering
and changing only code where type-on-hover suggests we have a slice (like
`[]string` syntax in Go) or map (like `map[string]string)` on our hands.

A few of things need to fall in place for this to work, and only a couple of
open source projects and languages are supported right now. This is an early
interface implemented to generically support future expansions. Read on to learn what's
possible at the frontier of simpler find and replace _with types_.

## Extending `comby` with type information

When I think about adding type information to `comby`, I want to keep things
simple and easy. Anything too heavyweight isn't a good fit, because
language-specific tools exist for automating complex changes to the nth degree
(`clang` for C) and I don't have time to integrate or maintain such toolchains directly
in `comby`. To that end, I really just want `comby` to use an external service
that answers: _What is the type of the value at this location in the file?_

Type-information-as-a-service is ideal because then I can keep the convenience
of matching syntax easily, and outsource accessing language-specific semantic
properties as needed. The _concept_ is to expose a
[property](../../../../docs/rewrite-properties) on any matched variable that corresponds to type
information, and would look something like this:

```
func parse(:[args]) where :[args].type == string
```

In `comby` the value of `:[args].type` would just be a plain string, so it's a
bit _too_ simplistic to call this an actual "type". In reality types are
represented by expressions, and the validity of a type depends on a type
environment. These type system properties are welcome information, and perhaps
one day `comby` will expose a precise `.type` notion. For now it's not strictly
needed, and we can make progress on the "find-replace-with-types" problem in
the Go example (and many others) by just representing type information as a
string. You can [skip ahead to what this ends up looking like in `comby` today](#using-comby-with-types-today) 
but it might make more sense if I tell you where I'm pulling the type information from first.


## Where can I find type information as a service?

I know of only two high-level solutions resembling a service that conveniently provide
type information today, and which aim to eventually support all languages. The
first is language server implementations of LSP (Language Server Protocol).
Language servers expose all kinds of information, and typically include type
information in [hover tooltips](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
found in editors. With LSP there is no authoritative, centralized language server that you can
just query.  Instead, language servers are configured for specific
projects and either run locally on your machine or get managed by an
organization. 

The second is a central, public-facing service maintained on [Sourcegraph.com](https://docs.sourcegraph.com/code_navigation/explanations/precise_code_navigation) that
exposes hover information similar to the LSP format (disclaimer: I work at
Sourcegraph, but my day job is unrelated to this service). The key difference
is that Sourcegraph preprocesses this information over OSS repositories on
GitHub (currently [about 45K](https://about.sourcegraph.com/blog/announcing-scip#challenges-of-scaling-up-lsif))
for a couple of supported languages (TypeScript, Go, Java, Scala Kotlin). When projects are processed, you can see type information
for the variable on hover.

<img src="/img/hover.png" alt="Hover information in Sourcegraph">
<!-- https://sourcegraph.com/github.com/sourcegraph/sourcegraph@d5948e24b6f709b9fdbf8e8f55d42b3e460e2f8d/-/blob/enterprise/cmd/frontend/internal/codeintel/resolvers/graphql/util.go?L123&subtree=true -->

This is exactly the kind of information I need to tell whether a matched
variable is a slice, map, channel, or pointer. For supported projects, you just
fire a [GQL request](https://sourcegraph.com/api/console#%7B%22query%22%3A%22query%20Hover(%24repository%3A%20String!%2C%20%24commit%3A%20String!%2C%20%24path%3A%20String!%2C%20%24line%3A%20Int!%2C%20%24character%3A%20Int!)%20%7B%5Cn%20%20repository(name%3A%20%24repository)%20%7B%5Cn%20%20%20%20commit(rev%3A%20%24commit)%20%7B%5Cn%20%20%20%20%20%20blob(path%3A%20%24path)%20%7B%5Cn%20%20%20%20%20%20%20%20lsif%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20hover(line%3A%20%24line%2C%20character%3A%20%24character)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20markdown%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20range%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20start%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20character%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20end%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20line%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20character%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%2C%22operationName%22%3A%22Hover%22%2C%22variables%22%3A%22%7B%5Cn%20%20%5C%22repository%5C%22%3A%20%5C%22github.com%2Fsourcegraph%2Fsourcegraph%5C%22%2C%5Cn%20%20%5C%22commit%5C%22%3A%20%5C%22HEAD%5C%22%2C%5Cn%20%20%5C%22path%5C%22%3A%20%5C%22client%2Fshared%2Fsrc%2Fsearch%2Fquery%2Fparser.ts%5C%22%2C%5Cn%20%20%5C%22line%5C%22%3A%2074%2C%5Cn%20%20%5C%22character%5C%22%3A%209%5Cn%7D%22%7D) to get the hover content. 

I went with the second option for two reasons.

**Managing language servers is too difficult.** 
Some years ago I had a
prototype where `comby` starts up language servers and queries them. It was a
pain to manage and configure servers, especially on various open source
projects. Although I succeeded at getting things up and running for about 5
languages and various projects, I didn't like how brittle things were
and discontinued the effort. In principle there's
nothing stopping an ambitious developers to generically integrate `comby` with
LSP (and even restrict it to one language or project). I just don't want to
write or maintain that kind of thing.

**Network requests to central services are easy.** Ultimately I implemented
generic support in `comby` to pull type information from any central service
exposing type information over HTTP (less hassle for me), and the default
service with the best support for that right now is Sourcegraph.com.

## Using `comby` with types today

`comby` exposes type information exposed in code hovers via `:[x].lsif.hover`
syntax. This syntax resolves hover information at the end position of `:[x]` if
`comby` succeeds at retrieving this information from an external service.
Until generic code intellgence services become more definitive, inspecting
hover information is currently the most direct way to access type information
from a central service today. 
The `lsif` part is a reference to [LSIF](https://microsoft.github.io/language-server-protocol/overviews/lsif/overview/),
a schema related to LSP and [SCIP](https://about.sourcegraph.com/blog/announcing-scip#challenges-of-scaling-up-lsif).

**Go example redux, this time without disappointment.** 
Adding [a rule](../../../../docs/advanced-usage#rules) to check type-on-hover information solves the false positive issues from before.

```bash
where match :[x].lsif.hover {
  | ... map... -> true
  | ... []... -> true
  | _ -> false
}
```

I settled on this rule based on the type-on-hover information I saw for
potential matches in popular Go repositories. Here are some I matches and
non-matches I found by using `:[x].lsif.hover` values:

✅ `struct field ExtraHeaders map[string]string` --- we want to match this, it's a `map`!

<img src="/img/hover-rclone.png" alt="Hover information in Sourcegraph for the rclone project">

- This is a file in `github.com/rclone/rclone`. [You can browse it and see the redundant `nil` check for yourself ↗](https://sourcegraph.com/github.com/rclone/rclone@35349657cd2d5708b2b02a8f8810270c4c999abb/-/blob/lib/rest/rest.go?L249-254&subtree=true)

✅ `struct field ImportStateReturn []*InstanceState` --- we want to match this, it's a `[]` slice!
- This is a redundant `nil` check in [`github.com/hashicorp/terraform`](https://sourcegraph.com/github.com/hashicorp/terraform@cb340207d8840f3d2bc5dab100a5813d1ea3122b/-/blob/internal/legacy/terraform/provider_mock.go?L293-294).

❌ `var hashCh chan *blockTxHashes` --- we don't want to match this, its a channel type `chan`!
- This valid `nil` check lives in [`github/ethereum/go-ethereum`](https://sourcegraph.com/github.com/ethereum/go-ethereum@d10c28030944d1c32febba3f45ae8c175ab34063/-/blob/core/rawdb/chain_iterator_test.go?L84-85&subtree=true)

You can use different patterns to achieve the similar things, with deeper or looser
precision. For example, you could also write a pattern that explicitly negates
cases where string contains `chan`.

- `| ...:[~\bchan\b]... -> false`

<details>
  <summary><strong>Expand to see a full comby invocation I ran on the command line for each project</strong></summary>

```bash
COMBY_MATCH="$(cat <<"MATCH"
if :[x] != nil {
  for :[e] := range :[x] {
    :[body]
  }
}
MATCH
)"
COMBY_REWRITE="$(cat <<"REWRITE"
for :[e] := range :[x] {
  :[body]
}
REWRITE
)"
COMBY_RULE="$(cat <<"RULE"
where match :[x].lsif.hover {
  | ... map... -> true
  | ... []... -> true
  | _ -> false
}
RULE
)"
comby "$COMBY_MATCH" "$COMBY_REWRITE" -rule "$COMBY_RULE" .go
```

</details>

This behavior is admittedly an approximation to
get type information. For example, `.lsif.hover` may also contain doc strings
and matching may need to work around it.  But (I assert) it is often good
enough for various type-sensitive changes. You can also use `:[x].lsif.hover`
in the _output_ of a command. 

This will let you inspect the information exposed
by `:[x].lsif.hover`. In fact, that's exactly what I did to decide how to match on type information
for my rule. I just substituted it in a Go comment in the output.

<img src="/img/hover-diff.png" alt="Hover information substituted in output template">

<details>
  <summary><strong>Expand to see sample match and rewrite templates for inspecting hover info</strong></summary>
**Match**
```go
if :[x] != nil {
  for :[e] := range :[x] {
    :[body]
  }
}
```

**Rewrite**

```go
if :[x] != nil {
  /* hover info is: :[x].lsif.hover */
  for :[e] := range :[x] {
    :[body]
  }
}
```
<!-- bit.ly/3e6zt3O -->

</details>

### Which projects and languages does this work for?

If a repository is processed with precise type-on-hover on Sourcegraph.com, accessing that information via
`comby` should just work. This means you can use tools to process and upload
this information with your own
[TypeScript](https://github.com/sourcegraph/scip-typescript), [Java, Scala,
Kotlin](https://github.com/sourcegraph/scip-java), or
[Go](https://github.com/sourcegraph/lsif-go) projects to Sourcegraph and
`comby` will be able to access hover information for them. 

If you happen to work at a company with a running Sourcegraph instance that
indexes any of these languages, you're in luck: setting
`LSIF_SERVER=https://your-instance` when you run `comby` will enable it to get
hover information from your instance.<sup>[3](#footnotes)</sup> These tools encode type
information and other data using
[SCIP](https://about.sourcegraph.com/blog/announcing-scip#challenges-of-scaling-up-lsif),
which is related to the Language Server Index Format
([LSIF/LSP](https://microsoft.github.io/language-server-protocol/overviews/lsif/overview/))
but with efficiency in mind.

See more at the end of the post if you want to try things out.<sup>[4](#footnotes)</sup> 

## When is type information actually useful for find and replace?

I've gotten this question a couple of times from my developer friends, and
often they're able to nod their heads that this is theoretically useful, but
they really want to see concrete examples. The reality is that vast amounts of
changes that simplify expressions, modernize functions, or apply lint-like
fixes require type information. 

The connection might not be obvious because accessing type information is
typically buried deeper in a linter or compiler, after the initial layer of
syntax concerns (parsing), and tightly coupled to the language. So to give a
sense, here are some diverse ways where explicitly pulling in type information
supercharges code search and refactoring.

- **›** We've covered a Go example, which is a code simplification implemented in
[`staticcheck`](https://staticcheck.io). Here are [many more code simplifications with the same flavor](https://staticcheck.io/docs/checks#S1)---the last time I counted, at
least 18 of the 35 checks require type information to ensure correctness.
<!--https://gist.github.com/rvantonder/10b38eb3404d09312961af5a651524e80-->

- **›** In Java, `try-catch-finally` blocks can be replaced with more succinct
[`try-with-resources` blocks](https://www.baeldung.com/java-try-with-resources#overview)
that automatically close resources, like files. The catch? We need to know
whether an object implements the [`AutoCloseable`
interface](https://docs.oracle.com/javase/8/docs/api/java/lang/AutoCloseable.html?is-external=true).
This also is type information we need to correctly refactor.

- **›** Equality operators `==` on generic values can lead to Bad Things™. This is
a well-known pitfall in JavaScript and found in other languges too. See this
post on the ["perils of polymorphic compare"](https://blog.janestreet.com/the-perils-of-polymorphic-compare/) in
OCaml, and type coercion simplications for Erlang in [Section 3.2 of this paper](https://users.ece.cmu.edu/~aavgerin/papers/Erlang09.pdf). In statically
typed languages like OCaml, you can use equality operators for a 
specific type like `Int.equal` or `String.equal` instead. But when you look at an expression like
`x == y`, how do you know if it's safe to replace the expression with something
like `Int.(x == y)` or `String.(x == y)` or something else? That's right, you
need something to tell you the type of `x` or `y`.

- **›** Types make static analysis more precise and help remove false positives in bug
reports. Analyzers like Semgrep and PMD include ways to reference type
information for checks like ["only report a potential SQL injection if the
argument passed is of type string (`int` is safe)"](https://r2c.dev/blog/2020/type-awareness-in-semantic-grep/#why-care-about-types) or ["only report a violation if a loop index type is a `float`"](https://pmd.sourceforge.io/pmd-6.11.0/pmd_rules_java_errorprone.html#dontusefloattypeforloopindices).

- **›** Reducers like [`creduce`](https://github.com/csmith-project/creduce) and [`comby-reducer`](https://comby.dev/blog/2021/03/26/comby-reducer) automatically transform a program in _valid ways_ to produce smaller source code that triggers the same runtime behavior of the original. Reducers can use type information to more precisely guarantee valid programs, or use type information to make the program smaller. For example, `creduce` will remove the `&` operator in C code depending on the expression and its type ([see the complete description here](https://github.com/csmith-project/creduce/blob/6dc5a9d8e4b7e68d969a8c0dff59a7b46f083256/clang_delta/RemoveAddrTaken.cpp#L26-L32)).

In these examples, types can sometimes be inferred by matching on existing
syntax definitions, but things will quickly become intractable as you try to
follow the type propagation in and across functions. Eventually the realization
will hit that you're basically just trying to approximate what a compiler
usually does, but with a regex pattern. Really all you want is for the
information to exist, and a convenient way to look it up.

## A more general view on integrating type information 

**I've long dreamed about an interface that effectively _decouples_ accessing
general semantic properties from patterns that match syntax.** This stems from
the fact that there's virtually no mature tools today where you can access
deep semantic properties _without_ needing to write code or interface with
heavyweight tooling like `clang` (the exception might be IntelliJ structural
search-and-replace). As I've continued developing `comby` I've realized that it
_just makes sense_ to decouple language-general syntax pattern matching and
language-specific semantic properties. It works well to _compose_ syntax
pattern matching and type information for those _lightweight_ code changes or
checks in the examples above. 

**The leading thought is that semantic properties don't need to be restricted to
just type information.** Precise "rename symbol" operations in editors (say, to
rename a function and update its calls) rely on semantic relations over
definitions and references to work. Similar to exposing type information,
`comby` could also expose information and operations on "all references for the
syntax matched at this point" or resolve "definitions for this matched syntax".
Because `comby` is a more general syntactic rewriter than editor
find-and-replace prompts, these semantic properties could unlock easier ways to
do things like instrument code (e.g., add a debug statement after every
reference) or selectively emit information to build domain-specific semantic
language models.

The idea of exposing semantic information alongside syntactic changes is not
new. The closest and most cogent discussion on this topic I've found coins an
apt term: _semantic selectors_. Unfortunately the paper is paywalled, but
here's an excerpt:

> Program manipulation systems provide access to static semantic information through _semantic selectors_ which yield attributes associated with nodes.
For example, a manipulation system for a statically scoped language will supply a semantic selector that yields the _defining occurrence_ of a given name (i.e., the point
where the name is defined).
>
> Language Design for Program Manipulation by Merks et al., IEEE Transactions on Software Engineering, 1992. [↗](https://ieeexplore.ieee.org/document/120313)

Strikingly, tools today still don't expose semantic information like this
without heaps of complexity and difficulty (think about installing and running
language-specific toolchains, or writing analyses using them). The current
trend of language-server-like tools is the closest effort to a simpler semantic
interface, but it is heavily influenced by code editor workflows. I'm hopeful
for an ecosystem with broader _semantic selectors as a service_ that expose deep
information for all languages. Find and replace with types is one of
the best reasons I've found for doing that so far.

---

#### Footnotes

<sup>1. [Original Go PR](https://go-review.googlesource.com/c/go/+/140998/)</sup> 
<br>
<br>
<sup>2. The underlying semantics for a `range` operation differs based on the type of
`x`. When `x` is a `nil` slice or map, no check is needed, and the `range`
operation is effectively a no-op (my guess is this behavior is probably
implemented for convenience). But when `x` is a pointer or channel, a missing
check could lead to a null dereference or blocking, respectively.
</sup>
<br>
<br>
<sup>3. Please note nothing in this post is a Sourcegraph-endorsed
or maintained feature, it's a personally maintained experimental feature in `comby` added by me, the author.</sup>
<br>
<br>
<sup>4. Some quick usage notes if you decide to try the things in this post:
<br>
<sup>
&nbsp; **›**  You need to use the latest [docker distribution](https://github.com/comby-tools/comby#docker) or [build comby from source](https://github.com/comby-tools/comby#build-from-source). This because the latest version is not yet available to Linux or via `brew` on macOS.
</sup>
<br>
<sup>
&nbsp; **›**  You still need to clone the target repository locally (like `github.com/rclone/rclone`), then run `comby` at the root of the project.
</sup>
<br>
<sup>
&nbsp; **›** I'm not sure which projects are automatically indexed, but `comby` will
  notify you if a `lsif.hover` property isn't available.
</sup>
<br>
<sup>
&nbsp; **›** For help with Sourcegraph stuff visit [their Discord](https://discord.gg/rDPqBejz93). For `comby` things visit the [gitter channel](https://gitter.im/comby-tools/community).
</sup>
<br>
<sup>
&nbsp; **›** Using `comby` to access hover info is experimental and subject to change.
</sup>
