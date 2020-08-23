---
id: syntax-reference
title: Syntax Reference
sidebar_label: Syntax Reference
---

Comby supports the following syntax, which carry special meaning for matching:

<style>
table {
//    width: 1600px;
}
table thead {
 visibility: collapse;
}
table td:first-child {
  width: 8em;
  min-width: 8em;
  max-width: 8em;
//  word-break: break-all;
}
table td {
    border: none;
}
table tr:nth-child(2n) {
  background-color: transparent;
}

</style>

|             |                                                                                                                                                                                                                                                                 |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `:[hole]`   | match zero or more characters (including whitespace, and across newlines) in a lazy fashion. When `:[hole]` is inside delimiters, as in `{:[h1], :[h2]}` or `(:[h])`, matching stops inside them. Holes can be used outside of delimiters as well.              |
| `:[[hole]]` | match one or more alphanumeric characters and _. Shorthand for `:[hole~\w+]`                                                                                                                                                                                    |
| `:[hole.]`  | (with a period at the end) matches one or more alphanumeric characters and punctuation like `.`, `;`, and `-` that do not affect balanced syntax. Language dependent.                                                                                           |
| `:[hole\n]` | (with a `\n` at the end) matches one or more characters up to a newline, including the newline. Shorthand for `:[x~.*\n]`.                                                                                                                                      |
| `:[ ]`      | (with a space) matches only whitespace characters, excluding newlines. To assign the matched whitespace to variable, put the variable name after the space, like `:[ hole]`. Shorthand for `:[hole~[ \t]+]`                                                     |
| `:[?hole]`  | (with a `?` before the variable name) optionally matches syntax. Optional holes work like ordinary holes, except that if they fail to match syntax, the variable is assigned the empty string `""`. Optional hole support is currently an experimental feature. |
