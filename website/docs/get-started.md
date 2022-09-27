---
id: get-started
title: Get started with comby
sidebar_label: Get Started
---

## Install

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

|          |                                                                                                     |
|----------|-----------------------------------------------------------------------------------------------------|
| Mac OS X | `brew install comby`                                                                                |
| Ubuntu   | `bash <(curl -sL get-comby.netlify.app)`                                                            |
| Windows  | `bash <(curl -sL get-comby.netlify.app)` after installing Ubuntu with [WSL](https://ubuntu.com/wsl) |
| Docker   | `docker pull comby/comby`                                                                           |
|          |                                                                                                     |

Or [build from source](#build-from-source). Having trouble? Ask in [Gitter](https://gitter.im/comby-tools/community) or [create an issue on GitHub](https://github.com/comby-tools/comby/issues/new/choose).

### Check your installation

Run this in your terminal to check that things are working:

```bash
comby 'swap(:[1], :[2])' 'swap(:[2], :[1])' -stdin .js <<< 'swap(x, y)'
```

You should see:

```diff
------ /dev/null
++++++ /dev/null
@|-1,1 +1,1 ============================================================
-|swap(x, y)
+|swap(y, x)
```

## Build from source

Build comby from source for other platforms or for local development.

1. Install [opam](https://opam.ocaml.org/doc/Install.html)
1. Create a new switch for the OCaml compiler

```plaintext
opam init
opam switch create 4.09.0 4.09.0
```

The above step will take a couple of minutes. Next,

```plaintext
git clone https://github.com/comby-tools/comby
cd comby
opam pin add comby.dev -n .
opam depext -yt comby
opam install -t . --deps-only
make
make test
```

Optionally, run `make install` if you want to install the `comby` binary on your path.
