# jql

`jql` is a small library that provides a sql-like interface for querying and aggregating javascript objects and DOM nodes.

## Features

- No external dependencies
- Small footprint: no prototype polluting
- Small size
- No reason behind it

## Usage

```sh
npm i -S @dpw/jql
```

```typescript
const results = await select('div', 'a')
  .from(document)
  .where(
    and(
      (el) => el.classList.contains('foo'),
      not((el) => el.classList.contains('bar'))
    )
  )
  .lmit(10) // Fetch first 10 results
  .offset(0) // Starting from the first one (the default)
  .run()
```

## FAQ

> FAQ is used in place of "Frequently Asked Questions". Indeed my friends and coworkers frequently ask me 'Why?'

**Q: Why this library?**

A: For absolutely no reason, I just had some time to spare

---

**Q: Should I use jql instead of plain old query selectors?**

A: It depends: if the filtering you need can be done with document.querySelector[All] and you know how to use it then by all means go for it. This can still be usefull if you need to filter results with function and you want to add some readability to your code.
