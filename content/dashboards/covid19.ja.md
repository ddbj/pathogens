---
filename: covid19
lang_code: ja
title: "COVID-19"
description: "静岡県＋遺伝研が2021年より実施するSARS-CoV-2全ゲノム情報です"
banner: "/dashboards/banners/covid19_dash.jpg"
menu:
  dashboards:
    name: 静岡県と遺伝研による全ゲノム解析事業
    identifier: covid19
dashboards_topics: [covid19]
---
このダッシュボードでは、遺伝研が静岡県と連携して解析したSARS-CoV-2全ゲノム情報を表示しています。
以下の棒グラフは2021年4月より、静岡県の依頼で遺伝研が全ゲノム解析したSARS-CoV-2ゲノムの変異株内訳（月毎）です。
変異株名が非常に多いため色が似てしまいわかりにくいですが、右端のカラーチャート部分はスクロールダウンできます。
新しい変異株は下の方に記載されています。

<script type="module">
drawStackedBarChart("sars_chart", "pathogen_data.json", "SARS-CoV-2", "Number of reports per PANGO lineage");
</script>

<div id="sars_chart" style="width: 100%; height: 500px"></div>



