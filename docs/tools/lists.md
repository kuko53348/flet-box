# Lists, arrays & data

## Overview
Helpers for shaping collections and generating data: iterate lists into widgets, pick random values, create mock data, and treat dictionaries with a Python-like API.

## When to use
- Turn an array into widget rows (`mapList`, grid/carousel/lists heavily use these).
- Sort, filter out duplicates, chunk, or shuffle arrays.
- Build fake data for demos and prototypes (`createList`, `random`).

## Import

```javascript
import { mapList, repeat, range, sort, unique, dict, createList } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `mapList` | `mapList(list, fn)` | `Widget[]` | Map a list (or a number, or a record) into widgets. `fn` receives `(item, index, key?)`. |
| `repeat` | `repeat(count, widget \| fn)` | `Widget[]` | Repeat a widget, or build one per index via `fn(index)`. |
| `range` | `range(start, end?, step?)` | `number[]` | A numeric sequence. |
| `shuffle` | `shuffle(arr)` | `T[]` | A new array with shuffled order. |
| `reverse` | `reverse(arr)` | `T[]` | A new array, reversed. |
| `sort` | `sort(arr, by?, order?)` | `T[]` | Sort by a string key or a comparator; `order` is `'asc'`/`'desc'`. |
| `unique` | `unique(arr, key?)` | `T[]` | Remove duplicates; optionally by a `key` field. |
| `chunk` | `chunk(arr, size)` | `T[][]` | Split into arrays of `size`. |
| `createList` | `createList(schema, count?)` | `T[]` | Generate mock data from a schema. |
| `createList.fromData` | `(data, mapper)` | `R[]` | Map real data through a schema mapper. |
| `createList.range` | `(start, end, mapper?)` | `any[]` | Range with optional mapper. |
| `createList.repeat` | `(value, count)` | `T[]` | Repeat a value. |
| `createList.paginate` | `(list, page?, pageSize?)` | object | `{ data, page, pageSize, total, totalPages, hasNext, hasPrev, startIndex, endIndex }`. |
| `createList.search` | `(list, query, fields?)` | `T[]` | Filter by a string (or predicate) across fields. |
| `createList.sort` | `(list, field, order?)` | `T[]` | Sort by a field. |
| `createList.groupBy` | `(list, field)` | `Record<string, T[]>` | Group by a field. |
| `dict` | `dict(obj?)` | any | A Python-like dictionary with chainable methods. |
| `emptyDict` | `emptyDict()` | any | A new empty dictionary. |
| `fromJSON` | `fromJSON(jsonStr)` | any | Parse JSON into a dict/value. |
| `fromEntries` | `fromEntries(entries)` | any | Build from `[key, value]` pairs. |
| `random` | see below | — | Random numbers, ids, colors, and fake data. |

### The `random` object

`random.number(min?, max?)`, `random.string(length?)`, `random.firstName()`, `random.lastName()`, `random.fullName()`, `random.email(name?)`, `random.age()`, `random.boolean()`, `random.choice(arr)`, `random.id()`, `random.hexColor()`, `random.rgbColor()`, `random.date(start?, end?)`, `random.dateString(start?, end?)`, `random.time()`, `random.timeAmPm()`, `random.datetime()`, `random.timestamp()`, `random.dayOfWeek()`, `random.month()`.

## Examples

### Everyday example

```javascript
import { Column, Text, mapList, repeat } from "flet-box";

Column({
  children: repeat(3, Text({ text: "hello" })),
});
```

### Full example

```javascript
import { Column, Text, createList, sort } from "flet-box";

const people = createList(
  { name: "firstName", age: "age" },
  5,
);

Column({
  children: sort(people, "age", "asc").map((p) =>
    Text({ text: `${p.name} (${p.age})` }),
  ),
});
```

## Notes

- `mapList` accepts a **number** (renders that many items), an **array**, or a **record** of items — so it works with `for`-style and object-style data alike.
- The collection helpers (`sort`, `shuffle`, `unique`, `chunk`, `reverse`) return **new arrays**: your original array is never mutated.
- `createList` takes a schema of fields: a string is a generator name (`"firstName"`, `"age"`, `"email"`) and a function is called to produce the value.
- `dict` is an object with Python-dict methods (chainable); `fromEntries` builds it from pairs.

## Related pages
- [Text & time](text-and-time.md) — next chapter.
- [Styling helpers](styling.md) — previous chapter.
- [Widget introspection](introspection.md) — inspect widget props.

---

## Continue reading

- **Previous:** [Styling helpers](styling.md)
- **Next:** [Text & time](text-and-time.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (2 of 12).