# jql

`jql` is a small library that provides a sql-like interface for querying and aggregating javascript objects and DOM nodes.

## Features

- 🤏 Small size: ~15kb gzipped
- ☝️ Only one small external dependency
- 👣 Small footprint: no prototype polluting
- 🤷 No reason behind it

## Usage

### Installation

```sh
npm i @storynode/jql
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
  .limit(10) // Fetch first 10 results
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

const results = await select()
  .from(sampleObj, sampleCollection)
  .where(
      prop("name", /^obj/)
  )
  .run()
```

Projections and builtin filters support nested properties out of the box:

```typescript
const sample = [{
    parent: {
      a: 1,
      b: {
        c: 2
      }
    }
  }, {
    some: {
      prop: 1,
      some: {
        prop: 2
      }
    }
  }];

  const result = await select("parent.a").from(sample).run();
  // [{ parent: { a: 1 }}, { parent: { a: null }}]

  const result = await select().from(sample).where(prop("parent.a", 1)).run();
  // [{ parent: { a: 1, b: { c: 2 }}}]
```

### Custom query filters

In the previous examples the provided builtin filters are used for simplicity's sake, but keep in mind that filters are just predicates, namely just functions that take an input and return a `boolean`, so you can provide any logic you want in those function bodies.

These predicates can be async.

As an extreme example, if you would like to filter all elements based on a flip of a coin:

```typescript
const sampleObj = { name: "obj1", description: "Some object" };

const sampleCollection = [
  { name: "obj23", description: "Object 23" },
  { name: "obj111", description: "My name is Inigo Montoya" },
  { name: "trash", description: "This will not be selected" }
];

const results = await select()
  .from(sampleObj, sampleCollection)
  .where(
      (el) => Math.random() >= 0.5
  )
  .run()
```

### Mixing datasources

You can mix DOM / collections / objects as datasources in a single query

## FAQ

> Why, in the name of all that is holy, did you do this?
>
> *- Coworkers and friends*

---

**Q: Why this library?**

A: For absolutely no reason, I just had some time to spare

---

**Q: In what situations is this actually helpful?**

A: If you need to combine results from different objects / nodes / collections in a single result set then this is *actually* useful!

---

**Q: Should I use `jql` instead of plain old query selectors?**

A: It depends: if the filtering you need can be done with document.querySelector[All] and you know how to use it then, by all means, go for it. This can still be usefull if you need to filter results with a function and you want to add some readability to your code.

---

**Q: Does this support joining datasources?**

A: Not yet, but it will eventually.
