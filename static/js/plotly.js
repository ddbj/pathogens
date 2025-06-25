function drawLineChart(id, file, target, title="CHART", xaxis_label="<br><b>Date(Month Commencing)</b>", yaxix_label="<b>Count</b>")
{
	var data = [];
	//const TARGET = "Mpox";//"SARS-CoV-2";
	// github rawに変える
	target = "SARS-CoV-2";
	fetch("../../data/" + file)//pathogen_data.json")
		.then(response => {
			if(!response.ok)
				throw new Error("Error occurred during fetching. " + response.status);
			return response.json();
		})
		.then(json => {
			var startDate = "9999-12";
			var endDate   = "1970-01";
			var categories = {};
			// 対象データの最初の日と最後の日を取得
			const pattern = /[1-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]/;
			for(var i = 0; i < json.length; i ++){
				if(json[i].pathogen == target){ // 対象データのみが対象
					var d = json[i].collection_date = String(json[i].collection_date);
					if(d.length < 8){ // 不正な日付はスキップ
						continue;
					}
					if(pattern.test(d)){ // YYYYMMDD形式はYYYY-MM-DD形式に修正
						d = d.substring(0, 4) + "-" + d.substring(4, 6);
						json[i].collection_date = d;
					}
//console.log(d);
					var date = d.substring(0, 7); // 月で集計するため、年と月だけ取得
					if(date < startDate)
						startDate = date;
					if(endDate < date)
						endDate = date;
					// カテゴライズキー（仮）
					//var isolate = json[i].isolate.split("/")[2];
					var category = json[i].geo_location;
					if(!(category in categories))
						categories[category] = {}
				}
			}
//console.log(startDate, endDate);
	
			var xLabels = [];
			var   cur = new Date(startDate + "-01"); // 日にちなしの文字列を渡した場合に、挙動が保障されないため1日を指定
			const end = new Date(endDate   + "-02"); // 常にcurは1日になるけど、念のため終了は2日にしておく
			var keys = Object.keys(categories);
			var total_count = [];
			// 日付ごとの初期化、およびX軸の準備
			while(cur <= end){
//console.log(cur);
				const y = cur.getFullYear();
				const m = String(cur.getMonth() + 1).padStart(2, '0');
				xLabels.push(y + "-" + m);
				// 件数を初期化
				for(var i = 0; i < keys.length; i ++)
					categories[keys[i]][y + "-" + m] = 0;
				total_count[y + "-" + m] = 0;

				cur.setMonth(cur.getMonth() + 1);
				//cur.setDate(cur.getDate() + 1);
			}
			// 月ごと、カテゴリごとの件数をカウント
			for(var i = 0; i < json.length; i ++){
				if(json[i].pathogen == target){
					if(json[i].collection_date.length < 7) // 不正な日付はスキップ
						continue;
					var date    = json[i].collection_date.substring(0, 7);
					//var isolate = json[i].isolate.split("/")[2];
					var category = json[i].geo_location;
					categories[category][date] ++;
				}
			}
//console.log(categories);
			for(var i = 0; i < keys.length; i ++){
				var cur = new Date(startDate + "-01");
				var data = [];
				// 各isolateごとにデータを整理する
				while(cur <= end){
					const y = cur.getFullYear();
					const m = String(cur.getMonth() + 1).padStart(2, '0');
					const date = y + "-" + m;
					total_count[date] += categories[keys[i]][date];

					cur.setMonth(cur.getMonth() + 1);
				}
			}
//console.log(total_count);
			var all_data = [];
			var count_data = [];
			// 全データをplotly用に整理する
			for(var i = 0; i < keys.length; i ++){
				var cur = new Date(startDate + "-01");
				var data = [];
				// 各isolateごとにデータを整理する
				while(cur <= end){
					const y = cur.getFullYear();
					const m = String(cur.getMonth() + 1).padStart(2, '0');
					const date = y + "-" + m;
					if(categories[keys[i]][date] == 0)
						data.push(null); // nullを入れたポイントは描画がスキップされる
					else
						data.push(Math.round(categories[keys[i]][date]*100000.0/total_count[date])/1000.0);
					if(i == 0)
						count_data.push(total_count[date]);

					cur.setMonth(cur.getMonth() + 1);
					//cur.setDate(cur.getDate() + 1);
				}
//console.log(keys[i], data);
				var d = {
	 				x:    xLabels,
	 				y:    data,
	 				name: keys[i],
	 				type: 'bar',
					hovertemplate: "%{y}%",
				};
				all_data.push(d);
			}
			all_data.push({
				x: xLabels,
				y: count_data,
				type: 'scatter',
				mode: 'none',
				hovertemplate: "Total count: %{customdata}<extra></extra>",
				showlegend: false,
				customdata: count_data.map(v => v.toLocaleString())
			});
	
			/*
			const ticktext = xLabels.map((dateStr, idx) => {
				const date = dateStr.split("/");
				const y = date[0];
				const m = date[1];
				var format = m;
				if(idx === 0 || m === "01")
					format = '${y}/${m}';
				return format;
			});
			console.log(xLabels[0]);
			*/
			let showLegend = window.innerWidth < 600 ? false : true;
			var layout = {
				title: { 
					text:       title,
					automargin: true 
				},
				xaxis: { 
					title: { 
						text: xaxis_label 
					},
				    	linecolor:   "black",
				    	tickangle:   45,
				    	hoverformat: "%b %Y",
				    	dtick:       "M1",

					tickmode:   'auto', 
					type:       'date', 
					tickformat: '%b %Y',
					//tickvals: xLabels,
					//ticktext: ticktext
					showgrid:   false
			 	},
			 	yaxis: { 
					title: { 
						text:     yaxix_label,
						standoff: 20
					},
					showgrid:      true,
					gridcolor:     "lightgrey",
					linecolor:     "black",
					zeroline:      true,
					zerolinecolor: "black",

					//tickmode:       'linear', 
					automargin:     true,
	          			tick0:          0,
					//dtick:          10,
					showticklabels: true,
					//ticksuffix:     'K',
					range: [0, 100]
				},
	
				barmode:      "stack",
				plot_bgcolor: "white",
				autosize:     true,
				font: { 
					size: 14 
				},
				legend: { 
					yanchor: "top",  y: 0.95, 
					xanchor: "left", x: 1.01, 
					font: { 
						size: 14 
					} 
				},
				hovermode:     "x unified",
				hoverdistance: 1,
				showlegend:    showLegend,
				margin: { l: 0, r: 0, t: 0, b: 170 }
			};
	
			var config = {
				responsive: true 
			};
	
			Plotly.newPlot(id, all_data, layout, config).then(() => {
				Plotly.relayout(id, {
				    /*'xaxis.title': { 
					    text: xaxis_label,
				    },
				    //'xaxis.showgrid':    false,
				    'xaxis.linecolor':   "black",
				    'xaxis.tickangle':   45,
				    'xaxis.hoverformat': "%b %Y",
				    //'xaxis.tickformat':  "%b %Y",
				    'xaxis.dtick':       "M1",
				    //'xaxis.nticks':       10,
				    //'xaxis.tickvals':    xLabels,
				    //'xaxis.ticktext':    ticktext,
	
				    'yaxis.title': { 
					    text:     yaxix_label,
					    standoff: 20
				    },
				    'yaxis.showgrid':      true,
				    'yaxis.gridcolor':     "lightgrey",
				    'yaxis.linecolor':     "black",
				    'yaxis.zeroline':      true,
				    'yaxis.zerolinecolor': "black",
				    //'yaxis.nticks':       10,*/
	
				    'frame.duration':      30,
				    'transition.duration': 5
				});
			});
	
			// ウィンドウ幅600以下の場合、凡例を隠す
			window.onresize = function() {
				if(window.innerWidth < 600)
					Plotly.relayout(id, { showlegend: false });
				else 
					Plotly.relayout(id, { showlegend: true });
			};
		})
		.catch(error => {
			console.error("Error occurred during processing. ", error);
		})
}
