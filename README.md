# zim-to-atom-note
cover zim folder to atom-note folder

## Usage

```
node main.js srcDir destDir
```

## Note
### The Definition of note.json
the file note.json record some information of this atom notebook.

the structure like this:

```
{
  "name":"my note book",
  "author":"tobyn",
  "format":"atom-note-v0.0.1"
}
```

### How to cover the link of wiki style?
the define of zim style link [Zim - link](http://zim-wiki.org/manual/Help/Links.html)

```
[[Journal:2015:08:20]]
```

will be covered to

```
[Journal:2015:08:20](Journal:2015:08:20)
```
