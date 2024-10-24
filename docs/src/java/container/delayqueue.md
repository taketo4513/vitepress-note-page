# DelayQueue

## 简介

`DelayQueue`是`java`并发包下的延时阻塞队列，常用于实现定时任务。

## 案例

```java
public class DelayQueueTest {
    public static void main(String[] args) {
        DelayQueue<Message> queue = new DelayQueue<>();

        long now = System.currentTimeMillis();

        // 启动一个线程从队列中取元素
        new Thread(() -> {
            while (true) {
                try {
                    // 将依次打印1000，2000，5000，7000，8000
                    System.out.println(queue.take().deadline - now);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();

        // 添加5个元素到队列中
        queue.add(new Message(now + 5000));
        queue.add(new Message(now + 8000));
        queue.add(new Message(now + 2000));
        queue.add(new Message(now + 1000));
        queue.add(new Message(now + 7000));
    }
}

class Message implements Delayed {
    long deadline;

    public Message(long deadline) {
        this.deadline = deadline;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return deadline - System.currentTimeMillis();
    }

    @Override
    public int compareTo(Delayed o) {
        return (int) (getDelay(TimeUnit.MILLISECONDS) - o.getDelay(TimeUnit.MILLISECONDS));
    }

    @Override
    public String toString() {
        return String.valueOf(deadline);
    }
}
```

是不是很简单，越早到期的元素越先出队。

## 源码分析

### 继承体系

![An image](/img/java/container/62.png)

从继承体系可以看到，`DelayQueue`实现了`BlockingQueue`，所以它是一个阻塞队列。

另外，`DelayQueue`还组合了一个叫做`Delayed`的接口，`DelayQueue`中存储的所有元素必须实现`Delayed`接口。

那么，`Delayed`是什么呢？

```java
public interface Delayed extends Comparable<Delayed> {

    long getDelay(TimeUnit unit);
}
```

`Delayed`是一个继承自`Comparable`的接口，并且定义了一个`getDelay()`方法，用于表示还有多少时间到期，到期了应返回小于等于`0`的数值。

### 属性

```java
// 用于控制并发的锁
private final transient ReentrantLock lock = new ReentrantLock();
// 优先级队列
private final PriorityQueue<E> q = new PriorityQueue<E>();
// 用于标记当前是否有线程在排队（仅用于取元素时）
private Thread leader = null;
// 条件，用于表示现在是否有可取的元素
private final Condition available = lock.newCondition();
```

从属性我们可以知道，延时队列主要使用优先级队列来实现，并辅以重入锁和条件来控制并发安全。

因为优先级队列是无界的，所以这里只需要一个条件就可以了。

关于优先级队列，请参考[PriorityQueue](/pages/java/container/priorityqueue/)

### 构造方法

```java
public DelayQueue() {}

public DelayQueue(Collection<? extends E> c) {
    this.addAll(c);
}
```

构造方法比较简单，一个默认构造方法，一个初始化添加集合`c`中所有元素的构造方法。

### 入队

因为`DelayQueue`是阻塞队列，且优先级队列是无界的，所以入队不会阻塞不会超时，因此它的四个入队方法是一样的。

```java
public boolean add(E e) {
    return offer(e);
}

public void put(E e) {
    offer(e);
}

public boolean offer(E e, long timeout, TimeUnit unit) {
    return offer(e);
}

public boolean offer(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        q.offer(e);
        if (q.peek() == e) {
            leader = null;
            available.signal();
        }
        return true;
    } finally {
        lock.unlock();
    }
}
```

入队方法比较简单：

1. 加锁；
2. 添加元素到优先级队列中；
3. 如果添加的元素是堆顶元素，就把`leader`置为空，并唤醒等待在条件`available`上的线程；
4. 解锁；

### 出队

因为`DelayQueue`是阻塞队列，所以它的出队有四个不同的方法，有抛出异常的，有阻塞的，有不阻塞的，有超时的。

我们这里主要分析两个，`poll()`和`take()`方法。

```java
public E poll() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        E first = q.peek();
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            return q.poll();
    } finally {
        lock.unlock();
    }
}
```

poll()方法比较简单：

1. 加锁；
2. 检查第一个元素，如果为空或者还没到期，就返回`null`；
3. 如果第一个元素到期了就调用优先级队列的`poll()`弹出第一个元素；
4. 解锁。

```java
public E take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            // 堆顶元素
            E first = q.peek();
            // 如果堆顶元素为空，说明队列中还没有元素，直接阻塞等待
            if (first == null)
                available.await();
            else {
                // 堆顶元素的到期时间
                long delay = first.getDelay(NANOSECONDS);
                // 如果小于0说明已到期，直接调用poll()方法弹出堆顶元素
                if (delay <= 0)
                    return q.poll();
                
                // 如果delay大于0 ，则下面要阻塞了
                
                // 将first置为空方便gc，因为有可能其它元素弹出了这个元素
                // 这里还持有着引用不会被清理
                first = null; // don't retain ref while waiting
                // 如果前面有其它线程在等待，直接进入等待
                if (leader != null)
                    available.await();
                else {
                    // 如果leader为null，把当前线程赋值给它
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        // 等待delay时间后自动醒过来
                        // 醒过来后把leader置空并重新进入循环判断堆顶元素是否到期
                        // 这里即使醒过来后也不一定能获取到元素
                        // 因为有可能其它线程先一步获取了锁并弹出了堆顶元素
                        // 条件锁的唤醒分成两步，先从Condition的队列里出队
                        // 再入队到AQS的队列中，当其它线程调用LockSupport.unpark(t)的时候才会真正唤醒
                        // 关于AQS我们后面会讲的^^
                        available.awaitNanos(delay);
                    } finally {
                        // 如果leader还是当前线程就把它置为空，让其它线程有机会获取元素
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 成功出队后，如果leader为空且堆顶还有元素，就唤醒下一个等待的线程
        if (leader == null && q.peek() != null)
            // signal()只是把等待的线程放到AQS的队列里面，并不是真正的唤醒
            available.signal();
        // 解锁，这才是真正的唤醒
        lock.unlock();
    }
}
```

`take()`方法稍微要复杂一些：

1. 加锁；
2. 判断堆顶元素是否为空，为空的话直接阻塞等待；
3. 判断堆顶元素是否到期，到期了直接调用优先级队列的`poll()`弹出元素；
4. 没到期，再判断前面是否有其它线程在等待，有则直接等待；
5. 前面没有其它线程在等待，则把自己当作第一个线程等待`delay`时间后唤醒，再尝试获取元素；
6. 获取到元素之后再唤醒下一个等待的线程；
7. 解锁；

## 使用场景

在很多场景我们需要用到延时任务，比如给客户异步转账操作超时后发通知告知用户，还有客户下单后多长时间内没支付则取消订单等等，这些都可以使用延时任务来实现。

1. 关闭空闲连接。服务器中，有很多客户端的连接，空闲一段时间之后需要关闭之。
2. 缓存。缓存中的对象，超过了空闲时间，需要从缓存中移出。
3. 任务超时处理。在网络协议滑动窗口请求应答式交互时，处理超时未响应的请求。

## 总结

1. `DelayQueue`是阻塞队列；
2. `DelayQueue`内部存储结构使用优先级队列；
3. `DelayQueue`使用重入锁和条件来控制并发安全；
4. `DelayQueue`常用于定时任务；

## 拓展

### java中的线程池实现定时任务是直接用的DelayQueue吗？

当然不是，`ScheduledThreadPoolExecutor`中使用的是它自己定义的内部类`DelayedWorkQueue`，其实里面的实现逻辑基本都是一样的，只不过`DelayedWorkQueue`里面没有使用现成的`PriorityQueue`，而是使用数组又实现了一遍优先级队列，本质上没有什么区别。
