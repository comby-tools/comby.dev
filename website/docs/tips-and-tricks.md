
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

## Tips and tricks
→ Know that you're looking for a specific string? Go faster by using [ripgrep](https://github.com/BurntSushi/ripgrep) to quickly filter files and then pipe them to `comby`:

```plaintext
rg -l errorutil | xargs comby -in-place 'errorutil.Handler(:[1])' '...'
```

→ Using `:[hole]` inside string quotes will match only within the string. This
is implemented for most languages. Comby also understands the difference between
escapable string literals (like "string" in C) and raw string literals (like
`string` in Go), and will know to stop between these delimiters.

> [playground ↗](https://bit.ly/2WRnxEL)

→ You almost never want to start a template with `:[hole]`, since it matches
everything including newlines up to its suffix. This can make things slow.
`:[hole]` is typically useful inside balanced delimiters.

→ Consider combinations of holes to match interesting properties. For example,
to capture leading indentation of a line, use a template like:

```plaintext
:[ leading_indentation]:[everything_until_newline\n]
```

> [playground ↗](https://bit.ly/31uC6RE)

→ Looking for inspiration? Check out these [sample code rewrites](https://catalog.comby.dev/) and the [FAQ](faq#what-can-i-use-comby-for).

## How do I...

### Run multiple search-and-replace templates?

Use a directory of rewrite templates with the `-templates` option and run it like so:

```bash
comby -f .go -templates /path/to/directory
```

It's important to use the `-f` option for filtering files when using
`-templates`, or `comby` will think it is an anonymous argument for a command
line template.

The `path/to/directory` should contain folders, one for each rewrite pattern,
that contain two files: one named `match` and the other named `rewrite`. An optional
rule can be put in the same directory, in a file called `rule`. For example,

```plaintext
path/to/directory
├── some-rewrite
│   ├── match
│   └── rewrite
├── another-rewrite-with-rule
│   ├── match
│   ├── rule
│   └── rewrite
···
```

See the [catalog directory layout](https://github.com/comby-tools/sample-catalog) for a [sample catalog of templates](https://catalog.comby.dev/).

### Extract matches?

**First way:** Add `-match-only -json-lines` will print matched content, matched
values for holes, and ranges in JSON format. One line is printed per match.

```bash
comby 'a :[1] c d' '' -stdin .txt -json-lines -match-only <<< "a b c d"
```

Use [jq](https://stedolan.github.io/jq/) to extract values you're interested in
from the JSON. See the [JSON schema](api#schema-example) for what the JSON
output contains.

**Second way:** Add `-newline-separated -stdout` if you're only interested in
the matched fragments and don't want to fiddle with JSON.

```bash
comby 'a :[1] c d' '' -stdin .txt -match-only -newline-separated -stdout <<< "a b c d"
```

This will print all matches terminal, one entry per line. If `-match-only` is
removed, all rewritten-values are printed.

### Review changes before accepting them?

Interactively review changes on the command line using `-review`, just like in [codemod](https://github.com/facebook/codemod):

```bash
comby 'foo(:[1], :[2])' 'bar(:[2], :[1])' sub.js -review
```

You'll see, for example:

```diff
------ sub.js
++++++ sub.js
@|-1,3 +1,3 ============================================================
-|function subtract(param1, param2) {
+|function subtract(param2, param1) {
 |  return param1 - param2;
 |}
Accept change (y = yes [default], n = no, e = edit original, E = apply+edit, q = quit)?
```
### Get raw patches?

Add `-diff` to get patches as unified diffs.

```bash
comby 'foo(:[1], :[2])' 'bar(:[2], :[1])' -stdin -diff <<< 'foo(a, b)'
```

```diff
--- /dev/null
+++ /dev/null
@@ -1,1 +1,1 @@
-foo(a, b)
+bar(b, a)
```

### Select the language to parse?

Comby will try and infer the language to parse based on file extensions, and
will fall back to the generic parser if it does not recognize an extension. Set
a language using the `-matcher` flag to force using a language parser, like
`-matcher .js` or `-matcher .c`. See all languages by running `comby -list`.
Note: you can use `-matcher .js` to parse files as a Javascript file even if
they end in a different suffix, like `my.custom.file.suffix`

### Pipe input to comby?

Add `-stdin` to have `comby` accept input from pipes, and `-stdout` to write to print to standard out.

```bash
echo 'foo(a, b)' | \
comby 'foo(:[1], :[2])' 'bar(:[2], :[1])' -stdin -stdout .js | \
comby 'bar(:[_])' 'qux(:[_])' -stdin -stdout .js
```

### Specify rules on the command line?

Use the `-rule` option to specify [rules](advanced-usage#rules):

```bash
comby 'foo(:[1])' 'bar(:[1])' .py -rule 'where :[1] == "self"'
```
