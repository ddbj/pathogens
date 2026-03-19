---
filename: covid19
lang_code: en
title: "COVID-19"
description: "Whole genome analysis of SARS-CoV-2 by NIG & Shizuoka Pref."
banner: "/dashboards/banners/covid19_dash.jpg"
menu:
  dashboards:
    name: Whole genome analysis of SARS-CoV-2 by NIG & Shizuoka Pref.
    identifier: covid19
dashboards_topics: [covid19]
---
This dashboard shows the SARS-CoV-2 whole genome information analyzed by the Institute of Genetics in collaboration with Shizuoka Prefecture.
The bar chart below shows the breakdown of SARS-CoV-2 genome variants (by month) that were analyzed by National Institute of Genetics at the request of Shizuoka Prefecture since April 2021.
The color chart on the right side can be scrolled down, although many bars share similar colors because there are so many mutant names. New mutant strains are listed at the bottom of the color chart.

<script type="module">
drawStackedBarChart("sars_chart", "pathogen_data.json", "SARS-CoV-2", "Number of reports per PANGO lineage");
</script>

<div id="sars_chart" style="width: 100%; height: 500px"></div>



