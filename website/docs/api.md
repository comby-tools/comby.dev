---
id: api
title: API Reference
sidebar_label: API Reference
---

<!-- Query ? -->

The API Reference explains how to access various match and rewrite information
in Comby if you want to integrate or build other tooling (like an editor plugin
or grammar fuzzer).

There are three **operations** for information: `match`, `rewrite`, and
`substitute`.

To perform these operations and access the results, there are three options:

1. Use [Python bindings for Comby](https://github.com/ChrisTimperley/comby-python).
1. Invoke Comby directly on the command line.
1. Use HTTP requests to a persistent server that you run on your machine.


## Python Bindings

See the [interface.py file](https://github.com/ChrisTimperley/comby-python/blob/master/src/comby/interface.py#L13)
that describes the operations and data types when using Python bindings.

## Command Line

The command line is a bare-bones interface to perform operations, but useful for
understanding the schema--consider using the [Python bindings](#python-bindings)
or a [server](#comby-server) to avoid command line awkwardness.

### Match

Retrieve match information by using the `-match-only` flag. For example:

```bash
echo 'printf("hello!");' | comby 'printf(:[arg])' '' .c -stdin -match-only
```

> Note: `comby` currently expects a rewrite template in the second anonymous argument. When using `-match-only`, simply use an empty string like above.

The `-match-only` option will only print out the entire matched string on the
command line. Add the `-json-lines` flag to get all information on matched
ranges and matched holes.

```bash
comby 'printf(:[arg])' '' .c -stdin -match-only -json-lines
```

This outputs JSON information, one line per match (in this case, the `printf(...)` part). We can make the format more readable by piping the output to `python -m json.tool`.

#### Schema example

```json
{
    "uri": null,
    "matches": [
        {
            "range": {
                "start": {
                    "offset": 0,
                    "line": 1,
                    "column": 1
                },
                "end": {
                    "offset": 16,
                    "line": 1,
                    "column": 17
                }
            },
            "environment": [
                {
                    "variable": "arg",
                    "value": "\"hello!\"",
                    "range": {
                        "start": {
                            "offset": 7,
                            "line": 1,
                            "column": 8
                        },
                        "end": {
                            "offset": 15,
                            "line": 1,
                            "column": 16
                        }
                    }
                }
            ],
            "matched": "printf(\"hello!\")"
        }
    ]
}
```

- `uri` is the file path of the document containing `matches` (`null` for `stdin`)
- `matches` is a list of `matches` (like `printf(...)`. Each item in `matches` contains:
  - `matched`, the string that was matched by the template
  - `range`, the range spanned by `matched`
  - `environment`, containing a list of `variable`, `value`, and `range` items where:
    - `variable` is the hole identifier
    - `value` is the string value bound to `variable`
    - `range`, the range spanned by `value`

`range` contains `offset`, `line`, and `column` where:

> ☞ `offset` starts at **zero**
>
> ☞ `line` and `column` start at **one**

### Rewrite

The rewrite operation is similar to match. Use the `-json-lines` flag with a rewrite template as in:

```bash
echo 'printf("hello!");' | comby 'printf(:[arg])' 'printf("bye")' .c -stdin -json-lines
```

#### Schema summary

```json
{
    "uri": null,
    "rewritten_source": "printf(\"bye\");\n",
    "in_place_substitutions": [
        {
            "range": {
                "start": {
                    "offset": 0,
                    "line": -1,
                    "column": -1
                },
                "end": {
                    "offset": 13,
                    "line": -1,
                    "column": -1
                }
            },
            "replacement_content": "printf(\"bye\")",
            "environment": []
        }
    ],
    "diff": "--- /dev/null\n+++ /dev/null\n@@ -1,1 +1,1 @@\n-printf(\"hello!\");\n+printf(\"bye\");"
}
```

- `uri` corresponds to the changed file (`null` for `stdin`)
- `rewritten_source` is result of the entire rewritten file (or input for `stdin`)
- `diff` is a patch-compatible `diff` of the change
- `in_place_substitions` is a list of substituted fragments where:
  - `replacement_content` is the fragment substituted in-place for matches
  - `range`, the range spanned by `replacement_content`
  - `environment`, a list of `variable` and `value` of holes used in this
    result, with the updated `range`

> ☞  Adding the `-json-only-diff` flag will output the `diff` value of the change
 (useful if you only care about the resulting diff).


> ⚠ **Current Limitations**
>
> - Rewrite ranges currently do not report line and column values and are set to -1
>
> - If a hole with the same identifier is used multiple times in the rewrite template, `environment` will currently report only the first range

### Substitute

Substitute an environment inside a rewrite template with the `-substitute` flag. An example invocation is:

```bash
comby '' ':[1] :[2]' -substitute '[{"variable":"1","value":"hello"},{"variable":"2","value":"there"}]'
```

The output is only the rewritten output `hello there`.

> Note: `comby` currently expects a match template in the first anonymous argument. When using `-substitute`, simply use an empty string like above.

#### Walked example

One way to effectively use `-substitute` in scripting is by combining it with other operations. For example, Use [`jq`](https://stedolan.github.io/jq/) to extract environments from matches:

```
echo 'printf("hello", "there")' \
| comby 'printf(":[1]", ":[2]")' '' .c -stdin -json-lines -match-only \
| jq -c '.matches | map(.environment) | .[]'
```

The environment can be substituted by piping to `xargs` and using `-substitute`:

```bash
echo 'printf("hello", "there")' \
| comby 'printf(":[1]", ":[2]")' '' .c -stdin -json-lines -match-only \
| jq -c '.matches | map(.environment) | .[]' \
| xargs -0 comby '' ':[1] :[2]. General Kenobi!' -substitute
```

And we'll see `hello there. General Kenobi!`.

## Comby server

To use the server, you'll need to build from source. See the [README
instructions for comby-server](https://github.com/comby-tools/comby-server).

The `comby` server exposes the three HTTP POST endpoints below. These return the
 same JSON values as the respective [command line](#command-line) operations.
 The endpoints accept options like `rule` and `language` corresponding to
 command line flags.

#### `/match`

```json
{"source": "hello there", "match": "hello :[1]", "rule": "where :[1] == \"there\"", "language": ".generic", "id": 0}
```

- `source` should be the entire source file to rewrite
- `id` is an identifier for this request, which will be set in the corresponding response

#### `/rewrite`

```json
{"source": "hello there", "match": "hello :[1]", "rule": "where :[1] == \"there\"", "rewrite": "kenobi", "language": ".generic", "substitution_kind": "in_place", "id": 0}
```

`substitution_kind` can be one of `in_place` or `newline_separated`. When
`newline_separated` is chosen, rewritten fragments are output one per line,
rather than replaced in-place in the original document.

#### `/substitute`

```json
{"rewrite_template": "print(:[1])", "environment": "[{\"variable\":\"1\",\"value\":\"hello\"}]", "id": 0}
```

Set the `DEBUG` environment variable to see verbose incoming and outgoing data.
