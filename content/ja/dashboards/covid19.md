---
title: "COVID-19"
description: "静岡県＋遺伝研によるSARS-CoV-2ゲノム解析"
banner: "/dashboards/banners/internal_dash.jpg"
menu:
  dashboards:
    name: covid19
    identifier: covid19
dashboards_topics: [covid19]
---
<script type="module">
drawStackedBarChart("sars_chart", "pathogen_data.json", "SARS-CoV-2", "Number of reports per PANGO lineage");
</script>

<div id="sars_chart" style="width: 100%; height: 500px"></div>

このダッシュボードでは、遺伝研が静岡県と連携して解析したSARS-CoV-2全ゲノム情報を表示しています。


