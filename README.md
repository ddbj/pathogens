# pathogens

Pathogens Potal project

## 目次

* [Hugoのバージョン](#Hugoのバージョン)
* [セットアップ](#セットアップ)
* [Hugoの設定](#Hugoの設定)
* [Webページの自動更新](#Webページの自動更新)
* [ロゴの国名の設定](#ロゴの国名の設定)
* [What's newの追加](#whats-newの追加)
* [Eventsの設定](#Eventsの設定)
* [グラフについて](#グラフについて)
* [Decap CMS](#Decap-CMS)

## Hugoのバージョン

* 0.123.7及び0.145.0-0.147.6で動作確認済みです。
* Ubuntuのaptを使用した場合は0.123.7が、snapを使用した場合は0.147.6がインストールされます。(2025/6/4時点)

## セットアップ

　以下のコマンドを実行することで`http://localhost:1313/`から、Hugoのテストサーバーにアクセスできるようになります。(snap版の場合、/snap/bin/hugoにインストールされるため、パスを通すか、絶対パスで実行する必要がある）

```
$ cd ~
$ git clone https://github.com/ddbj/pathogens.git
$ cd pathogens/themes/
$ git clone https://github.com/ScilifelabDataCentre/node-pathogens-portal-theme.git
$ cd ..
$ hugo serve --bind 0.0.0.0
```

　virtual box等の仮想マシン上でIPアドレスを振っていて、localhostからアクセスできない場合、hugoの起動オプションに「--baseURL=\[対象IPアドレス]」を追加してください

```
$ hugo serve --bind 0.0.0.0 --baseURL=http://192.168.0.X
```

## Hugoの設定

　hugo.yamlにて、Hugoの設定変更が行えます。詳細は[公式ドキュメント](https://gohugo.io/getting-started/configuration/)を参照してください。

## Webページの自動更新

* リポジトリが更新されたタイミングで、コンテンツはビルドされGitHub Pagesのページが自動更新されます。
* URLは<https://pathogens.jp/>です。

## ロゴの国名の設定

　hugo.yamlの以下の行を変更することで、ロゴの国名を変更できます。

```
params:
  country_name: "your_country_name"
```

## What's newの追加

  contents/news/以下に「ファイル名.言語コード.md」(例. news20260301.ja.md)というファイルを追加することで、What's newに自動的に追加されます。

## Eventsの削除

　イベントを表示する機能は削除しました。

## グラフについて

　contents/dashboards/以下に置かれたファイルでは、plotly.jsが使えます。

## Decap CMS
　コンテンツを[Decap CMS](https://decapcms.org/)を用いて編集できます。そのためにはdecap-serverをインストールする必要がありますが、npmが必要となります。
### npmのインストール
　以下はubuntuでのnpmのインストールの方法です。バージョンは18(2026/3/20現在)ですが、問題なく動作します。
```
$ sudo apt install npm
```
　WSLを利用している場合、もしくは最新版のnpmを利用する場合は、[nvm](https://github.com/nvm-sh/nvm)を利用します。
```
$ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
$ source ~/.bashrc
$ nvm install --lts
$ nvm use --lts
```
### Decap CMSのセットアップ
　hugoのセットアップ完了後、以下のコマンドを実行してください。
```
$ cd pathogens/
$ npm init -y
$ npm install decap-server --save-dev
$ npx decap-server
```
　decap-serverはhugoにアクセスするため、hugoも起動しておく必要がありますが、decap-serverはデーモンとして起動できないため、別ターミナルからhugoを起動します。
```
$ cd pathogens/
$ hugo server --bind=0.0.0.0
```
　この時、decap-serverからhugoへ、localhost:1313でアクセスできるようにしておく必要があります。WSLを使っている場合はそのまま動きますが、virtual box等でIPアドレスを振っていてlocalhostでアクセスできない場合、Decap CMSはログイン画面を表示してしまい、管理画面を表示できないため、localhost:1313でアクセスできるように設定してください。

　上記コマンドを実行した後は、以下のURLでアクセスできるようになります。

　　http://localhost:1313/admin/

### 新規ページの作成
　Decap CMSからはフロントマターの入力/編集が行えます。ページの新規作成時は、フロントマターのFILENAMEとLANGUAGEをもとに「[FILENAME].[LANGUAGE].md」というファイル名で保存されます。この時、LANGUAGEに「ja」を入力すれば日本語ページ、「en」を入力すれば英語ページとして認識されます。
