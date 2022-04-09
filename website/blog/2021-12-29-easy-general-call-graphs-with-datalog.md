---
id: easy-general-call-graphs-with-datalog
title: Cheap Call Graphs with Comby and Datalog
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

> A tag line.

---

A call graph tells you which functions call other ones in your programs.
Beyond just a visual construct, a call graph can power the engine behind your editor
that lets you jump around functionuses and definitions, or help find bugs and dead code.

Writing a program to generate call graphs can be laborious, especially if you
start dealing with language-specific complexity (syntax, dynamic dispatch,
etc.). In this post I'm going to ignore all that complexity and show you how
it's still possible to generate a _useful_ call graph just based on static
function definitions for a bunch of languages. This is all about maximizing
utility with a low-effort quick-and-dirty approach.

![](../../../img/call-graph-chart.png)


Why is ignoring that complexity reasonable, and when is building a simplified or
"incomplete" call graph reasonable? Here are a couple:

- It's time consuming to write a comprehensive call graph generator for a
  complex language (like C++). If you're really invested in the effort, expect
  to spend a long time figuring out how to write analysis passes in Clang and
  case out on all the right types (and this is the fast-track route that does
  the parsing for you). If you're like "muh muh muh I can just use
  `-dot-callgraph` this already exists", expect to deal with any of various
  compiler flags, versions, and annoyances like symbol demangling. You also
  lose control over filtering out functions you may not care about, unless
  you're prepared to write a pass or something with `clang-query` or I don't
  know what. Once you've figured out everything, congratulations. But none of
  this works for Rust or something else.

- There's no existing call graph tool or framework for your new fresh language
  (maybe something like Zig or XYZ). How invested are you in writing a tool for
  this language? Have you considered a quick-and-dirty approach instead?
  

Even if you can justify making an investment in the tooling to generate these call graph
edges, let's take this a step further and think about the API you would want to build around it.
Do you want people to be able to ask:

- Does X call Y?
- Which all call Y?

If this is you, let me talk to you about Datalog.



I'm tired of incomplete, impractical examples.

_Hand-wave_ and you probably never hear about Datalog again. Unless you look
underneath the hood of CodeQL, or Glean, or whatever. Well.
