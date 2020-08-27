# yuyu

### Install

```shell
git clone https://github.com/memset0/yuyu
cd yuyu
chmod +x ./bin/yuyu
ln -s ./bin/yuyu /usr/local/bin
```

### Usage

```shell
yuyu server -p <port>    # 动态监听<port>端口
yuyu generate            # 生成静态文件
```

博客源文件应置于 `./src`，或 `YUYU_SOUCRE` 环境变量指向的目录下。