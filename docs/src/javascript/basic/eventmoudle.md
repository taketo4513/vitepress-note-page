# 事件模型

## 事件与事件流

`javascript`中的事件，可以理解就是在`HTML`文档或者浏览器中发生的一种交互操作，使得网页具备互动性， 常见的有加载事件、鼠标事件、自定义事件等

由于`DOM`是一个树结构，如果在父子节点绑定事件时候，当触发子节点的时候，就存在一个顺序问题，这就涉及到了事件流的概念

事件流都会经历三个阶段：

- 事件捕获阶段(capture phase)
- 处于目标阶段(target phase)
- 事件冒泡阶段(bubbling phase)

事件冒泡是一种从下往上的传播方式，由最具体的元素（触发节点）然后逐渐向上传播到最不具体的那个节点，也就是`DOM`中最高层的父节点

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Event Bubbling</title>
    </head>
    <body>
        <button id="clickMe">Click Me</button>
    </body>
</html>
```

然后，我们给`button`和它的父元素，加入点击事件

```javascript
var button = document.getElementById('clickMe');

button.onclick = function() {
  console.log('1.Button');
};
document.body.onclick = function() {
  console.log('2.body');
};
document.onclick = function() {
  console.log('3.document');
};
window.onclick = function() {
  console.log('4.window');
};
```

点击按钮，输出如下

```javascript
1.button
2.body
3.document
4.window
```

点击事件首先在`button`元素上发生，然后逐级向上传播

事件捕获与事件冒泡相反，事件最开始由不太具体的节点最早接受事件, 而最具体的节点（触发节点）最后接受事件

JavaScript中的事件流是一种机制，用于描述和处理事件在DOM树中的传播过程。

## 事件模型

事件流在前端的发展过程中经历了一些变化和演进。

### 原始事件模型（DOM0级）

在早期的JavaScript中，事件处理是通过在DOM元素上直接定义事件处理属性来实现的，称为DOM0级事件。例如，可以通过为按钮元素的`onclick`属性赋值一个函数来定义点击事件的处理程序。

```javascript
const button = document.getElementById('myButton');
button.onclick = function() {
  console.log('按钮被点击');
};
```

这种方式简单直接，但是有一个缺点是无法同时为一个元素的同一个事件类型添加多个处理程序。

### 标准事件模型（DOM2级）

随着DOM2级事件的引入，新增了`addEventListener`方法，提供了更强大和灵活的事件处理能力。`addEventListener`方法允许为一个元素的同一个事件类型添加多个处理程序，并且可以控制事件的捕获阶段。

```javascript
const button = document.getElementById('myButton');
button.addEventListener('click', function() {
  console.log('按钮被点击');
});
```

通过`addEventListener`方法，可以在一个元素上同时添加多个处理程序，而且可以使用`removeEventListener`方法移除指定的处理程序。

### IE事件模型（DOM3级）

W3C DOM3级事件进一步扩展了事件的类型和属性，引入了更多的事件类型和特性，以满足不断增长的前端开发需求。DOM3级事件规范定义了新的事件类型，如滚动事件、触摸事件、过渡事件等，以及一些新的事件属性和方法，提供更丰富的事件处理能力。

```javascript
const element = document.getElementById('myElement');
element.addEventListener('scroll', function(event) {
  console.log('元素滚动事件');
});
```

DOM3级事件的引入丰富了事件处理的能力，使得开发者可以更灵活地响应各种类型的事件。

### React与Virtual DOM

随着React等前端框架的出现，事件处理机制也发生了一些变化。React通过Virtual DOM的概念，将事件处理从直接操作DOM转移到组件层面进行管理。React利用了合成事件（SyntheticEvent）来处理事件，实现了跨浏览器的一致性和性能优化。

在React中，事件处理程序是通过特定的语法和属性绑定到组件的，而不是直接操作DOM元素。

```jsx
class MyComponent extends React.Component {
  handleClick() {
    console.log('按钮被点击');
  }

  render() {
    return <button onClick={this.handleClick}>点击按钮</button>;
  }
}
```

通过使用合成事件，React能够更高效地管理事件处理，并提供了更好的性能和开发体验。

## 事件流的属性

事件流涉及到三个主要的概念：事件捕获阶段、目标阶段和事件冒泡阶段。

### 事件捕获阶段

事件捕获阶段是事件流的第一个阶段，从根节点开始向下传播到目标元素。在事件捕获阶段中，事件依次经过每个父元素，直到达到目标元素。

在事件捕获阶段，可以使用`addEventListener`的第三个参数指定事件处理程序在捕获阶段中执行。

```javascript
element.addEventListener('click', handler, true);
```

### 目标阶段

目标阶段是事件流的第二个阶段，事件到达目标元素后被触发执行事件处理程序。

### 事件冒泡阶段

事件冒泡阶段是事件流的最后一个阶段，事件从目标元素开始向上冒泡，依次经过每个父元素，直到达到根节点。

在事件冒泡阶段，可以使用`addEventListener`的第三个参数设置为`false`或省略来指定事件处理程序在冒泡阶段中执行（默认值）。

```javascript
element.addEventListener('click', handler, false);
// 或
element.addEventListener('click', handler);
```

### 事件对象

在事件处理程序中，可以通过事件对象访问和操作相关的事件信息。事件对象提供了一些属性和方法，可以获取事件的类型、目标元素、鼠标坐标等信息。

例如，可以通过事件对象的`type`属性获取事件类型：

```javascript
element.addEventListener('click', function(event) {
  console.log(event.type); // 输出 'click'
});
```

## 应用场景

### 事件处理

事件流提供了一种机制，用于处理和响应用户的交互操作。通过在目标元素上注册事件处理程序，可以捕获和处理用户触发的事件，实现交互功能。

例如，通过在按钮上注册`click`事件处理程序，可以在按钮被点击时执行相应的代码逻辑。

```javascript
const button = document.getElementById('myButton');
button.addEventListener('click', function(event) {
  console.log('按钮被点击');
});
```

### 事件代理

事件代理（Event Delegation）是一种常见的优化技术，用于处理大量具有相似行为的子元素事件。通过在父元素上注册事件处理程序，可以利用事件冒泡机制，统一管理子元素的事件处理。

例如，可以在父元素上注册`click`事件处理程序，根据触发事件的具体子元素进行不同的操作。

```javascript
const list = document.getElementById('myList');
list.addEventListener('click', function(event) {
  if (event.target.tagName === 'LI') {
    console.log('项目被点击');
  }
});
```

### 事件委托

事件委托是一种通过将事件处理委托给父元素来提高性能和简化代码的技术。它利用事件冒泡机制，在父元素上注册一个事件处理程序，处理多个子元素的相同事件。

例如，可以在父元素上注册`click`事件处理程序，根据触发事件的子元素的不同类别执行不同的操作。

```javascript
const container = document.getElementById('myContainer');
container.addEventListener('click', function(event) {
  if (event.target.classList.contains('button')) {
    console.log('按钮被点击');
  } else if (event.target.classList.contains('link')) {
    console.log('链接被点击');
  }
});
```

## 示例代码

下面是一些示例代码，演示了事件流的应用和相关的属性：

```html
<button id="myButton">点击按钮</button>
<ul id="myList">
  <li>项目1</li>
  <li>项目2</li>
  <li>项目3</li>
</ul>
<div id="myContainer">
  <button class="button">按钮</button>
  <a href="#" class="link">链接</a>
</div>

<script>
  // 事件处理示例
  const button = document.getElementById('myButton');
  button.addEventListener('click', function(event) {
    console.log('按钮被点击');
  });

  // 事件代理示例
  const list = document.getElementById('myList');
  list.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
      console.log('项目被点击');
    }
  });

  // 事件委托示例
  const container = document.getElementById('myContainer');
  container.addEventListener('click', function(event) {
    if (event.target.classList.contains('button')) {
      console.log('按钮被点击');
    } else if (event.target.classList.contains('link')) {
      console.log('链接被点击');
    }
  });
</script>
```
