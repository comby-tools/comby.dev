---
id: syntax-reference
title: Syntax Reference
sidebar_label: Syntax Reference
---

The Comby syntax below has special meaning for matching. Bind match contents to
identifiers like `hole` using **Named Match** syntax. Using names is useful when
replacing contents or writing [rules](advanced-usage). To just match patterns
without giving a meaningful name, use any of the **Just Match** syntax.

<style>
.onPageNav {
display: none; // remove right-hand side nav bar
}
table {
  display:table;
//    width: 1600px;
}
table th {
  background-color: transparent;
  border: none;
// visibility: collapse;
}
table td:first-child {
  width: 10em;
  min-width: 10em;
  max-width: 15em;
//  word-break: break-all;
}
table td:nth-child(2) {
//  width: 10em;
  min-width: 10em;
  max-width: 15em;
//  word-break: break-all;
}
table td {
    border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}

</style>

## Match and Rewrite Syntax

| Named Match    | Just Match                | Description                                                                                                                                                                                                                                                                                                  |
|----------------|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `:[var]`       | `...`<br><br>`:[_]`       | match zero or more characters in a lazy fashion. When used is inside delimiters, as in `{:[v1], :[v2]}` or `(:[v])`, holes match within that group or code block, including newlines. Holes outside of delimiters stop matching at a newline, or the start of a code block, whichever comes first.           |
| `:[var~regex]` | `:[~regex]`               | match an arbitrary PCRE regular expression `regex`. Avoid regular expressions that match special syntax like `)` or `.*`, otherwise your pattern may fail to match balanced blocks.                                                                                                                          |
| `:[[var]]`     | `:[~\w+]`<br>`:[[_]]`     | match one or more alphanumeric characters and `_`.                                                                                                                                                                                                                                                           |
| `:[var:e]`     | `:[_:e]`                  | Expression-like syntax matches contiguous non-whitespace characters like foo or foo.bar, as well as contiguous character sequences that include valid code block structures like balanced parentheses in `function(foo, bar)` (notice how whitespace is allowed inside the parentheses). Language-dependent. |
| `:[var.]`      | `:[_.]`                   | match one or more alphanumeric characters and punctuation like `.`, `;`, and `-` that do not affect balanced syntax. Language dependent.                                                                                                                                                                     |
| `:[var\n]`     | `:[~.*\n]`<br>`:[_\n]`    | match zero or more characters up to a newline, including the newline.                                                                                                                                                                                                                                        |
| `:[ var]`      | `:[var~[ \t]+]`<br>`:[ ]` | match only whitespace characters, excluding newlines.                                                                                                                                                                                                                                                        |
## Rewrite Properties

### String converters

| Property            | Behavior                                                                                                                                             |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `.lowercase`        | Convert letters to lowercase                                                                                                                         |
| `.UPPERCASE`        | Convert letters to uppercase                                                                                                                         |
| `.Capitalize`       | Capitalize the first character if it is a letter                                                                                                     |
| `.uncapitalize`     | Lowercase the first character if it is a letter                                                                                                      |
| `.UPPER_SNAKE_CASE` | Convert `camelCase` to `snake_case` (each capital letter in `camelCase` gets a `_` prepended). Then uppercase letters.                               |
| `.lower_snake_case` | Convert `camelCase` to `snake_case` (each capital letter in `camelCase` gets a `_` prepended). Then lowercase letters.                               |
| `.UpperCamelCase`   | Convert `snake_case` to `CamelCase` (each letter after `_` in `snake_case` is capitalized, and the `_` removed). Then capitalize the first character.|
| `.lowerCamelCase`   | Convert `snake_case` to `CamelCase` (each letter after `_` in `snake_case` is capitalized, and the `_` removed). Then lowercase the first character. |

### Sizes

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.length`         | Substitute the number of characters of the hole value                          |
| `.lines`          | Substitute the number of lines of the hole value                               |

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

### File context

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.file`           | Substitute the absolute file path of the file where this hole matched          |
| `.file.path`      | Alias of `.file`                                                               |
| `.file.name`      | Substitute the file name of the file where this hole matched (`basename`)      |
| `.file.directory` | Substitute the file directory of the file where hole matched (`dirname`)       |

### Identity

| Property          | Behavior                                                                       |
|-------------------|--------------------------------------------------------------------------------|
| `.value`          | Substitute the text value of this hole                                         |
