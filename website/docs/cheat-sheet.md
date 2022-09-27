---
id: cheat-sheet
title: Cheat Sheet
---

This is a quick reference guide for useful comby options.

## Useful command line options

<style>
table thead {
 visibility: collapse;
}
table td {
    border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}

</style>

|                       |                                                                                                   |
|-----------------------|---------------------------------------------------------------------------------------------------|
| `-i`                  | replace files in place                                                                            |
| `-d dir`              | only process files recursively and directories in `dir`                                           |
| `-zip zipfile`        | process files in a ZIP archive                                                                    |
| `-jobs n`             | run `n` processes in parallel                                                                     |
| `-matcher language`   | select the `language` to parse the file as ([see more](cheat-sheet#select-the-language-to-parse)) |
| `-exclude prefix`     | exclude files with names or paths that start with `prefix`                                        |
| `-exclude-dir prefix` | same as `-exclude` but applies only to directories                                                |
|                       |                                                                                                   |

-- Exclude multiple prefixes with commas:

```plaintext
comby -exclude-dir vendor,node_modules,test ...
```

See `comby -help` for a complete list of flags.

## How do I...

### Run multiple search-and-replace templates?

Have a look at using [configuration files](configuration). Alternatively, use a
directory of rewrite templates with the `-templates` option and run it like so:

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
