---
id: rewrite-properties
title: Rewrite properties
sidebar_label: Rewrite Properties
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

<style>
table {
  display: table;
}
table th {
  background-color: transparent;
  border: none;
}
table td:first-child {
  width: 15em;
  min-width: 15em;
  max-width: 15em;
//  word-break: break-all;
}
//table td:nth-child(2) {
//  width: 10em;
//  min-width: 10em;
//  max-width: 10em;
//  word-break: break-all;
//}
table td {
    border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}

</style>

Comby has convenient built-in properties to transform and substitute matched
values for certain use cases that commonly crop up when rewriting code. For
example, `:[hole].Capitalize` will capitalize a string matched by `hole` (if
possible).


```bash
echo 'these are words 123' | comby -stdin ':[[x]]' ':[[x]].Capitalize' -lang .txt
```

```patch
--- /dev/null
+++ /dev/null
@@ -1,1 +1,1 @@
-these are words 123
+These Are Words 123
```

> [playground ↗](https://comby-live.fly.dev/index.html#%7B%22source%22:%22these%20are%20words%20123%22,%22match%22:%22:%5B%5Bx%5D%5D%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22:%5Bx%5D.Capitalize%22,%22language%22:%22.generic%22,%22substitution%5Fkind%22:%22in%5Fplace%22,%22id%22:0%7D)

Properties are recognized in the rewrite template and substituted according to
the predefined behavior. Property accesses cannot be chained. Below are the
current built-in properties.

### String converters

| Property            | Behavior                                                                                                                                              |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `.lowercase`        | Convert letters to lowercase                                                                                                                          |
| `.UPPERCASE`        | Convert letters to uppercase                                                                                                                          |
| `.Capitalize`       | Capitalize the first character if it is a letter                                                                                                      |
| `.uncapitalize`     | Lowercase the first character if it is a letter                                                                                                       |
| `.UPPER_SNAKE_CASE` | Convert `camelCase` to `snake_case` (each capital letter in `camelCase` gets a `_` prepended). Then uppercase letters.                                |
| `.lower_snake_case` | Convert `camelCase` to `snake_case` (each capital letter in `camelCase` gets a `_` prepended). Then lowercase letters.                                |
| `.UpperCamelCase`   | Convert `snake_case` to `CamelCase` (each letter after `_` in `snake_case` is capitalized, and the `_` removed). Then capitalize the first character. |
| `.lowerCamelCase`   | Convert `snake_case` to `CamelCase` (each letter after `_` in `snake_case` is capitalized, and the `_` removed). Then lowercase the first character.  |

> [playground ↗](https://comby-live.fly.dev/index.html#%7B%22source%22:%22%20%20%20%20LOWERCASE%5Cn%20%20%20%20uppercase%5Cn%20%20%20%20capitalize%5Cn%20%20%20%20Uncapitalize%5Cn%20%20%20%20upper%5Fcamel%5Fcase%5Cn%20%20%20%20Lower%5Fcamel%5FCase%5Cn%20%20%20%20upperSnakeCase%5Cn%20%20%20%20lowerSnakeCase%22,%22match%22:%22%20%20%20%20%20%20%20:%5B%5Ba%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bb%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bc%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bd%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Be%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bf%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bg%5D%5D%5Cn%20%20%20%20%20%20%20:%5B%5Bh%5D%5D%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22%20%20%20%20%20%20%20:%5B%5Ba%5D%5D%20-%3E%20:%5B%5Ba%5D%5D.lowercase%5Cn%20%20%20%20%20%20%20:%5B%5Bb%5D%5D%20-%3E%20:%5B%5Bb%5D%5D.UPPERCASE%5Cn%20%20%20%20%20%20%20:%5B%5Bc%5D%5D%20-%3E%20:%5B%5Bc%5D%5D.Capitalize%5Cn%20%20%20%20%20%20%20:%5B%5Bd%5D%5D%20-%3E%20:%5B%5Bd%5D%5D.uncapitalize%5Cn%20%20%20%20%20%20%20:%5B%5Be%5D%5D%20-%3E%20:%5B%5Be%5D%5D.UpperCamelCase%5Cn%20%20%20%20%20%20%20:%5B%5Bf%5D%5D%20-%3E%20:%5B%5Bf%5D%5D.lowerCamelCase%5Cn%20%20%20%20%20%20%20:%5B%5Bg%5D%5D%20-%3E%20:%5B%5Bg%5D%5D.UPPER%5FSNAKE%5FCASE%5Cn%20%20%20%20%20%20%20:%5B%5Bh%5D%5D%20-%3E%20:%5B%5Bh%5D%5D.lower%5Fsnake%5Fcase%22,%22language%22:%22.generic%22,%22substitution%5Fkind%22:%22in%5Fplace%22,%22id%22:0%7D)

### Sizes

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.length`         | Substitute the number of characters of the hole value                          |
| `.lines`          | Substitute the number of lines of the hole value                               |

> [playground ↗](https://comby-live.fly.dev/index.html#%7B%22source%22:%22fn%20another%5Ffunction%28x:%20i32,%20y:%20i32%29%20%7B%5Cn%20%20%20%20println!%28%5C%22The%20value%20of%20x%20is:%20%7B%7D%5C%22,%20x%29;%5Cn%20%20%20%20println!%28%5C%22The%20value%20of%20y%20is:%20%7B%7D%5C%22,%20y%29;%5Cn%7D%22,%22match%22:%22fn%20:%5Bx%5D%20%7B:%5Bbody%5D%7D%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22%23characters%20in%20function%20body:%20:%5Bbody%5D.length%5Cnlines%20in%20function%20body:%20:%5Bbody%5D.lines%22,%22language%22:%22.generic%22,%22substitution%5Fkind%22:%22in%5Fplace%22,%22id%22:0%7D)

### Positions

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.line`           | Substitute the starting line number of this hole                               |
| `.line.start`     | Alias of `.line`                                                               |
| `.line.end`       | Substitute the ending line number of this hole                                 |
| `.column`         | Substitute the starting column number of this hole (also known as `character`) |
| `.column.start`   | Alias of `.column`                                                             |
| `.column.end`     | Substitute the ending column number of this hole                               |
| `.offset`         | Substitute the starting byte offset of this hole in the file                   |
| `.offset.start`   | Alias of `.offset`                                                             |
| `.offset.end`     | Substitute the ending byte offset of this hole in the file                     |

Note: only `.offset` is available in the playground. `.line` and
`.column` are currently only supported on the command-line, and on files (not
via `-stdin`).

> [playground ↗](https://comby-live.fly.dev/index.html#%7B%22source%22:%22fn%20another%5Ffunction%28x:%20i32,%20y:%20i32%29%20%7B%5Cn%20%20%20%20println!%28%5C%22The%20value%20of%20x%20is:%20%7B%7D%5C%22,%20x%29;%5Cn%20%20%20%20println!%28%5C%22The%20value%20of%20y%20is:%20%7B%7D%5C%22,%20y%29;%5Cn%7D%22,%22match%22:%22println!%28:%5Barg%5D%29%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22offset%20of%20%60println%60:%20:%5Barg%5D.offset%22,%22language%22:%22.generic%22,%22substitution%5Fkind%22:%22newline%5Fseparated%22,%22id%22:0%7D)

### File context

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.file`           | Substitute the absolute file path of the file where this hole matched          |
| `.file.path`      | Alias of `.file`                                                               |
| `.file.name`      | Substitute the file name of the file where this hole matched (`basename`)      |
| `.file.directory` | Substitute the file directory of the file where hole matched (`dirname`)       |

Use on the command line to see this in action.

### Identity (for escaping property names)

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.value`          | Substitute the text value of this hole (for escaping, see below)               |

## Resolving clashes with property names

Let's say you want to literally insert the text `.length` after a hole. We
can't use `:[hole].length` because that reserved syntax will substitute the
_length of the match_, and not insert the text `.length`. To resolve a clash like this,
simply use `:[hole].value` instead of `:[hole]` to substitute the value of
`:[hole]`. Then, append `.length` to the template. This will cause the `.length`,
to be interpreted literally:

```bash
echo 'a word' | comby -stdin ':[[x]]' ':[x].value.length is :[x].length' -lang .txt
```

```patch
--- /dev/null
+++ /dev/null
@@ -1,1 +1,1 @@
-a word
+a.length is 1 word.length is 4
```

> [playground ↗](https://comby-live.fly.dev/index.html#%7B%22source%22:%22a%20word%22,%22match%22:%22:%5B%5Bx%5D%5D%22,%22rule%22:%22where%20true%22,%22rewrite%22:%22:%5Bx%5D.value.length%20is%20:%5Bx%5D.length%22,%22language%22:%22.generic%22,%22substitution%5Fkind%22:%22in%5Fplace%22,%22id%22:0%7D)


The way this works is that `:[hole].value` acts as an escape sequence so that any conflicting `.<property>` can be interpreted
literally by simply appending it to `:[hole].value`.
