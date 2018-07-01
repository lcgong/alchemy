

参照ObjectPath和JSONPath

`.`表示当前对象，例如`.store.book[*].author`访问了`['store']['book']`所有对象的`author`属性，
`.store.abc_*.author`

 http://objectpath.org/reference.html

// object path "$.store.book[*].author"

```
.details[*].item_name
.details[].item_name
.details.item_name
```

在同一个时间锥下，dobject和dlist对象的赋值均视为Link。
