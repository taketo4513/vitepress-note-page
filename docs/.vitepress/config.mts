import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Take To",
    description: "Online knowledge base",
    srcDir: 'src',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        // 站点图标
        logo: '/img/logo_nav.png',
        // 自定义导航栏标题
        outlineTitle: '页面导航',
        // 侧边栏展开级别
        outline: [2, 3],
        // 导航栏配置
        nav: [
            //   { text: 'Home', link: '/' },
            {
                text: 'Java',
                items: [
                    {
                        // 该部分的标题
                        text: '入门',
                        items: [
                            { text: '基础语法', link: '/java/basic/index' },
                            { text: '集合框架', link: '/java/container/index' },
                            { text: '并发编程', link: '/java/concurrent/index' },
                            { text: '读写操作', link: '/java/io/index' }
                            //   { text: 'JVM', link: '...' },
                            //   { text: '新特性', link: '...' }
                        ]
                    },
                    {
                        // 该部分的标题
                        text: '进阶',
                        items: [
                            { text: 'Spring', link: '/java/spring/index' },
                            // { text: 'MyBatis', link: '/java/batis/index' },
                            { text: 'Cloud', link: '/java/cloud/index' },
                            { text: '日志框架', link: '/java/log/index' },
                            { text: '认证授权', link: '/java/permission/index' },
                            { text: '程序构建', link: '/java/build/index' }
                        ]
                    }
                ]
            },
            {
                text: 'JavaScript',
                items: [
                    { text: 'Java', link: '/java' },
                ]
            },
            {
                text: 'Nodejs',
                items: [
                    { text: 'Java', link: '/java' },
                ]
            },
            {
                text: 'Linux',
                items: [
                    { text: 'Java', link: '/java' },
                ]
            },
            {
                text: 'Chain',
                items: [
                    { text: 'Java', link: '/java' },
                ]
            },
            {
                text: 'Dev',
                items: [
                    { text: 'Java', link: '/java' },
                ]
            },
            {
                text: 'About',
                items: [
                    { text: 'Java', link: '/About' },
                ]
            }
        ],
        // 侧边栏配置
        sidebar: [
            {
                text: '基础语法',
                collapsed: true,

                items: [
                    { text: '简介概览', link: '/java/basic/introduce' },
                    { text: '数据类型', link: '/java/basic/data' },
                    { text: 'String', link: '/java/basic/string' },
                    { text: '运算符', link: '/java/basic/operator' },
                    { text: '流程控制', link: '/java/basic/controller' },
                    { text: '面向对象', link: '/java/basic/objectoriented' },
                    { text: '面向对象特性', link: '/java/basic/objectfeature' },
                    { text: '关键字', link: '/java/basic/keys' },
                    { text: 'Object', link: '/java/basic/object' },
                    { text: '枚举', link: '/java/basic/enumerate' },
                    { text: '接口', link: '/java/basic/interface' },
                    { text: '内部类', link: '/java/basic/innerclass' },
                    { text: '泛型', link: '/java/basic/generics' },
                    { text: '异常', link: '/java/basic/error' },
                    { text: '反射', link: '/java/basic/reflection' },
                    { text: '注解', link: '/java/basic/annotation' }
                ]
            },
            {
                text: '集合框架',
                collapsed: true,

                items: [
                    { text: '简介概览', link: '/java/container/introduce' },
                    { text: 'ArrayList', link: '/java/container/arrayList' },
                    { text: 'LinkedList', link: '/java/container/linkedlist' },
                    { text: 'HashSet', link: '/java/container/hashset' },
                    { text: 'LinkedHashSet', link: '/java/container/linkedhashset' },
                    { text: 'TreeSet', link: '/java/container/treeset' },
                    { text: 'EnumSet', link: '/java/container/enumset' },
                    { text: 'HashMap', link: '/java/container/hashmap' },
                    { text: 'TreeMap', link: '/java/container/treemap' },
                    { text: 'WeakHashMap', link: '/java/container/weakhashmap' },
                    { text: 'LinkedHashMap', link: '/java/container/linkedhashmap' },
                    { text: 'IdentityHashMap', link: '/java/container/identityhashmap' },
                    { text: 'EnumMap', link: '/java/container/enummap' },
                    { text: 'PriorityQueue', link: '/java/container/priorityqueue' },
                    { text: 'ArrayDeque', link: '/java/container/arraydeque' },
                    { text: 'Vector', link: '/java/container/vector' },
                    { text: 'Stack', link: '/java/container/stack' },
                    { text: 'Hashtable', link: '/java/container/hashtable' },
                    { text: 'CopyOnWriteArrayList', link: '/java/container/copyonwritearraylist' },
                    { text: 'ConcurrentSkipListMap', link: '/java/container/concurrentskiplistmap' },
                    { text: 'ConcurrentSkipListSet', link: '/java/container/concurrentskiplistset' },
                    { text: 'CopyOnWriteArraySet', link: '/java/container/copyonwritearrayset' },
                    { text: 'LinkedBlockingDeque', link: '/java/container/linkedblockingdeque' },
                    { text: 'ArrayBlockingQueue', link: '/java/container/arrayblockingqueue' },
                    { text: 'LinkedBlockingQueue', link: '/java/container/linkedblockingqueue' },
                    { text: 'SynchronousQueue', link: '/java/container/synchronousqueue' },
                    { text: 'LinkedTransferQueue', link: '/java/container/linkedtransferqueue' },
                    { text: 'PriorityBlockingQueue', link: '/java/container/priorityblockingqueue' },
                    { text: 'DelayQueue', link: '/java/container/delayqueue' },
                    { text: 'ConcurrentLinkedQueue', link: '/java/container/concurrentlinkedqueue' },
                    { text: 'Iterator', link: '/java/container/iterator' },
                    { text: 'Enumeration', link: '/java/container/enumeration' },
                    { text: 'Fail-fast', link: '/java/container/failfast' },
                    { text: 'Sort', link: '/java/container/sort' }
                ]
            },
            {
                text: '并发编程',
                collapsed: true,

                items: [
                    { text: '基础概念', link: '/java/concurrent/base' },
                    { text: 'Java线程', link: '/java/concurrent/thread' },
                    { text: '线程安全', link: '/java/concurrent/secure' },
                    { text: '线程状态', link: '/java/concurrent/status' },
                    { text: 'Synchronized', link: '/java/concurrent/synchronized' },
                    { text: 'ReentrantLock', link: '/java/concurrent/reentrantlock' },
                    { text: '内存模型', link: '/java/concurrent/memorymodel' },
                    { text: 'Volatile', link: '/java/concurrent/volatile' },
                    { text: 'CompareAndSwap', link: '/java/concurrent/cas' },
                    { text: '并发工具类', link: '/java/concurrent/util' },
                    { text: 'LongAdder源码', link: '/java/concurrent/longadder' },
                    { text: 'Unsafe', link: '/java/concurrent/unsafe' },
                    { text: '不可变设计', link: '/java/concurrent/final' },
                    { text: 'ThreadLocal', link: '/java/concurrent/threadlocal' },
                    { text: '阻塞队列', link: '/java/concurrent/queue' },
                    { text: '非阻塞队列', link: '/java/concurrent/noblocking' },
                    { text: '线程池使用', link: '/java/concurrent/pool' },
                    { text: '线程池原理', link: '/java/concurrent/principle' },
                    { text: '线程池调度', link: '/java/concurrent/scheduled' },
                    { text: '多线程任务拆分', link: '/java/concurrent/forkjoin' },
                    { text: 'AQS', link: '/java/concurrent/aqs' },
                    { text: 'ReentrantLock原理', link: '/java/concurrent/relock' },
                    { text: 'ReadWrite', link: '/java/concurrent/readwrite' },
                    { text: 'CountDown', link: '/java/concurrent/countdown' },
                    { text: 'CyclicBarrier', link: '/java/concurrent/cyclicbarrier' },
                    { text: 'Semaphore', link: '/java/concurrent/semaphore' },
                    { text: 'Exchanger', link: '/java/concurrent/exchanger' }
                ]
            },
            {
                text: '读写操作',
                collapsed: true,

                items: [
                    { text: '磁盘操作', link: '/java/io/file' },
                    { text: '字节操作', link: '/java/io/byte' },
                    { text: '字符操作', link: '/java/io/char' },
                    { text: '对象操作', link: '/java/io/obj' }
                ]
            },
            {
                text: 'Spring',
                collapsed: true,

                items: [
                    {
                        text: 'Spring',
                        collapsed: true,
        
                        items: [
                            { text: '简介概览', link: '/java/spring/spring/introduce' },
                            { text: '快速开始', link: '/java/spring/spring/faststart' },
                            { text: '控制反转', link: '/java/spring/spring/ioc' },
                            { text: 'SpringBean', link: '/java/spring/spring/bean' },
                            { text: '基于XML管理Bean', link: '/java/spring/spring/xml' },
                            { text: '基于注解管理Bean', link: '/java/spring/spring/anno' },
                            { text: 'SpringJDBC', link: '/java/spring/spring/jdbc' },
                            { text: 'Spring事务', link: '/java/spring/spring/transaction' },
                            { text: 'SpringResources', link: '/java/spring/spring/resources' },
                            { text: 'SpringI18n', link: '/java/spring/spring/i18n' },
                            { text: '参数校验', link: '/java/spring/spring/validator' },
                            { text: '提前编译', link: '/java/spring/spring/aot' }
                        ]
                    },
                    {
                        text: 'SpringMVC',
                        collapsed: true,
        
                        items: [
                            { text: '简介概览', link: '/java/spring/mvc/introduce' },
                            { text: '快速开始', link: '/java/spring/mvc/faststart' },
                            { text: '请求参数', link: '/java/spring/mvc/request' },
                            { text: '响应数据', link: '/java/spring/mvc/response' },
                            { text: 'RestFul', link: '/java/spring/mvc/restful' },
                            { text: '异常处理', link: '/java/spring/mvc/exception' },
                            { text: '拦截器', link: '/java/spring/mvc/interceptor' },
                            { text: '参数校验', link: '/java/spring/mvc/validator' }
                        ]
                    },
                    {
                        text: 'SpringBoot',
                        collapsed: true,
        
                        items: [
                            { text: '简介概览', link: '/java/spring/boot/introduce' },
                            { text: '快速开始', link: '/java/spring/boot/faststart' },
                            { text: '配置文件', link: '/java/spring/boot/config' },
                            { text: '项目构建', link: '/java/spring/boot/build' },
                            { text: '整合MVC', link: '/java/spring/boot/mvc' }
                        ]
                    }
                ]
            },
            {
                text: 'Cloud',
                collapsed: true,

                items: [
                    { text: '简介概览', link: '/java/cloud/introduce' },
                    { text: '服务拆分', link: '/java/cloud/split' },
                    { text: '服务调用', link: '/java/cloud/call' },
                    { text: '注册中心', link: '/java/cloud/center' },
                    { text: 'Nacos', link: '/java/cloud/nacos' },
                    { text: 'OpenFeign', link: '/java/cloud/feign' },
                    { text: '网关路由', link: '/java/cloud/gateway' },
                    { text: '服务保护', link: '/java/cloud/security' },
                    { text: 'Sentinel', link: '/java/cloud/sentinel' }
                ]
            },
            {
                text: '日志框架',
                collapsed: true,

                items: [
                    { text: '简介概览', link: '/java/log/introduce' },
                    { text: 'Log4j', link: '/java/log/log4j' },
                    { text: 'SLF4J', link: '/java/log/slf4j' },
                    { text: 'Logback', link: '/java/log/logback' },
                    { text: 'Log4j2', link: '/java/log/log4j2' },
                    { text: '应用实例', link: '/java/log/demo' }
                ]
            },
            {
                text: '程序构建',
                collapsed: true,

                items: [
                    {
                        text: 'Maven',
                        collapsed: true,
        
                        items: [
                            { text: '简介概览', link: '/java/build/maven/introduce' },
                            { text: '快速开始', link: '/java/build/maven/faststart' },
                            { text: '依赖管理', link: '/java/build/maven/manage' },
                            { text: '依赖传递与冲突', link: '/java/build/maven/conflict' },
                            { text: '工程继承与聚合', link: '/java/build/maven/extend' }
                        ]
                    },
                    {
                        text: 'Gradle',
                        collapsed: true,
        
                        items: [
                            { text: '简介概览', link: '/java/build/gradle/introduce' },
                            { text: '快速开始', link: '/java/build/gradle/faststart' },
                            { text: 'GradleWrapper', link: '/java/build/gradle/wrapper' },
                            { text: 'Groovy', link: '/java/build/gradle/groovy' },
                            { text: '生命周期', link: '/java/build/gradle/cycle' },
                            { text: 'Task', link: '/java/build/gradle/task' },
                            { text: '配置解析', link: '/java/build/gradle/config' },
                            { text: '文件操作', link: '/java/build/gradle/file' },
                            { text: 'Dependencies', link: '/java/build/gradle/depend' },
                            { text: 'Plugin', link: '/java/build/gradle/plugin' }
                        ]
                    },
                ]
            },
        ],
        // 在导航栏中展示带有图标的社交帐户链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/taketo4513' }
        ]
    }
})
