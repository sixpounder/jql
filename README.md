# jql

`jql` is a small library that provides a sql-like interface for querying and aggregating javascript objects and DOM nodes.

## Features

- Small footprint: no prototype polluting
- Small size
- Only one small external dependency
- No reason behind it 🤷

## Usage

### Installation

```sh
npm i -S @jql/jql
```

### DOM querying

```typescript
const results = await select("tagName", "textContent")
  .from(document)
  .where(
    and(
      tagName("div"),
      hasClass("foo"),
      not(hasClass("bar"))
    )
  )
  .lmit(10) // Fetch first 10 results
  .offset(0) // Starting from the first one (the default)
  .run()
```

Would yield something like this:

```javascript
[{
  tagName: "DIV",
  textContent: "I am the content of a div"
}, {
  tagName: "DIV",
  textContent: "I am the content of some other div"
}]
```

### Objects / collections

```typescript
const sampleObj = { name: "obj1", description: "Some object" };

const sampleCollection = [
  { name: "obj23", description: "Object 23" },
  { name: "obj111", description: "My name is Inigo Montoya" },
  { name: "trash", description: "This will not be selected" }
];

const results = await select("*")
  .from(sampleObj, sampleCollection)
  .where(
      prop("name", /^obj/)
  )
  .run()
```

### Mixing datasources

You can mix DOM / collections / objects as datasources in a single query

## FAQ

> FAQ is used in place of "Frequently Asked Questions". Indeed my friends and coworkers frequently ask me 'Why?'

**Q: Why this library?**

A: For absolutely no reason, I just had some time to spare

---

**Q: In what situations is this actually helpful?**

A: If you need to combine results from different objects / nodes / collections in a single result set then this is *actually* useful!

---

**Q: Should I use jql instead of plain old query selectors?**

A: It depends: if the filtering you need can be done with document.querySelector[All] and you know how to use it then by all means go for it. This can still be usefull if you need to filter results with function and you want to add some readability to your code.
