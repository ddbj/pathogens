---
title: "グラフサンプル"
description: "plotly.jsを使った、Swedenの類似グラフ"
banner: "/dashboards/banners/internal_dash.jpg"
menu:
  dashboards:
    name: グラフサンプル
    identifier: graph_dashboard
dashboards_topics: [demotopic3]
---
<script type="module">
drawLineChart("sars_chart", "pathogen_data.json", "SARS-CoV-2", "Number of reports per PANGO lineage");
</script>

グラフサンプル
<div id="sars_chart" style="width: 100%; height: 500px"></div>

