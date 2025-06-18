fetch("../../data/test.csv")
	.then(response => response.text())
	.then(csvText => {
		const rows = csvText.trim().split("\n").map(row => row.split("\t"));
		var data = [];
		var columnCount = rows[0].length;
		for(var i = 0; i < columnCount; i ++){
			data.push([]);
		}
		for(var i = 1; i < rows.length; i ++){
			for(var j = 0; j < columnCount; j ++){
				data[j].push(rows[i][j]);
			}
		}
		var xLabels = data[0];
var data1 = {
 x: xLabels,
 y: data[1],
 name: 'Dataset 1',
 type: 'scantter',
 mode: 'lines+markers',
 marker: { symbol: 'square', size: 10, color: 'red' }
// type: 'bar'
};
var data2 = {
 x: xLabels,
 y: data[2],
 name: 'Dataset 2',
 type: 'scantter',
 mode: 'lines+markers',
 marker: { symbol: 'circle', size: 10, color: 'blue' }
// type: 'bar'
};

let showLegend = window.innerWidth < 600 ? false : true
var layout = {
 title: { text: "Sample", automargin: true },
 xaxis: { title: { text: 'B' } },
 yaxis: { title: { text: '<b>Influenza A/PMMoV x 1000</b>' },
          tickmode: 'linear', 
          automargin: true,
          tick0: 0,
          dtick: 10,
          showticklabels: true,
          ticksuffix: 'K',
 },
// barmode: 'group'

    plot_bgcolor: "white",
    autosize: true,
    font: { size: 14},
    legend: { yanchor: "top", y: 0.95, xanchor: "left", x: 0.99, font: { size: 14 } },
    hovermode: "x unified",
    hoverdistance: 1,
    margin: { l: 0, r: 0, t: 0, b: 170 },
    showlegend: showLegend
};

var config = { responsive: true };

Plotly.newPlot('chart', [data1,data2], layout, config).then(() => {
	Plotly.relayout('chart', {
	    'xaxis.title': { text: "<br><b>Date (Week Commencing)</b>" },
	    'xaxis.showgrid': false,
	    'xaxis.linecolor': "black",
	    'xaxis.tickangle': 45,
	    'xaxis.hoverformat': "%b %d, %Y (week %V)",

	    'yaxis.title': { text: "<b>Influenza A/PMMoV x 1000</b>", standoff: 20 },
	    'yaxis.showgrid': true,
	    'yaxis.gridcolor': "lightgrey",
	    'yaxis.linecolor': "black",
	    'yaxis.zeroline': true,
	    'yaxis.zerolinecolor': "black",

	    'frame.duration': 30,
	    'transition.duration': 5
	});
});

window.onresize = function() {
	if(window.innerWidth < 600)
		Plotly.relayout('chart', { showlegend: false });
	else 
		Plotly.relayout('chart', { showlegend: true });
};
})
.catch(error => console.error("Error fetching CSV:", error));
