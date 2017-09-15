# RokidOS CLI

RokidOS 命令行工具，提供了如下命令：

```sh
Usage: rokid/ro [command]

ro help                 Get helps
ro devices              List connected devices
ro run [file]           Run scripts on device
ro shell <command>      Wait for an connectable device and shell
ro test <dir>           Run tests on your device
ro log <filter>         Show the logs of connected device by comma-based filter
ro install <dir>        Install the Rokid App from directory
ro build <dir>          Build the Rokid App to .rpp

rokid@${VERSION}
```

### 安装

```sh
$ npm install rokidos-cli -g
```

### 命令

这里简单介绍一下每个命令的用法

##### 应用相关

使用下面的命令可以在本地构建命令

```sh
$ ro build ./
```

然后使用`ro install`安装到设备中。

##### 脚本运行

```sh
$ ro run /path/to/your/js/file
```

上述命令会将你电脑中的脚本推到设备中的临时文件夹，再运行该文件

##### shell

使用`ro shell`可以直接进入设备终端

##### 测试

测试你的应用，首先你需要在当前目录下创建一个`tests`目录，然后在测试脚本中的代码样例如下：

```js
test('test voice play', (t) => {
  t.send(<asr>, <nlp>, <action>);
  t.assert(<event>, <value>, (data) => {
    // got event
  });
});
```

##### 日志

使用如下命令可以输出所有日志：

```sh
$ ro log
```

如果想输出特定进程的日志，则：

```sh
$ ro log ams
```

一般调试应用查看日志可以使用：

```sh
$ ro log ams,zygote
```

会输出所有`ams`以及应用进程的日志。

### 授权

Rokid, Inc @ Copyright
