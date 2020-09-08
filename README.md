# yuyu

### Install

```shell
git clone https://github.com/memset0/yuyu
cd yuyu
npm install
chmod +x ./bin/yuyu
ln -s ./bin/yuyu /usr/local/bin
```

### Usage

```shell
yuyu server -p <port>    # 动态监听<port>端口
yuyu generate            # 生成静态文件
```

博客源文件应置于 `./src`，或 `YUYU_SOUCRE` 环境变量指向的目录下。

博文支持 ejs + Markdown + LaTeX 语法，并提供了一些预设函数，会依次进行解析。配置标题日期的方法类似于 Hexo。

本项目还附赠了一些有用的小功能，欢迎来玩（x