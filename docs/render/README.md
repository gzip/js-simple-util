# SimpleUtil.render Docs

The render method takes an HTML element or a document fragment, along with a list of selectors and/or attributes to render to it. Examples follow.

# Simple Examples

For simplification the examples assume that an alias has been assigned like so:
`var util = SimpleUtil;`

The simplest example is to take a single node and change it's content and attributes:
```
<div id="foo"></div>
<script>util.render(util.byId('foo'), {root: {'data-foo': 'foo', innerHTML: 'bar'}});</script>
```
Which yields:
```
<div id="foo" data-foo="foo">bar</div>
```
Note that the special keyword "root" is used to designate changes on the root node (which otherwise can't be targeted by a selector). This examples is equivalent to the following so it isn't that useful by itself.
```
<script>util.setAttrs(util.byId('foo'), {'data-foo': 'foo', innerHTML: 'bar'});</script>
```

It starts to get more interesting when we pass in a parent node and expect children:
```
<ul class="list"><li></li></div>
<script>util.render(util.bySelector('.list'), {root: {'data-count': '3'}, li: ['one', 'two', 'three']});</script>
```
Which yields:
```
<ul class="list" data-count="3"><li>one</li><li>two</li><li>three</li></div>
```

Additional children that match the selector will also get pruned. Given the above markup plus:
````
<script>util.render(util.bySelector('.list'), {root: {'data-count': '2'}, li: ['four', {innerHTML: 'five', className: 'last'}]});</script>
````
The last element has now been removed. Also note in the example that `'four'` is shorthand for `{innerHTML: 'four'}`.
```
<ul class="list" data-count="2"><li>four</li><li class="last">five</li></div>
```

# Further Examples

The above examples demonstrate rendering against the live DOM. If many items are going to be edited at a time then it's recommended to use a document fragment. Document fragments are considered templates and will be cloned each time they're rendered. Since the live DOM isn't being edited, a fragment also gets returned from `render` so it can be added to the document where needed.

In the above examples we're also operating directly on the nodes that are matched. Frequently we want to match a wrapper node and then operate on different elements within that wrapper. This is also possible using the `render` property as follows:

```
<script>
var template = util.frag('<div class="wrapper"><h2></h2><p></p><ul><li></li></ul>');
var rendered = util.render(template, {'.wrapper': [
    {render: {h2: 'Title', p: 'About this module.', 'ul li': ['Point one', 'Point two']}},
    {render: {h2: 'Another Title', p: 'About this module.', 'ul li': ['Point one']}}
]});
document.body.appendChild(rendered);
</script>
```

Yields:

```
<div class="wrapper">
    <h2>Title</h2>
    <p>About this module.</p>
    <ul>
        <li>Point one</li>
        <li>Point two</li>
    </ul>
</div>
<div class="wrapper">
    <h2>Another Title</h2>
    <p>About this module.</p>
    <ul>
        <li>Point one</li>
    </ul>
</div>
```

You could then render directly to `body` if you wanted to replace the wrappers with one or more children.

```
<script>
var rendered = util.render(document.body, {'.wrapper': [
    {render: {h2: 'New Title', p: 'I replace the rest since render will prune.', 'ul': {remove: true}}}
]});
</script>
```
