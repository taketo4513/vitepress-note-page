# 应用实例

## Log4j2

文件生成：./start.out、/logs/debug.log、/logs/info.log、/logs/warn.log、/logs/error.log

触发策略：基于文件大小触发，日志文件超过200MB，最多保留24个文件。

压缩格式：GZ

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
    <Properties>
        <Property name="logPath">logs/</Property>
        <Property name="outPath">./</Property>
    </Properties>
    <Appenders>
        <Console name="console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%F:%L) - %m%n"/>
        </Console>

        <RollingFile name="fileAppender" fileName="${outPath}start.out"
                     filePattern="${logPath}all.log.%d{yyyy-MM-dd}.%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%L) - %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="200 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="24"/>
        </RollingFile>

        <RollingFile name="debugLog" fileName="${logPath}debug.log"
                     filePattern="${logPath}debug.log.%d{yyyy-MM-dd}.%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%L) - %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="200 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="24"/>
            <Filters>
                <ThresholdFilter level="debug" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <RollingFile name="infoLog" fileName="${logPath}info.log"
                     filePattern="${logPath}info.log.%d{yyyy-MM-dd}.%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%L) - %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="200 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="24"/>
            <Filters>
                <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <RollingFile name="warnLog" fileName="${logPath}warn.log"
                     filePattern="${logPath}warn.log.%d{yyyy-MM-dd}.%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%L) - %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="200 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="24"/>
            <Filters>
                <ThresholdFilter level="warn" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <RollingFile name="errorLog" fileName="${logPath}error.log"
                     filePattern="${logPath}error.log.%d{yyyy-MM-dd}.%i.log.gz">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1}(%L) - %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="200 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="24"/>
            <Filters>
                <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <Async name="asyncConsole" bufferSize="512">
            <AppenderRef ref="console"/>
        </Async>

        <Async name="asyncFile" bufferSize="512">
            <AppenderRef ref="fileAppender"/>
        </Async>

        <Async name="asyncDEBUG" bufferSize="512">
            <AppenderRef ref="debugLog"/>
        </Async>

        <Async name="asyncINFO" bufferSize="512">
            <AppenderRef ref="infoLog"/>
        </Async>

        <Async name="asyncWARN" bufferSize="512">
            <AppenderRef ref="warnLog"/>
        </Async>

        <Async name="asyncERROR" bufferSize="512">
            <AppenderRef ref="errorLog"/>
        </Async>
    </Appenders>

    <Loggers>
        <Root level="DEBUG">
            <AppenderRef ref="asyncConsole"/>
            <AppenderRef ref="asyncFile"/>
            <AppenderRef ref="asyncDEBUG"/>
            <AppenderRef ref="asyncINFO"/>
            <AppenderRef ref="asyncWARN"/>
            <AppenderRef ref="asyncERROR"/>
        </Root>
    </Loggers>
</Configuration>
```
