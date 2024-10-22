# 线程池调度

## Timer

Timer 实现定时功能，Timer 的优点在于简单易用，但由于所有任务都是由同一个线程来调度，因此所有任务都是串行执行的，同一时间只能有一个任务在执行，前一个任务的延迟或异常都将会影响到之后的任务

```java
private static void method1() {
    Timer timer = new Timer();
    TimerTask task1 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 1");
            //int i = 1 / 0;//任务一的出错会导致任务二无法执行
            Thread.sleep(2000);
        }
    };
    TimerTask task2 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 2");
        }
    };
    // 使用 timer 添加两个任务，希望它们都在 1s 后执行
    // 但由于 timer 内只有一个线程来顺序执行队列中的任务，因此任务1的延时，影响了任务2的执行
    timer.schedule(task1, 1000);//17:45:56 c.ThreadPool [Timer-0] - task 1
    timer.schedule(task2, 1000);//17:45:58 c.ThreadPool [Timer-0] - task 2
}
```

## Scheduled

任务调度线程池 ScheduledThreadPoolExecutor 继承 ThreadPoolExecutor：

- 使用内部类 ScheduledFutureTask 封装任务
- 使用内部类 DelayedWorkQueue 作为线程池队列
- 重写 onShutdown 方法去处理 shutdown 后的任务
- 提供 decorateTask 方法作为 ScheduledFutureTask 的修饰方法，以便开发者进行扩展

构造方法：`Executors.newScheduledThreadPool(int corePoolSize)`

```java
public ScheduledThreadPoolExecutor(int corePoolSize) {
    // 最大线程数固定为 Integer.MAX_VALUE，保活时间 keepAliveTime 固定为 0
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          // 阻塞队列是 DelayedWorkQueue
          new DelayedWorkQueue());
}
```

常用 API：

- `ScheduledFuture<?> schedule(Runnable/Callable<V>, long delay, TimeUnit u)`：延迟执行任务
- `ScheduledFuture<?> scheduleAtFixedRate(Runnable/Callable<V>, long initialDelay, long period, TimeUnit unit)`：定时执行周期任务，不考虑执行的耗时，参数为初始延迟时间、间隔时间、单位
- `ScheduledFuture<?> scheduleWithFixedDelay(Runnable/Callable<V>, long initialDelay, long delay, TimeUnit unit)`：定时执行周期任务，考虑执行的耗时，参数为初始延迟时间、间隔时间、单位

基本使用：

- 延迟任务，但是出现异常并不会在控制台打印，也不会影响其他线程的执行

  ```java
  public static void main(String[] args){
      // 线程池大小为1时也是串行执行
      ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);
      // 添加两个任务，都在 1s 后同时执行
      executor.schedule(() -> {
        System.out.println("任务1，执行时间：" + new Date());
          //int i = 1 / 0;
        try { Thread.sleep(2000); } catch (InterruptedException e) { }
      }, 1000, TimeUnit.MILLISECONDS);
      
      executor.schedule(() -> {
        System.out.println("任务2，执行时间：" + new Date());
      }, 1000, TimeUnit.MILLISECONDS);
  }
  ```

- 定时任务 scheduleAtFixedRate：**一次任务的启动到下一次任务的启动**之间只要大于等于间隔时间，抢占到 CPU 就会立即执行

  ```java
  public static void main(String[] args) {
      ScheduledExecutorService pool = Executors.newScheduledThreadPool(1);
      System.out.println("start..." + new Date());
      
      pool.scheduleAtFixedRate(() -> {
          System.out.println("running..." + new Date());
          Thread.sleep(2000);
      }, 1, 1, TimeUnit.SECONDS);
  }
  
  /*start...Sat Apr 24 18:08:12 CST 2021
  running...Sat Apr 24 18:08:13 CST 2021
  running...Sat Apr 24 18:08:15 CST 2021
  running...Sat Apr 24 18:08:17 CST 2021
  ```

- 定时任务 scheduleWithFixedDelay：**一次任务的结束到下一次任务的启动之间**等于间隔时间，抢占到 CPU 就会立即执行，这个方法才是真正的设置两个任务之间的间隔

  ```java
  public static void main(String[] args){
      ScheduledExecutorService pool = Executors.newScheduledThreadPool(3);
      System.out.println("start..." + new Date());
      
      pool.scheduleWithFixedDelay(() -> {
          System.out.println("running..." + new Date());
          Thread.sleep(2000);
      }, 1, 1, TimeUnit.SECONDS);
  }
  /*start...Sat Apr 24 18:11:41 CST 2021
  running...Sat Apr 24 18:11:42 CST 2021
  running...Sat Apr 24 18:11:45 CST 2021
  running...Sat Apr 24 18:11:48 CST 2021
  ```

## 成员属性

### 成员变量

- shutdown 后是否继续执行周期任务：

  ```java
  private volatile boolean continueExistingPeriodicTasksAfterShutdown;
  ```

- shutdown 后是否继续执行延迟任务：

  ```java
  private volatile boolean executeExistingDelayedTasksAfterShutdown = true;
  ```

- 取消方法是否将该任务从队列中移除：

  ```java
  // 默认 false，不移除，等到线程拿到任务之后抛弃
  private volatile boolean removeOnCancel = false;
  ```

- 任务的序列号，可以用来比较优先级：

  ```java
  private static final AtomicLong sequencer = new AtomicLong();
  ```

## 延迟任务

ScheduledFutureTask 继承 FutureTask，实现 RunnableScheduledFuture 接口，具有延迟执行的特点，覆盖 FutureTask 的 run 方法来实现对**延时执行、周期执行**的支持。对于延时任务调用 FutureTask#run，而对于周期性任务则调用 FutureTask#runAndReset 并且在成功之后根据 fixed-delay/fixed-rate 模式来设置下次执行时间并重新将任务塞到工作队列

在调度线程池中无论是 runnable 还是 callable，无论是否需要延迟和定时，所有的任务都会被封装成 ScheduledFutureTask

成员变量：

- 任务序列号：

  ```java
  private final long sequenceNumber;
  ```

- 执行时间：

  ```java
  private long time;            // 任务可以被执行的时间，交付时间，以纳秒表示
  private final long period;    // 0 表示非周期任务，正数表示 fixed-rate 模式的周期，负数表示 fixed-delay 模式
  ```

  fixed-rate：两次开始启动的间隔，fixed-delay：一次执行结束到下一次开始启动

- 实际的任务对象：

  ```java
  RunnableScheduledFuture<V> outerTask = this;
  ```

- 任务在队列数组中的索引下标：

  ```java
  // DelayedWorkQueue 底层使用的数据结构是最小堆，记录当前任务在堆中的索引，-1 代表删除
  int heapIndex;
  ```

成员方法：

- 构造方法：

  ```java
  ScheduledFutureTask(Runnable r, V result, long ns, long period) {
      super(r, result);
      // 任务的触发时间
      this.time = ns;
      // 任务的周期，多长时间执行一次
      this.period = period;
      // 任务的序号
      this.sequenceNumber = sequencer.getAndIncrement();
  }
  ```

- compareTo()：ScheduledFutureTask 根据执行时间 time 正序排列，如果执行时间相同，在按照序列号 sequenceNumber 正序排列，任务需要放入 DelayedWorkQueue，延迟队列中使用该方法按照从小到大进行排序

  ```java
  public int compareTo(Delayed other) {
      if (other == this) // compare zero if same object
          return 0;
      if (other instanceof ScheduledFutureTask) {
          // 类型强转
          ScheduledFutureTask<?> x = (ScheduledFutureTask<?>)other;
          // 比较者 - 被比较者的执行时间
          long diff = time - x.time;
          // 比较者先执行
          if (diff < 0)
              return -1;
          // 被比较者先执行
          else if (diff > 0)
              return 1;
          // 比较者的序列号小
          else if (sequenceNumber < x.sequenceNumber)
              return -1;
          else
              return 1;
      }
      // 不是 ScheduledFutureTask 类型时，根据延迟时间排序
      long diff = getDelay(NANOSECONDS) - other.getDelay(NANOSECONDS);
      return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
  }
  ```

- run()：执行任务，非周期任务直接完成直接结束，**周期任务执行完后会设置下一次的执行时间，重新放入线程池的阻塞队列**，如果线程池中的线程数量少于核心线程，就会添加 Worker 开启新线程

  ```java
  public void run() {
      // 是否周期性，就是判断 period 是否为 0
      boolean periodic = isPeriodic();
      // 根据是否是周期任务检查当前状态能否执行任务，不能执行就取消任务
      if (!canRunInCurrentRunState(periodic))
          cancel(false);
      // 非周期任务，直接调用 FutureTask#run 执行
      else if (!periodic)
          ScheduledFutureTask.super.run();
      // 周期任务的执行，返回 true 表示执行成功
      else if (ScheduledFutureTask.super.runAndReset()) {
          // 设置周期任务的下一次执行时间
          setNextRunTime();
          // 任务的下一次执行安排，如果当前线程池状态可以执行周期任务，加入队列，并开启新线程
          reExecutePeriodic(outerTask);
      }
  }
  ```

  周期任务正常完成后**任务的状态不会变化**，依旧是 NEW，不会设置 outcome 属性。但是如果本次任务执行出现异常，会进入 setException 方法将任务状态置为异常，把异常保存在 outcome 中，方法返回 false，后续的该任务将不会再周期的执行

  ```java
  protected boolean runAndReset() {
      // 任务不是新建的状态了，或者被别的线程执行了，直接返回 false
      if (state != NEW ||
          !UNSAFE.compareAndSwapObject(this, runnerOffset, null, Thread.currentThread()))
          return false;
      boolean ran = false;
      int s = state;
      try {
          Callable<V> c = callable;
          if (c != null && s == NEW) {
              try {
                  // 执行方法，没有返回值
                  c.call();
                  ran = true;
              } catch (Throwable ex) {
                  // 出现异常，把任务设置为异常状态，唤醒所有的 get 阻塞线程
                  setException(ex);
              }
          }
      } finally {
        // 执行完成把执行线程引用置为 null
          runner = null;
          s = state;
          // 如果线程被中断进行中断处理
          if (s >= INTERRUPTING)
              handlePossibleCancellationInterrupt(s);
      }
      // 如果正常执行，返回 true，并且任务状态没有被取消
      return ran && s == NEW;
  }
  ```

  ------

  ```java
  // 任务下一次的触发时间
  private void setNextRunTime() {
      long p = period;
      if (p > 0)
          // fixed-rate 模式，【时间设置为上一次执行任务的时间 + p】，两次任务执行的时间差
          time += p;
      else
          // fixed-delay 模式，下一次执行时间是【当前这次任务结束的时间（就是现在） + delay 值】
          time = triggerTime(-p);
  }
  ```

- reExecutePeriodic()**：准备任务的下一次执行，重新放入阻塞任务队列**

  ```java
  // ScheduledThreadPoolExecutor#reExecutePeriodic
  void reExecutePeriodic(RunnableScheduledFuture<?> task) {
      if (canRunInCurrentRunState(true)) {
          // 【放入任务队列】
          super.getQueue().add(task);
          // 如果提交完任务之后，线程池状态变为了 shutdown 状态，需要再次检查是否可以执行，
          // 如果不能执行且任务还在队列中未被取走，则取消任务
          if (!canRunInCurrentRunState(true) && remove(task))
              task.cancel(false);
          else
              // 当前线程池状态可以执行周期任务，加入队列，并【根据线程数量是否大于核心线程数确定是否开启新线程】
              ensurePrestart();
      }
  }
  ```

- cancel()：取消任务

  ```java
  public boolean cancel(boolean mayInterruptIfRunning) {
      // 调用父类 FutureTask#cancel 来取消任务
      boolean cancelled = super.cancel(mayInterruptIfRunning);
      // removeOnCancel 用于控制任务取消后是否应该从阻塞队列中移除
      if (cancelled && removeOnCancel && heapIndex >= 0)
          // 从等待队列中删除该任务，并调用 tryTerminate() 判断是否需要停止线程池
          remove(this);
      return cancelled;
  }
  ```

### 延迟队列

DelayedWorkQueue 是支持延时获取元素的阻塞队列，内部采用优先队列 PriorityQueue（小根堆、满二叉树）存储元素

其他阻塞队列存储节点的数据结构大都是链表，**延迟队列是数组**，所以延迟队列出队头元素后需要**让其他元素（尾）替换到头节点**，防止空指针异常

成员变量：

- 容量：

  ```java
  private static final int INITIAL_CAPACITY = 16;       // 初始容量
  private int size = 0;                                 // 节点数量
  private RunnableScheduledFuture<?>[] queue = 
      new RunnableScheduledFuture<?>[INITIAL_CAPACITY]; // 存放节点
  ```

- 锁：

  ```java
  private final ReentrantLock lock = new ReentrantLock();   // 控制并发
  private final Condition available = lock.newCondition();  // 条件队列
  ```

- 阻塞等待头节点的线程：线程池内的某个线程去 take() 获取任务时，如果延迟队列顶层节点不为 null（队列内有任务），但是节点任务还不到触发时间，线程就去检查**队列的 leader字段**是否被占用

  - 如果未被占用，则当前线程占用该字段，然后当前线程到 available 条件队列指定超时时间 `堆顶任务.time - now()` 挂起
  - 如果被占用，当前线程直接到 available 条件队列不指定超时时间的挂起

  ```java
  // leader 在 available 条件队列内是首元素，它超时之后会醒过来，然后再次将堆顶元素获取走，获取走之后，take()结束之前，会调用是 available.signal() 唤醒下一个条件队列内的等待者，然后释放 lock，下一个等待者被唤醒后去到 AQS 队列，做 acquireQueue(node) 逻辑
  private Thread leader = null;
  ```

成员方法

- offer()：插入节点

  ```java
  public boolean offer(Runnable x) {
      // 判空
      if (x == null)
          throw new NullPointerException();
      RunnableScheduledFuture<?> e = (RunnableScheduledFuture<?>)x;
      // 队列锁，增加删除数据时都要加锁
      final ReentrantLock lock = this.lock;
      lock.lock();
      try {
          int i = size;
          // 队列数量大于存放节点的数组长度，需要扩容
          if (i >= queue.length)
              // 扩容为原来长度的 1.5 倍
              grow();
          size = i + 1;
          // 当前是第一个要插入的节点
          if (i == 0) {
              queue[0] = e;
              // 修改 ScheduledFutureTask 的 heapIndex 属性，表示该对象在队列里的下标
              setIndex(e, 0);
          } else {
              // 向上调整元素的位置，并更新 heapIndex 
              siftUp(i, e);
          }
          // 情况1：当前任务是第一个加入到 queue 内的任务，所以在当前任务加入到 queue 之前，take() 线程会直接
          //        到 available 队列不设置超时的挂起，并不会去占用 leader 字段，这时需会唤醒一个线程 让它去消费
            // 情况2：当前任务【优先级最高】，原堆顶任务可能还未到触发时间，leader 线程设置超时的在 available 挂起
          //        原先的 leader 等待的是原先的头节点，所以 leader 已经无效，需要将 leader 线程唤醒，
          //        唤醒之后它会检查堆顶，如果堆顶任务可以被消费，则直接获取走，否则继续成为 leader 等待新堆顶任务
          if (queue[0] == e) {
              // 将 leader 设置为 null
              leader = null;
              // 直接随便唤醒等待头结点的阻塞线程
              available.signal();
          }
      } finally {
          lock.unlock();
      }
      return true;
  }
  ```

  ------

  ```java
  // 插入新节点后对堆进行调整，进行节点上移，保持其特性【节点的值小于子节点的值】，小顶堆
  private void siftUp(int k, RunnableScheduledFuture<?> key) {
      while (k > 0) {
          // 父节点，就是堆排序
          int parent = (k - 1) >>> 1;
          RunnableScheduledFuture<?> e = queue[parent];
          // key 和父节点比，如果大于父节点可以直接返回，否则就继续上浮
          if (key.compareTo(e) >= 0)
              break;
          queue[k] = e;
          setIndex(e, k);
          k = parent;
      }
      queue[k] = key;
      setIndex(key, k);
  }
  ```

- poll()：非阻塞获取头结点，**获取执行时间最近并且可以执行的**

  ```java
  // 非阻塞获取
  public RunnableScheduledFuture<?> poll() {
      final ReentrantLock lock = this.lock;
      lock.lock();
      try {
          // 获取队头节点，因为是小顶堆
          RunnableScheduledFuture<?> first = queue[0];
          // 头结点为空或者的延迟时间没到返回 null
          if (first == null || first.getDelay(NANOSECONDS) > 0)
              return null;
          else
              // 头结点达到延迟时间，【尾节点成为替代节点下移调整堆结构】，返回头结点
              return finishPoll(first);
      } finally {
          lock.unlock();
      }
  }
  ```

  ------

  ```java
  private RunnableScheduledFuture<?> finishPoll(RunnableScheduledFuture<?> f) {
      // 获取尾索引
      int s = --size;
      // 获取尾节点
      RunnableScheduledFuture<?> x = queue[s];
      // 将堆结构最后一个节点占用的 slot 设置为 null，因为该节点要尝试升级成堆顶，会根据特性下调
      queue[s] = null;
      // s == 0 说明 当前堆结构只有堆顶一个节点，此时不需要做任何的事情
      if (s != 0)
          // 从索引处 0 开始向下调整
          siftDown(0, x);
      // 出队的元素索引设置为 -1
      setIndex(f, -1);
      return f;
  }
  ```

- take()：阻塞获取头节点，读取当前堆中最小的也就是触发时间最近的任务

  ```java
  public RunnableScheduledFuture<?> take() throws InterruptedException {
      final ReentrantLock lock = this.lock;
      // 保证线程安全
      lock.lockInterruptibly();
      try {
          for (;;) {
              // 头节点
              RunnableScheduledFuture<?> first = queue[0];
              if (first == null)
                  // 等待队列不空，直至有任务通过 offer 入队并唤醒
                  available.await();
              else {
                  // 获取头节点的延迟时间是否到时
                  long delay = first.getDelay(NANOSECONDS);
                  if (delay <= 0)
                      // 到达触发时间，获取头节点并调整堆，重新选择延迟时间最小的节点放入头部
                      return finishPoll(first);
                  
                  // 逻辑到这说明头节点的延迟时间还没到
                  first = null;
                  // 说明有 leader 线程在等待获取头节点，当前线程直接去阻塞等待
                  if (leader != null)
                      available.await();
                  else {
                      // 没有 leader 线程，【当前线程作为leader线程，并设置头结点的延迟时间作为阻塞时间】
                      Thread thisThread = Thread.currentThread();
                      leader = thisThread;
                      try {
                          // 在条件队列 available 使用带超时的挂起（堆顶任务.time - now() 纳秒值..）
                          available.awaitNanos(delay);
                          // 到达阻塞时间时，当前线程会从这里醒来来
                      } finally {
                          // t堆顶更新，leader 置为 null，offer 方法释放锁后，
                          // 有其它线程通过 take/poll 拿到锁,读到 leader == null，然后将自身更新为leader。
                          if (leader == thisThread)
                              // leader 置为 null 用以接下来判断是否需要唤醒后继线程
                              leader = null;
                      }
                  }
              }
          }
      } finally {
          // 没有 leader 线程，头结点不为 null，唤醒阻塞获取头节点的线程，
          // 【如果没有这一步，就会出现有了需要执行的任务，但是没有线程去执行】
          if (leader == null && queue[0] != null)
              available.signal();
          lock.unlock();
      }
  }
  ```

- remove()：删除节点，堆移除一个元素的时间复杂度是 O(log n)，**延迟任务维护了 heapIndex**，直接访问的时间复杂度是 O(1)，从而可以更快的移除元素，任务在队列中被取消后会进入该逻辑

  ```java
  public boolean remove(Object x) {
      final ReentrantLock lock = this.lock;
      lock.lock();
      try {
          // 查找对象在队列数组中的下标
          int i = indexOf(x);
          // 节点不存在，返回 false
          if (i < 0)
              return false;
          // 修改元素的 heapIndex，-1 代表删除
          setIndex(queue[i], -1);
          // 尾索引是长度-1
          int s = --size;
          // 尾节点作为替代节点
          RunnableScheduledFuture<?> replacement = queue[s];
          queue[s] = null;
          // s == i 说明头节点就是尾节点，队列空了
          if (s != i) {
              // 向下调整
              siftDown(i, replacement);
              // 说明没发生调整
              if (queue[i] == replacement)
                  // 上移和下移不可能同时发生，替代节点大于子节点时下移，否则上移
                  siftUp(i, replacement);
          }
          return true;
      } finally {
          lock.unlock();
      }
  }
  ```

## 成员方法

### 提交任务

- schedule()：延迟执行方法，并指定执行的时间，默认是当前时间

  ```java
  public void execute(Runnable command) {
      // 以零延时任务的形式实现
      schedule(command, 0, NANOSECONDS);
  }
  ```

  ------

  ```java
  public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit) {
      // 判空
      if (command == null || unit == null) throw new NullPointerException();
      // 没有做任何操作，直接将 task 返回，该方法主要目的是用于子类扩展，并且【根据延迟时间设置任务触发的时间点】
      RunnableScheduledFuture<?> t = decorateTask(command, new ScheduledFutureTask<Void>(
                                                    command, null, triggerTime(delay, unit)));
      // 延迟执行
      delayedExecute(t);
      return t;
  }
  ```

  ------

  ```java
  // 返回【当前时间 + 延迟时间】，就是触发当前任务执行的时间
  private long triggerTime(long delay, TimeUnit unit) {
      // 设置触发的时间
      return triggerTime(unit.toNanos((delay < 0) ? 0 : delay));
  }
  long triggerTime(long delay) {
      // 如果 delay < Long.Max_VALUE/2，则下次执行时间为当前时间 +delay
      // 否则为了避免队列中出现由于溢出导致的排序紊乱,需要调用overflowFree来修正一下delay
      return now() + ((delay < (Long.MAX_VALUE >> 1)) ? delay : overflowFree(delay));
  }
  ```

  overflowFree 的原因：如果某个任务的 delay 为负数，说明当前可以执行（其实早该执行了）。阻塞队列中维护任务顺序是基于 compareTo 比较的，比较两个任务的顺序会用 time 相减。那么可能出现一个 delay 为正数减去另一个为负数的 delay，结果上溢为负数，则会导致 compareTo 产生错误的结果

  ```java
  private long overflowFree(long delay) {
      Delayed head = (Delayed) super.getQueue().peek();
      if (head != null) {
          long headDelay = head.getDelay(NANOSECONDS);
          // 判断一下队首的delay是不是负数，如果是正数就不用管，怎么减都不会溢出
          // 否则拿当前 delay 减去队首的 delay 来比较看，如果不出现上溢，排序不会乱
          // 不然就把当前 delay 值给调整为 Long.MAX_VALUE + 队首 delay
          if (headDelay < 0 && (delay - headDelay < 0))
              delay = Long.MAX_VALUE + headDelay;
      }
      return delay;
  }
  ```

- scheduleAtFixedRate()：定时执行，一次任务的启动到下一次任务的启动的间隔

  ```java
  public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period,
                                                TimeUnit unit) {
      if (command == null || unit == null)
          throw new NullPointerException();
      if (period <= 0)
          throw new IllegalArgumentException();
      // 任务封装，【指定初始的延迟时间和周期时间】
      ScheduledFutureTask<Void> sft =new ScheduledFutureTask<Void>(command, null,
                                        triggerTime(initialDelay, unit), unit.toNanos(period));
      // 默认返回本身
      RunnableScheduledFuture<Void> t = decorateTask(command, sft);
      sft.outerTask = t;
      // 开始执行这个任务
      delayedExecute(t);
      return t;
  }
  ```

- scheduleWithFixedDelay()：定时执行，一次任务的结束到下一次任务的启动的间隔

  ```java
  public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay,
                                                   TimeUnit unit) {
      if (command == null || unit == null) 
          throw new NullPointerException();
      if (delay <= 0)
          throw new IllegalArgumentException();
      // 任务封装，【指定初始的延迟时间和周期时间】，周期时间为 - 表示是 fixed-delay 模式
      ScheduledFutureTask<Void> sft = new ScheduledFutureTask<Void>(command, null,
                                        triggerTime(initialDelay, unit), unit.toNanos(-delay));
      RunnableScheduledFuture<Void> t = decorateTask(command, sft);
      sft.outerTask = t;
      delayedExecute(t);
      return t;
  }
  ```

### 运行任务

- delayedExecute()：**校验线程池状态**，延迟或周期性任务的主要执行方法

  ```java
  private void delayedExecute(RunnableScheduledFuture<?> task) {
      // 线程池是 SHUTDOWN 状态，需要执行拒绝策略
      if (isShutdown())
          reject(task);
      else {
          // 把当前任务放入阻塞队列，因为需要【获取执行时间最近的】，当前任务需要比较
          super.getQueue().add(task);
          // 线程池状态为 SHUTDOWN 并且不允许执行任务了，就从队列删除该任务，并设置任务的状态为取消状态
          if (isShutdown() && !canRunInCurrentRunState(task.isPeriodic()) && remove(task))
              task.cancel(false);
          else
              // 可以执行
              ensurePrestart();
      }
  }
  ```

- ensurePrestart()：**开启线程执行任务**

  ```java
  // ThreadPoolExecutor#ensurePrestart
  void ensurePrestart() {
      int wc = workerCountOf(ctl.get());
      // worker数目小于corePoolSize，则添加一个worker。
      if (wc < corePoolSize)
          // 第二个参数 true 表示采用核心线程数量限制，false 表示采用 maximumPoolSize
          addWorker(null, true);
      // corePoolSize = 0的情况，至少开启一个线程，【担保机制】
      else if (wc == 0)
          addWorker(null, false);
  }
  ```

- canRunInCurrentRunState()：任务运行时都会被调用以校验当前状态是否可以运行任务

  ```java
  boolean canRunInCurrentRunState(boolean periodic) {
      // 根据是否是周期任务判断，在线程池 shutdown 后是否继续执行该任务，默认非周期任务是继续执行的
      return isRunningOrShutdown(periodic ? continueExistingPeriodicTasksAfterShutdown :
                                 executeExistingDelayedTasksAfterShutdown);
  }
  ```

- onShutdown()：删除并取消工作队列中的不需要再执行的任务

  ```java
  void onShutdown() {
      BlockingQueue<Runnable> q = super.getQueue();
      // shutdown 后是否仍然执行延时任务
      boolean keepDelayed = getExecuteExistingDelayedTasksAfterShutdownPolicy();
      // shutdown 后是否仍然执行周期任务
      boolean keepPeriodic = getContinueExistingPeriodicTasksAfterShutdownPolicy();
      // 如果两者皆不可，则对队列中【所有任务】调用 cancel 取消并清空队列
      if (!keepDelayed && !keepPeriodic) {
          for (Object e : q.toArray())
              if (e instanceof RunnableScheduledFuture<?>)
                  ((RunnableScheduledFuture<?>) e).cancel(false);
          q.clear();
      }
      else {
          for (Object e : q.toArray()) {
              if (e instanceof RunnableScheduledFuture) {
                  RunnableScheduledFuture<?> t = (RunnableScheduledFuture<?>)e;
                  // 不需要执行的任务删除并取消，已经取消的任务也需要从队列中删除
                  if ((t.isPeriodic() ? !keepPeriodic : !keepDelayed) ||
                      t.isCancelled()) {
                      if (q.remove(t))
                          t.cancel(false);
                  }
              }
          }
      }
      // 因为任务被从队列中清理掉，所以需要调用 tryTerminate 尝试【改变线程池的状态】
      tryTerminate();
  }
  ```
