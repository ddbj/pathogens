# pathogens
Pathogens Potal project

## 目次

- [Hugoのバージョン](#Hugoのバージョン)
- [セットアップ](#セットアップ)
- [Hugoの設定](#Hugoの設定)
- [Webページの自動更新](#Webページの自動更新)

## Hugoのバージョン

- 0.123.7及び0.145.0-0.147.6で動作確認済みです。
- Ubuntuのaptを使用した場合は0.123.7が、snapを使用した場合は0.147.6がインストールされます。(2025/6/4時点)

## セットアップ
　以下のコマンドを実行することで`http://[自PCのIPアドレス]:1313/`から、Hugoのテストサーバーにアクセスできるようになります。(snap版の場合、/snap/bin/hugoにインストールされるため、パスを通すか、絶対パスで実行する必要がある）

```
$ cd ~
$ git clone https://github.com/ddbj/pathogens.git
$ cd pathogens/themes/
$ git clone https://github.com/ScilifelabDataCentre/node-pathogens-portal-theme.git
$ cd ..
$ sudo hugo serve --bind 0.0.0.0 --baseURL=http://[自PC のIP アドレス]
```

## Hugoの設定

　hugo.yamlにて、Hugoの設定変更が行えます。詳細は[公式ドキュメント](https://gohugo.io/getting-started/configuration/)を参照してください。

## Webページの自動更新

- リポジトリが更新されたタイミングで、コンテンツはビルドされGitHub Pagesのページが自動更新されます。
- URLは[https://ddbj.github.io/pathogens/](https://ddbj.github.io/pathogens/)です。
