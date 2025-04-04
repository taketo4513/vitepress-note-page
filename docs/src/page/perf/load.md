# 页面生命周期

在 Web 开发中，了解页面生命周期是非常重要的。页面生命周期定义了页面从加载到卸载的整个过程，包括各种事件和阶段。

## DOMContentLoaded

### 属性

- `type`：事件类型，值为 `"DOMContentLoaded"`
- `bubbles`：布尔值，指示事件是否会冒泡，默认为 `false`
- `cancelable`：布尔值，指示事件是否可以被取消，默认为 `false`
- `target`：事件的目标对象，即触发事件的元素

### API

- `EventTarget.addEventListener()`：用于注册事件监听器，以便在 DOMContentLoaded 事件触发时执行相应的处理函数。

### 应用场景

DOMContentLoaded 事件在页面的 HTML 和 DOM 树加载完成后触发，但在所有外部资源（如图像、样式表、脚本等）加载完成之前。这使得我们可以在 DOM 加载完成后执行一些操作，例如初始化页面元素、注册事件监听器、执行一些初始的 JavaScript 逻辑等。

常见的应用场景包括：

- 初始化页面元素
- 注册事件监听器
- 发送初始的 AJAX 请求
- 执行一些初始的 JavaScript 逻辑

### 示例代码

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // DOMContentLoaded 事件触发后执行的逻辑
  console.log('DOMContentLoaded event triggered');
});
```

在上面的示例中，我们使用 `addEventListener` 方法注册了一个 DOMContentLoaded 事件监听器。当 DOMContentLoaded 事件触发时，控制台将输出 `'DOMContentLoaded event triggered'`。

## load

### 属性

- `type`：事件类型，值为 `"load"`
- `bubbles`：布尔值，指示事件是否会冒泡，默认为 `false`
- `cancelable`：布尔值，指示事件是否可以被取消，默认为 `false`
- `target`：事件的目标对象，即触发事件的元素

### API

- `EventTarget.addEventListener()`：用于注册事件监听器，以便在 load 事件触发时执行相应的处理函数。

### 应用场景

load 事件在整个页面及其所有外部资源（如图像、样式表、脚本等）加载完成后触发。这意味着页面的所有内容已经可用，并且可以执行与页面渲染和交互相关的操作。

常见的应用场景包括：

- 执行一些需要页面完全加载后才能进行的操作
- 初始化和配置第三方库和插件
- 启动动画或其他视觉效果

### 示例代码

```javascript
window.addEventListener('load', function() {
  // load 事件触发后执行的逻辑
  console.log('load event triggered');
});
```

在上面的示例中，我们使用 `addEventListener` 方法注册了一个 load 事件监听器。当 load 事件触发时，控制台将输出 `'load event triggered'`。

## beforeunload

### 属性

- `type`：事件类型，值为 `"beforeunload"`
- `bubbles`：布尔值，指示事件是否会冒泡，默认为 `false`
- `cancelable`：布尔值，指示事件是否可以被取消，默认为 `true`
- `target`：事件的目标对象，即触发事件的元素

### API

- `EventTarget.addEventListener()`：用于注册事件监听器，以便在 beforeunload 事件触发时执行相应的处理函数。
- `Event.preventDefault()`：用于阻止默认的 beforeunload 行为，例如显示浏览器默认的退出提示框。

### 应用场景

beforeunload 事件在页面即将被卸载（关闭、刷新、导航到其他页面等）之前触发。它通常用于询问用户是否确定离开当前页面，并可以在事件处理函数中执行一些清理操作。

常见的应用场景包括：

- 提示用户保存未保存的数据或离开前的确认提示
- 执行清理操作，如取消未完成的 AJAX 请求、释放资源等

### 示例代码

```javascript
window.addEventListener('beforeunload', function(event) {
  // beforeunload 事件触发时执行的逻辑
  // 可以在这里提示用户保存未保存的数据或离开前的确认提示
  event.preventDefault(); // 阻止默认的 beforeunload 行为
  event.returnValue = ''; // Chrome 需要设置 returnValue 属性
});
```

在上面的示例中，我们使用 `addEventListener` 方法注册了一个 beforeunload 事件监听器。在事件处理函数中，我们可以执行一些提示用户保存数据或离开前的确认逻辑。通过调用 `preventDefault` 方法，我们阻止了默认的 beforeunload 行为，并通过设置 `returnValue` 属性（在某些浏览器中需要设置）为空字符串来确保提示框的显示。

## unload

### 属性

- `type`：事件类型，值为 `"unload"`
- `bubbles`：布尔值，指示事件是否会冒泡，默认为 `false`
- `cancelable`：布尔值，指示事件是否可以被取消，默认为 `false`
- `target`：事件的目标对象，即触发事件的元素

### API

- `EventTarget.addEventListener()`：用于注册事件监听器，以便在 unload 事件触发时执行相应的处理函数。

### 应用场景

unload 事件在页面即将被卸载（关闭、刷新、导航到其他页面等）时触发。它可以用于执行一些清理操作，如释放资源、取消未完成的请求等。

常见的应用场景包括：

- 释放页面所使用的资源，如清除定时器、取消事件监听器等
- 发送最后的统计数据或日志

### 示例代码

```javascript
window.addEventListener('unload', function() {
  // unload 事件触发后执行的逻辑
  console.log('unload event triggered');
});
```

在上面的示例中，我们使用 `addEventListener` 方法注册了一个 unload 事件监听器。当 unload 事件触发时，控制台将输出 `'unload event triggered'`。

## 总结

页面生命周期的四个重要事件：DOMContentLoaded、load、beforeunload 和 unload，定义了页面从加载到卸载的不同阶段。这些事件可以帮助我们在合适的时机执行相关的操作，提供更好的用户体验和数据处理。

- DOMContentLoaded 事件在 HTML 和 DOM 树加载完成后触发，适用于执行与 DOM 相关的初始化操作。
- load 事件在整个页面及其外部资源加载完成后触发，适用于执行与页面渲染和交互相关的操作。
- beforeunload 事件在页面即将被卸载之前触发，适用于询问用户是否确定离开页面或执行一些清理操作。
- unload 事件在页面被卸载后触发，适用于执行最后的清理操作。

了解页面生命周期事件及其应用场景对于优化页面加载和交互体验非常重要。通过合理利用这些事件，我们可以在适当的时机执行相关的逻辑，提供更好的用户交互和数据处理。
