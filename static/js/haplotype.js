/*
  Parameters
*/
const data = {
  // Defaults
  canvas: {width: 1200, height: 1000, magic: 5},
  margin: {top: 10, bottom: 90, left: 90, right: 10},
  lang: "ja",
  dataname: "2nd wave B.1.1.284",
  wavename: "2W",
  wavelabel: "2nd wave",
  files: {
    /* Default haplotypes data (data.haplotypes.all: data.points > data.haplotypes.selected , data.haplotypes.visible) */
    haplotypes: "data/2W-durations-50p.tsv",
    selectlist: "data/2W-selectlist.json",
    /* Default mutations in haplotypes (data.mutations) */
    mutations: "data/2W-mutations.json",
    /* Genome and gene annotations (data.genome, data.genes) */
    annotations: "data/annotations.json",
    /* JIS X 0401 prefecture codes (data.areas, data.prefectures, data.offset) */
    districts: "data/districts.json"
  },

  // Options
  datasets: [
    { /* 2nd wave data (50%) */
      dataname: "2nd wave B.1.1.284",
      wavename: "2W",
      wavelabel: "2nd wave",
      haplotypes: "data/2W-durations-50p.tsv",
      selectlist: "data/2W-selectlist.json",
      mutations: "data/2W-mutations.json"
    },
    { /* 3rd wave data (50%) */
      dataname: "3rd wave B.1.1.214",
      wavelabel: "3rd wave",
      wavename: "3W",
      haplotypes: "data/3W-durations-50p.tsv",
      selectlist: "data/3W-selectlist.json",
      mutations: "data/3W-mutations.json"
    },
    { /* 4th wave data (Alpha) (50%) */
      dataname: "4th wave Alpha B.1.1.7",
      wavelabel: "4th wave",
      wavename: "4W",
      haplotypes: "data/4W-durations-50p.tsv",
      selectlist: "data/4W-selectlist.json",
      mutations: "data/4W-mutations.json"
    },
    { /* 5th wave data (Delta/AY.29) (50%) */
      dataname: "5th wave Delta AY.29",
      wavelabel: "5th wave",
      wavename: "5W",
      haplotypes: "data/5W-durations-50p.tsv",
      selectlist: "data/5W-selectlist.json",
      mutations: "data/5W-mutations.json"
    }
  ],

  resolutions: [
    { /* HD (1920x1080) */
      id: "resolution-hd",
      canvas: {width: 1920, height: 1000, magic: 3}
    },
    { /* 4K (3840x2160) */
      id: "resolution-4k",
      canvas: {width: 3840, height: 1000, magic: 5}
    },
    { /* 8K (7680x4320) */
      id: "resolution-8k",
      canvas: {width: 7680, height: 1000, magic: 11}
    }
  ],

  pallet: d3.scaleOrdinal(d3.schemeTableau10),
  nodeR: 5,
  edgeW: 2,
  haplotypes: {
    set: new Set(),
    all: [],
    selected: [],
    visible: [],
    emerged: []
  }
};

/*
  Code
*/
setup();

function setup() {
  wipeAll();
  data.scaleX = d3.scaleTime()
    .range([data.margin.left, data.canvas.width - data.margin.right]);
  data.scaleY = d3.scaleLinear()
    .range([data.canvas.height - data.margin.bottom, data.margin.top]);

  Promise.all([
    loadDistricts(),
    loadGenome(),
    loadMutations(),
    loadSelectlist(),
    loadHaplotypes()
  ]).then(() => {
    initHaplotypes();
    prepareHTML();
    drawAxes();
    drawArea();
    updateAll();
  });
}

function initHaplotypes() {
  const all = Array.from(data.haplotypes.set);
  data.haplotypes.all = all;
  data.haplotypes.selected = all;
  data.haplotypes.visible = all;
  data.haplotypes.emerged = all.map(haplotype => {
    const haplotypes = data.points.filter(point => point.haplotype == haplotype)
    const emerged = d3.min(haplotypes, d => d.firstday);
    return haplotypes.filter(point => point.firstday == emerged).shift()
  }).filter(haplotype => haplotype);  // Remove undefined from map
}

function updateAll() {
  updateGenome();
  updateChart();
}

function updateGenome() {
  drawGenome();
  drawMutations();
}

function updateChart() {
  //drawLineage();
  drawTrace();
  drawHaplotype();
  //toggleLineage();
  toggleTrace();
  toggleDuration();
}

function wipeAll() {
  d3.select("svg#genome").selectAll("*").remove()
  d3.select("svg#chart").selectAll("*").remove()
}

function changeHaplotypes() {
  if (this.options) {
    data.haplotypes.selected = Array.from(this.options).filter(d => d.selected).map(d => d.value);
    // Reset if options include All or none selected
    if (data.haplotypes.selected.includes("All") || data.haplotypes.selected.size == 0) {
      data.haplotypes.selected = data.haplotypes.all;
    }
  } else {
    data.haplotypes.selected = data.haplotypes.all;
  }
  data.haplotypes.visible = data.haplotypes.selected;
  updateAll();
}

function brushHaplotypes() {
  if (d3.event.selection) {
    const [minX, maxX] = d3.event.selection;
    const minDate = Date.parse(data.scaleX.invert(minX));
    const maxDate = Date.parse(data.scaleX.invert(maxX));
    const brushed = data.points.filter(point => {
      if (checkSelector("#duration")) {
        return (
          (point.firstday > minDate && point.firstday < maxDate) ||
          (point.lastday  > minDate && point.lastday  < maxDate)
        );
      } else {
        return (point.firstday > minDate && point.firstday < maxDate)
      }
    }).filter(point => {
      if (data.haplotypes.selected.includes(point.haplotype)) {
        return point;
      }
    });
    data.haplotypes.visible = uniqHaplotypes(brushed);
  } else {
    data.haplotypes.visible = data.haplotypes.selected;
  }
  updateAll();
}

function pickPrefecture(d) {
  wipePrefecture();
  const prefecture = Object.values(data.prefectures).filter(pref => pref.code == data.offset - d).shift();
  const picked = data.points.filter(point => {
    return point.prefecture == prefecture.name
  }).filter(point => {
    if (data.haplotypes.selected.includes(point.haplotype)) {
      return point;
    }
  })
  data.haplotypes.visible = uniqHaplotypes(picked);
  showPrefecture(prefecture);
  updateAll();
}

function showPrefecture(prefecture) {
  const onerow = data.scaleY(2) - data.scaleY(1);
  const y1 = data.scaleY(data.offset - prefecture.code);
  const y2 = data.scaleY(data.offset - prefecture.code - 1);
  d3.select("svg#chart").append("g").attr("class", "prefectures");
  d3.select("svg#chart").select(".prefectures")
    .append("rect")
    .attr("class", "prefecture")
    .attr("x", data.margin.left)
    .attr("y", y1 + onerow / 2 + 3)
    .attr("width", data.canvas.width - (data.margin.left + data.margin.right))
    .attr("height", y2 - y1 - 6)
    .style("fill", "#999999")
    .style("opacity", 0.3);
}

function wipePrefecture() {
  wipeSelector(".prefectures")
}

function uniqHaplotypes(haplotypes) {
  let uniq = new Set();
  haplotypes.map(d => uniq.add(d.haplotype));
  return Array.from(uniq).sort();
}

function toggleHaplotype(haplotype) {
  if (data.haplotypes.selected[0] == haplotype && ! data.haplotypes.selected[1]) {
    data.haplotypes.visible = data.haplotypes.selected
  } else {
    data.haplotypes.visible = [ haplotype ];
  }
  updateAll();
}

function toggleLineage() {
  if (checkSelector("#lineage")) {
    showSelector(".lineages");
    d3.selectAll(".firstday.emerged").style("stroke", "#666666");
  } else {
    hideSelector(".lineages");
    d3.selectAll(".firstday.emerged").style("stroke", "");
  }
}

function toggleTrace() {
  if (checkSelector("#trace")) {
    showSelector(".traces");
    showSelector(".firstday.traced");
  } else {
    hideSelector(".traces");
    hideSelector(".firstdaqy.traced");
  }
}

function toggleDuration() {
  if (checkSelector("#duration")) {
    showSelector(".durations");
    showSelector(".lastdays");
  } else {
    hideSelector(".durations");
    hideSelector(".lastdays");
  }
}

function toggleLang() {
  if (data.lang == "en") {
    data.lang = "ja";
    d3.select("html").attr("lang", "ja");
    d3.select("#help-link").attr("href", "https://ktym.github.io/covid19/help-ja")
    wipeSelector(".axis-y");
    drawAxisY();
  } else {
    data.lang = "en";
    d3.select("html").attr("lang", "en");
    d3.select("#help-link").attr("href", "https://ktym.github.io/covid19/help-en")
    wipeSelector(".axis-y");
    drawAxisY();
  }
}

function changeDataset() {
  const selected = Array.from(this.options).filter(d => d.selected).shift();
  data.wavelabel = selected.value;
  const dataset = data.datasets.filter(d => d.wavelabel == data.wavelabel).shift();
  data.dataname = dataset.dataname;
  data.wavename = dataset.wavename;
  data.files.haplotypes = dataset.haplotypes;
  data.files.selectlist = dataset.selectlist;
  data.files.mutations = dataset.mutations;
  data.haplotypes.all = new Set();
  setup();
}

function loadDistricts() {
  return d3.json(data.files.districts).then(districts => {
    data.areas = districts.regions;
    data.prefectures = districts.locations;
    data.offset = Object.keys(data.prefectures).length + 1;
  });
}

function loadGenome() {
  return d3.json(data.files.annotations).then(annotations => {
    data.genome = annotations["Genome"].shift();
    data.genes = annotations["Genes"];
  });
}

function loadMutations() {
  return d3.json(data.files.mutations).then(mutations => {
    data.mutations = mutations;
  });
}

function loadSelectlist() {
  return d3.json(data.files.selectlist).then(selectlist => {
    data.selectlist = selectlist.haplotypes;
  });
}

function loadHaplotypes() {
  const oneday = Date.parse("2022-03-10") - Date.parse("2022-03-09");
  return d3.tsv(data.files.haplotypes, row => {
    data.haplotypes.set.add(row.haplotype);
    return {
      haplotype: row.haplotype,
      firstday: Date.parse(row.first),
      lastday: Date.parse(row.last),
      duration: parseInt(row.duration),
      total: parseInt(row.total),
      prefecture: row.prefecture
    }
  }).then(dataset => {
    data.points = dataset;
    data.scaleX.domain([
      d3.min(dataset, d => d.firstday) - oneday,
      d3.max(dataset, d => d.lastday) + oneday
    ]);
    data.scaleY.domain(
      d3.extent(dataset, d => data.prefectures[d.prefecture].code)
    );
  });
}

function prepareHTML() {
  // Haplotype menu
  let options = data.selectlist;
  options.unshift("All");
  d3.select("#haplotype")
    .selectAll("option")
    .data(options)
    .join("option")
    .attr("value", d => d)
    .text(d => d);
  // Dataset menu
  d3.select("#dataset")
    .selectAll("option")
    .data(data.datasets)
    .join("option")
    .attr("value", d => d.wavelabel)
    .text(d => d.wavelabel)
  // SVG canvas
  d3.select("svg#genome")
    .attr("width", data.canvas.width)
    .attr("viewBox", `0 0 ${data.canvas.width} 100`);
  d3.select("svg#chart")
    .attr("width", data.canvas.width)
    .attr("viewBox", `0 0 ${data.canvas.width} 1000`);
  // Navbar
  d3.select("#dataname")
    .text(data.dataname);
  d3.select("#recommended-width")
    .text(data.canvas.width);
  // Infobox
  d3.select("#infobox-haplotype")
    .style("margin-left", `${data.margin.left}px`);
  // Events
  d3.select("#haplotype")
    .on("change", changeHaplotypes);
  d3.select("#dataset")
    .on("change", changeDataset);
  //d3.select("#lineage")
  //  .on("change", toggleLineage);
  d3.select("#trace")
    .on("change", toggleTrace);
  d3.select("#duration")
    .on("change", toggleDuration);
  d3.select(window)
    .on("resize", updateGenome);
//      d3.select("#resolution-label")
//        .on("mouseenter", showResolutionHint)
//        .on("mouseleave", hideResolutionHint);
  d3.select("#resolution-hd")
    .on("click", changeResolution);
  d3.select("#resolution-4k")
    .on("click", changeResolution);
  d3.select("#resolution-8k")
    .on("click", changeResolution);
  d3.select("#lang")
    .on("click", toggleLang);
//      d3.select("#download")
//        .on("click", downloadChartSVG);
}

function drawAxes() {
  drawAxisX();
  drawAxisY();
  drawGridX();
  drawGridY();
}

function drawAxisX() {
  const axisX = d3.axisBottom(data.scaleX)
    .ticks(50)
    .tickSize(0)
    .tickFormat(d3.timeFormat("%Y-%m-%d"));
  d3.select("svg#chart")
    .append("g")
    .attr("class", "axis-x")
    .call(axisX)
    // rotate X label
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("transform", "rotate(90)")
    .attr("x", data.canvas.height - data.margin.bottom)
    .attr("y", 0)
    .attr("dx", "1.5em")   // padding
    .attr("dy", ".35em");  // base line
}

function drawAxisY() {
  const prefectures = Object.values(data.prefectures);
  const axisY = d3.axisLeft(data.scaleY)
    .tickPadding(5)
    .ticks(data.offset, "c")
    .tickSize(0)
    .tickFormat(d => {
      let pref = prefectures.filter(p => p.code == data.offset - d).shift();
      if (data.lang == "en") {
        return pref.name;
      } else {
        return pref.label;
      }
    });
  d3.select("svg#chart")
    .append("g")
    .attr("class", "axis-y")
    .attr("transform", `translate(${[data.margin.left, 0]})`)
    .call(axisY)
    .selectAll("text").on("click", pickPrefecture);
}

function drawGridX() {
  const axisXgrid = d3.axisBottom(data.scaleX)
    .ticks(50)
    .tickSize(data.canvas.height - data.margin.bottom + 10);
  d3.select("svg#chart")
    .append("g")
    .attr("class", "axis-x-grid")
    .call(axisXgrid)
    .selectAll("text").remove();
}

function drawGridY() {
  const axisYgrid = d3.axisLeft(data.scaleY)
    .ticks(data.offset, "c")
    .tickSize(data.canvas.width - (data.margin.left + data.margin.right));
  d3.select("svg#chart")
    .append("g")
    .attr("class", "axis-y-grid")
    .attr("transform", `translate(${[data.canvas.width - data.margin.right, 0]})`)
    .call(axisYgrid)
    .selectAll("text").remove();
}

function drawArea() {
  const onerow = data.scaleY(2) - data.scaleY(1);
  d3.select("svg#chart").append("g").attr("class", "areas");
  for (let area of data.areas) {
    let y1 = data.scaleY(data.offset - data.prefectures[area.top].code);
    let y2 = data.scaleY(data.offset - data.prefectures[area.bottom].code - 1);
    d3.select("svg#chart").select(".areas")
      .append("rect")
      .attr("class", "area")
      .attr("x", data.margin.left)
      .attr("y", y1 + onerow / 2)
      .attr("width", data.canvas.width - (data.margin.left + data.margin.right))
      .attr("height", y2 - y1)
      .attr("fill", data.pallet(area.label));
  }
  // Brush
  data.brushX = d3.brushX()
    .extent([[data.margin.left, 0], [data.canvas.width, data.canvas.height]])
    .on("end", brushHaplotypes);
  d3.select("svg#chart").select(".areas").call(data.brushX);
}

function drawGenome() {
  wipeGenome();
  const genomeWidth = data.canvas.width;
  // Resize
  //const windowWidth = d3.select("body").node().getBoundingClientRect().width;
  //const genomeWidth = windowWidth - data.margin.left - data.margin.right;
  data.scaleG = d3.scaleLinear()
    .range([data.margin.left, genomeWidth])
    .domain([data.genome.lower, data.genome.upper]);
  const axisG = d3.axisBottom(data.scaleG)
    .ticks(25)
    .tickSize(5);
  d3.select("svg#genome")
    .attr("width", genomeWidth)
    .attr("viewBox", `0 0 ${genomeWidth + data.margin.right} 100`);
  d3.select("svg#genome")
    .append("g")
    .attr("class", "axis-g")
    .call(axisG)
    .attr("transform", `translate(0, 80)`);
  d3.select("svg#genome")
    .append("g")
    .selectAll("rect.region")
    .data(data.genes)
    .join("rect")
    .attr("class", "region")
    .attr("x", d => data.scaleG(d.lower))
    .attr("y", d => d.region != "" ? 50 : 55)
    .attr("width", d => data.scaleG(d.upper) - data.scaleG(d.lower))
    .attr("height", d => d.region != "" ? 10 : 1)
    .attr("stroke", "black")
    .attr("fill", d => data.pallet(d.region));
  d3.select("svg#genome")
    .selectAll("text.region")
    .data(data.genes)
    .join("text")
    .text(d => d.region)
    .attr("x", d => data.scaleG(d.lower))
    .attr("y", 75)
}

function wipeGenome() {
  d3.select("svg#genome").selectAll("g").remove();
  d3.select("svg#genome").selectAll("text").remove();
}

function drawMutations() {
  wipeMutations();
  const line = d3.line();
  // Reference
  d3.select("svg#genome")
    .append("g")
    .selectAll("path.reference-mutation")
    .data(data.mutations["Reference"])
    .join("path")
    .attr("class", "reference-mutation")
    .attr("transform", d => `translate(${data.scaleG(d.pos)},55)`)
    .attr("d", d3.symbol().type(d3.symbolDiamond))
    .style("fill", "#333333")
    .style("opacity", 0.5);
  // Mutations in haplotypes
  const mutations = uniqMutations();
  d3.select("svg#genome")
    .append("g")
    .selectAll("path.mutation")
    .data(mutations)
    .join("path")
    .attr("class", "mutation")
    .attr("d", d => line([[data.scaleG(d.pos),35],[data.scaleG(d.pos),50]]))
    .style("stroke", "#333333")
    .style("fill", "none")
    .style("opacity", 0.3);
  d3.select("svg#genome")
    .append("g")
    .selectAll("circle.mutation")
    .data(mutations)
    .join("circle")
    .attr("class", "mutation")
    .attr("r", data.nodeR)
    .attr("cx", d => data.scaleG(d.pos))
    .attr("cy", 30)
    .style("stroke", "#333333")
    .style("fill", "#333333")
    .style("opacity", 0.3);
}

function wipeMutations() {
  wipeSelector(".mutation");
  wipeSelector(".reference-mutation");
}

function uniqMutations() {
  const uniq = new Map()
  data.haplotypes.visible.map(haplotype => {
    if (data.mutations[haplotype]) {
      data.mutations[haplotype].map(mutation => uniq.set(mutation.str, mutation));
    } else {
      console.log(`ERROR: ${haplotype} has no mutation data`);
    }
  });
  return Array.from(uniq.values());
}

function drawHaplotype() {
  wipeHaplotype();
  const points = data.points.filter(d => data.haplotypes.visible.includes(d.haplotype));
  drawDuration(points);
  drawLastday(points);
  drawFirstday(points);
  toggleDuration();
}

function wipeHaplotype() {
  wipeSelector(".firstdays");
  wipeSelector(".lastdays");
  wipeSelector(".durations");
}

function drawDuration(points) {
  d3.select("svg#chart").append("g").attr("class", "durations")
  d3.select("svg#chart").select(".durations")
    .selectAll("path.duration")
    .data(points)
    .join("path")
    .attr("class", d => data.haplotypes.emerged.includes(d) ? "duration emerged" : "duration traced")
    .attr("fill", "none")
    .attr("stroke", d => data.pallet(d.haplotype))
    .attr("stroke-width", d => Math.log(d.total))
    .attr("d", d => duration(d))
    .on("mouseover", showInfoboxDuration)
    .on("click", d => toggleHaplotype(d.haplotype));
}

function duration(d) {
  x1 = data.scaleX(d.firstday) - data.canvas.magic;
  x2 = data.scaleX(d.lastday) - data.canvas.magic;
  y = data.scaleY(data.offset - data.prefectures[d.prefecture].code);
  return d3.line()([[x1,y], [x2,y]]);
}

function drawFirstday(points) {
  d3.select("svg#chart").append("g").attr("class", "firstdays")
    .selectAll("circle.firstday")
    .data(points)
    .join("circle")
    .attr("class", d => data.haplotypes.emerged.includes(d) ? "firstday emerged" : "firstday traced")
    .attr("haplotype", d => d.haplotype)
    .attr("r", data.nodeR)
    .attr("cx", d => data.scaleX(d.firstday) - data.canvas.magic)
    .attr("cy", d => data.scaleY(data.offset - data.prefectures[d.prefecture].code))
    .style("fill", d => data.pallet(d.haplotype))
    .on("click", d => toggleHaplotype(d.haplotype))
    .on("mouseover", showInfobox);
  d3.selectAll(".firstday")
    .style("fill", d => data.pallet(d.haplotype));
}

function drawLastday(points) {
  d3.select("svg#chart").append("g").attr("class", "lastdays")
    .selectAll("circle.lastday")
    .data(points)
    .join("circle")
    .attr("class", d => data.haplotypes.emerged.includes(d) ? "lastday emerged" : "lastday traced")
    .attr("haplotype", d => d.haplotype)
    .attr("r", data.nodeR)
    .attr("cx", d => data.scaleX(d.lastday) - data.canvas.magic)
    .attr("cy", d => data.scaleY(data.offset - data.prefectures[d.prefecture].code))
    .on("click", d => toggleHaplotype(d.haplotype))
    .on("mouseover", showInfoboxDuration);
  d3.selectAll(".lastday")
    .style("fill", d => data.pallet(d.haplotype));
}

function drawLineage() {
  wipeLineage();
  d3.select("svg#chart").append("g").attr("class", "lineages");
  for (let childId of data.haplotypes.visible) {
    const parentId = childId.replace(/\.[^.]+$/, '');
    if (parentId != childId) {
      const child = data.haplotypes.emerged.filter(point => point.haplotype == childId).shift();
      const parent = data.haplotypes.emerged.filter(point => point.haplotype == parentId).shift();
      if (parent) {
        const points = [parent, child]
        d3.select("svg#chart").select(".lineages")
          .append("path")
          .datum(points)
          .join("path")
          .attr("class", "lineage")
          .attr("fill", "none")
          .attr("stroke", d3.rgb("#666666"))
          .attr("stroke-dasharray", "1, 4")
          .attr("d", haploline(points));
        //if (! data.haplotypes.visible.includes(parent.haplotype)) {
        if (checkSelector("#lineage") && ! data.haplotypes.visible.includes(parent.haplotype)) {
          data.haplotypes.visible.push(parent.haplotype);
        }
      }
    }
  }
  toggleLineage();
}

function wipeLineage() {
  wipeSelector(".lineages");
}

function drawTrace() {
  wipeTrace();
  d3.select("svg#chart").append("g").attr("class", "traces");
  // Needs to be a for loop to avoid linking different haplotypes
  // not like data.haplotypes.visible.map(haplotype => {})
  for (let haplotype of data.haplotypes.visible) {
    let haplopoints = data.points.filter(d => d.haplotype == haplotype);
    if (haplopoints.length > 1) {
      d3.select("svg#chart").select(".traces")
        .append("path")
        .datum(haplopoints)
        .join("path")
        .attr("class", "trace")
        .attr("haplotype", d => d.haplotype)  // TODO: check if this works! --> seems like not
        .attr("fill", "none")
        .attr("stroke", d3.rgb("#cccccc"))
        .attr("d", haploline(haplopoints));
    }
  }
  toggleTrace();
}

function wipeTrace() {
  wipeSelector(".traces");
}

function haploline(d) {
  return d3.line()
    .x(d => data.scaleX(d.firstday) - data.canvas.magic)
    .y(d => data.scaleY(data.offset - data.prefectures[d.prefecture].code));
}

function showInfobox(d) {
  if (data.haplotypes.visible.includes(d.haplotype)) {
    d3.select("#infobox-haplotype-label")
      .text(data.wavename + ":" + d.haplotype);
    if (data.lang == "en") {
      d3.select("#infobox-haplotype-prefecture")
        .text(data.prefectures[d.prefecture].name);
    } else {
      d3.select("#infobox-haplotype-prefecture")
        .text(data.prefectures[d.prefecture].label);
    }
    d3.select("#infobox-haplotype-firstday")
      .text(d3.timeFormat("%Y-%m-%d")(d.firstday));
    d3.select("#infobox-haplotype-lastday")
      .text(d3.timeFormat("%Y-%m-%d")(d.lastday));
    d3.select("#infobox-haplotype-duration")
      .text(`${d.duration} day(s)`);
    d3.select("#infobox-haplotype-total")
      .text(`${d.total} seq(s)/pref`);
  }
}

function showInfoboxDuration(d) {
  if (checkSelector("#duration")) {
    showInfobox(d);
  }
}

function changeResolution() {
  let button = this.id;
  data.resolutions.map(resolution => {
    if (resolution.id == button) {
      d3.select(`#${resolution.id}`)
        .classed("btn-primary", true)
        .classed("btn-secondary", false);
      data.canvas = resolution.canvas;
    } else {
      d3.select(`#${resolution.id}`)
        .classed("btn-primary", false)
        .classed("btn-secondary", true)
    }
  });
  setup();
}

function showResolutionHint() {
  d3.select("#resolution-hint").style("display", "block")
}

function hideResolutionHint() {
  d3.select("#resolution-hint").style("display", "none")
}

function showSelector(selector) {
  d3.selectAll(selector)
    .classed("show", true).classed("hide", false);
}

function hideSelector(selector) {
  d3.selectAll(selector)
    .classed("show", false).classed("hide", true);
}

function wipeSelector(selector) {
  d3.selectAll(selector).remove();
}

function checkSelector(selector) {
  return d3.select(selector).property("checked")
}

function dumpSVG(container) {
  const style = d3.select("style").html();
  container.select("svg").append("style").html(style);
  const svg = container.html();
  return svg;
}
function downloadSVG(svg) {
  const blob = new Blob([svg], {type: "data:image/svg+xml;base64"});
  const url = window.URL.createObjectURL(blob);
  const filename = "haplograph-" + d3.timeFormat("%Y%m%d-%H%M%S")(new Date) + ".svg";
  d3.select("#download-link").attr("download", filename).attr("href", url);
}
function downloadGenomeSVG() {
  downloadSVG(dumpSVG(d3.select("#container-genome")));
}
function downloadChartSVG() {
  downloadSVG(dumpSVG(d3.select("#container-chart")));
}
