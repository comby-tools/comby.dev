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
  max-width: 10em;
//  word-break: break-all;
}
table td:nth-child(2) {
  width: 10em;
  min-width: 10em;
  max-width: 10em;
//  word-break: break-all;
}
table td {
    border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}

</style>


| Named Match     | Just Match                 | Description                                                                                                                                                                                                                                                                                                  |
|-----------------|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `:[hole]`       | `...`<br><br>`:[_]`        | match zero or more characters in a lazy fashion. When used is inside delimiters, as in `{:[h1], :[h2]}` or `(:[h])`, holes match within that group or code block, including newlines. Holes outside of delimiters stop matching at a newline, or the start of a code block, whichever comes first.           |
| `:[hole~regex]` | `:[~regex]`                | match an arbitrary PCRE regular expression `regex`. Avoid regular expressions that match special syntax like `)` or `.*`, otherwise your pattern may fail to match balanced blocks.                                                                                                                          |
| `:[[hole]]`     | `:[~\w+]`<br>`:[[_]]`      | match one or more alphanumeric characters and `_`.                                                                                                                                                                                                                                                           |
| `:[hole:e]`     | `:[_:e]`                   | Expression-like syntax matches contiguous non-whitespace characters like foo or foo.bar, as well as contiguous character sequences that include valid code block structures like balanced parentheses in `function(foo, bar)` (notice how whitespace is allowed inside the parentheses). Language-dependent. |
| `:[hole.]`      | `:[_.]`                    | match one or more alphanumeric characters and punctuation like `.`, `;`, and `-` that do not affect balanced syntax. Language dependent.                                                                                                                                                                     |
| `:[hole\n]`     | `:[~.*\n]`<br>`:[_\n]`     | match zero or more characters up to a newline, including the newline.                                                                                                                                                                                                                                        |
| `:[ hole]`      | `:[hole~[ \t]+]`<br>`:[ ]` | match only whitespace characters, excluding newlines.                                                                                                                                                                                                                                                        |
|                 |                            |                                                                                                                                                                                                                                                                                                              |
