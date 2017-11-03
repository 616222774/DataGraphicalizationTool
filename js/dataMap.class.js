/**
 * Author: Percy
 * Date: 2017-10-27
 * Time: 10:00
 */
/**
 * 地图图表类, 生成带饼图或柱状图的中国地图
 * 
 * @param {string} id 图表容器id
 * @param {any} fileData Excel解析后的原始数据
 */
function DataMap(id, fileData, title) {
	BaseMap.call(this);
	this.fileData = JSON.parse(JSON.stringify(fileData));
	this.originData = JSON.parse(JSON.stringify(fileData));
	this.title = title ? title : '';
	this.charts = echarts.init(document.getElementById(id));
}
DataMap.prototype = new BaseMap();

DataMap.prototype.geoCoordMap = {};
DataMap.prototype.mapData = [];
DataMap.prototype.provinceData = [];
DataMap.prototype.pieData = {};
DataMap.prototype.pieRadius = {};
DataMap.prototype.barData = {};
// 初始配置
DataMap.prototype.baseOptions = {};
	
DataMap.prototype.setBaseOptions = function() {
	var _this = this;
	this.baseOptions = {
		title: [],
		// 设置图例
		legend: {
			zlevel: 7,
			show: true,
			type: 'scroll',
			orient: 'vertical',
			left: '9%',
			bottom: '7%',
			itemWidth: 30,
			itemHeight: 20,
			height: 200,
			data: this.barData['项目']
		},
		tooltip: {
			trigger: 'item',
			formatter: function(params) {
				if(params.value) {
					return params.name + '<br/>所有项目总数据: ' + params.value;
				}
			}
		},
		visualMap: {
			min: 0,
			max: (function() {
				var temp = _this.mapData.map(function(x) {
					return x.value;
				});
				return Math.max.apply(null, temp);
			})(),
			left: 'left',
			bottom: '4%',
			seriesIndex: 0,
			text: ['高', '低'],
			calculable: true,
			itemWidth: 30,
			itemHeight: 250,
			inRange: {
				color: ['#D3EDFF', '#7CCAFF', '#24A7FF'],
				symbolSize: [30, 100]
			}
		},
		series: [{
			name: 'chinaMap',
			type: 'map',
			mapType: 'china',
			label: {
				normal: {
					show: false
				},
				emphasis: {
					show: false
				}
			},
			top: '1%',
			bottom: '8%',
			showLegendSymbol: true,
			itemStyle: {
				normal: {
					areaColor: 'rgba(188, 188, 188, 0.1)',
					borderColor: '#999',
					color:'#D87E42'     
				},
			},
			data: this.mapData,
			zlevel: 2
		}],
		color:['#509BD5','#62B6E2','#E04B45','#70A756','#CBCE4D','#F0B63B','#DA442C','#F1D243'] 
	};
	// 初次加载
	if(this.baseOptions && typeof this.baseOptions === 'object') {
		this.charts.setOption(this.baseOptions, true);
	}
};

// 生成地图数据
DataMap.prototype.parseMapData = function() {
	var result = [],
	curProvince = this.fileData[0]['省'],
	sum = 0;
	for(var i in this.fileData){
		if(this.fileData[i]['省'] != curProvince){
			result.push({
				name: curProvince,
				value: sum
			}); 
			curProvince = this.fileData[i]['省'];
			sum = 0;
		}
		for(var key in this.fileData[i]){
			if(key == '省' || key == '市'){
				continue;
			}
			sum += Number(this.fileData[i][key]);
		}
		if(i == this.fileData.length-1){
			result.push({
				name: curProvince,
				value: sum
			}); 
		}
	}
	this.mapData = result;
};

// 生成省份数据
DataMap.prototype.parseProvinceData = function() {
	var result = [];
    for(var i in this.fileData){
        var sum = 0;
        for(var key in this.fileData[i]){
            if(key == '省' || key == '市'){
                continue;
            }
            sum += Number(this.fileData[i][key]);
        }
        result.push({
				'name': this.fileData[i]['市'],
				'value': sum
			});
	}
	this.provinceData = result;
};

// 生成饼图数据
DataMap.prototype.parsePieData = function() {
	var result = {},
		curProvince = this.fileData[0]['省'],
		tempObj = {};
	for(var i in this.fileData){
		if(this.fileData[i]['省'] != curProvince){
			result[curProvince] = [];
			for(var key in tempObj){
				if(key == '省'){
					continue;
				}
				result[curProvince].push({
					name: key,
					value: tempObj[key]
				});
			}
			tempObj = {};
			curProvince = this.fileData[i]['省'];
		}
		for(var j in this.fileData[0]){
			if(j == '省' || j == '市')continue;
			if(!tempObj[j]){
				tempObj[j] = 0;
			}
			tempObj[j] += Number(this.fileData[i][j]);
		}
		if(i == this.fileData.length-1){
			result[curProvince] = [];
			for(var key in tempObj){
				if(key == '省'){
					continue;
				}
				result[curProvince].push({
					name: key,
					value: tempObj[key]
				});
			}
		}
	}
	this.pieData = result;
};
// 生成城市饼图数据
DataMap.prototype.parseCityPieData = function(province) {
	var result = {},
		tempObj = {};
	for(var i in this.fileData){
		if(this.fileData[i]['省'] == province){
			result[this.fileData[i]['市']] = [];
			for(var j in this.fileData[i]){
				if(j == '省' || j == '市')continue;
				result[this.fileData[i]['市']].push({
					name: j,
					value: Number(this.fileData[i][j])
				});
			}
		}
	}
	return result;
};
// 根据地区所有项目总数据生成饼图半径
DataMap.prototype.convertPieRadius = function() {
	var _this = this;
	var temp = this.mapData.map(function(x) {
		return x.value;
	});
	var rate = 70 / Math.max.apply(null, temp);
	var result = {};
	temp.map(function(x, i) {
		result[_this.mapData[i].name] = (rate * x).toFixed(2);
	});
	this.pieRadius = result;
};
// 根据城市所有项目总数据生成饼图半径
DataMap.prototype.convertCityPieRadius = function(cityData) {
	var _this = this;
	var temp = cityData.map(function(x) {
		return x.value;
	});
	var rate = 70 / Math.max.apply(null, temp);
	var result = {};
	temp.map(function(x, i) {
		result[cityData[i].name] = (rate * x).toFixed(2);
	});
	return result;
};
// 生成柱状图数据
DataMap.prototype.parseBarData = function() {
	var result = {'项目': []},
		curProvince = this.fileData[0]['省'],
		tempObj = {'省': this.fileData[0]['省']};
	for(var item in this.fileData[0]){
		if(item == '省' || item == '市'){
			continue;
		}
		result['项目'].push(item);
	}
	for(var i in this.fileData){
		if(this.fileData[i]['省'] != curProvince){
			result[curProvince] = [];
			for(var key in tempObj){
				if(key == '省'){
					continue;
				}
				result[curProvince].push(tempObj[key]);
			}
			tempObj = {};
			tempObj['省'] = this.fileData[i]['省'];
			curProvince = this.fileData[i]['省'];
		}
		for(var j in result['项目']){
			if(!tempObj[result['项目'][j]]){
				tempObj[result['项目'][j]] = 0;
			}
			tempObj[result['项目'][j]] += Number(this.fileData[i][result['项目'][j]]);
		}
		if(i == this.fileData.length-1){
			result[curProvince] = [];
			for(var key in tempObj){
				if(key == '省'){
					continue;
				}
				result[curProvince].push(tempObj[key]);
			}
		}
	}
	this.barData = result;
};
// 生成城市柱状图数据
DataMap.prototype.parseCityBarData = function(province) {
	var result = {'项目': []},
		tempObj = {};
	for(var item in this.fileData[0]){
		if(item == '省' || item == '市')continue;
		result['项目'].push(item);
	}
	for(var i in this.fileData){
		if(this.fileData[i]['省'] == province){
			result[this.fileData[i]['市']] = [];
			for(var j in this.fileData[i]){
				if(j == '省' || j == '市')continue;
				result[this.fileData[i]['市']].push(this.fileData[i][j]);
			}
		}
	}
	return result;
};

// 生成饼图
DataMap.prototype.addPie = function() {
	var _this = this;
	// 获取半径
	this.convertPieRadius();
	// 设置圆心标题
	this.baseOptions.title = (function() {
		var result = [];
		for(var key in _this.pieData) {
			if(_this.pieData.hasOwnProperty(key)) {
				var geoCoord = _this.geoCoordMap[key];
				var p = _this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				result.push({
					text: key,
					zlevel: 100,
					textStyle: {
						fontSize: 12,
						fontFamily: '宋体'
					},
					left: p[0] - 17,
					top: p[1] - 12
				});
			}
		}
		return result;
	})();
	/**
	 * 设置饼图可拖拽
	 * 饼图本身不可被拖拽，而自定义图形可以拖拽并绑定拖拽事件
	 * 利用不可见的自定义图形覆盖于饼图之上且令饼图跟随其移动来实现拖拽
	 */
	this.baseOptions.graphic = echarts.util.map(this.mapData, function(item, dataIndex) {
		var geoCoord = _this.geoCoordMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		var r = _this.pieRadius[item.name] <= 40 ? 40 : _this.pieRadius[item.name];
		return {
			type: 'circle',
			position: p,
			shape: {
				cx: 0,
				cy: 0,
				r: r
			},
			invisible: true,
			draggable: true,
			ondrag: echarts.util.curry(function(dataIndex) {
				var op = _this.charts.getOption();
				var ops = op.series;
				var opt = op.title;
				var grap = op.graphic;
				var line = grap[0].elements[dataIndex+_this.mapData.length];
				var pie = grap[0].elements[dataIndex];
				// 标题位置跟随
				opt[dataIndex].left = this.position[0] - 17;
				opt[dataIndex].top = this.position[1] - 12;
				// 指示线跟随
				line.shape.x2 = this.position[0];
				line.shape.y2 = this.position[1];
				pie.position = this.position;
				line.shape.percent = (function(r){
					var xLen = Math.abs(line.shape.x2 - line.shape.x1);
					var yLen = Math.abs(line.shape.y2 - line.shape.y1);
					var lineLength = Math.sqrt(xLen*xLen + yLen*yLen);
					// 大于临界值才显示
					if(lineLength-r<(r/2))return 0;
					return 1-(r/lineLength);
				}(r));
				// 饼图位置跟随
				ops[dataIndex + 1].center = this.position;
				_this.charts.setOption({
					title: opt,
					series: ops,
					graphic: grap
				});
			}, dataIndex),
			zlevel: 6
		};
	}).concat(echarts.util.map(this.mapData, function(item, dataIndex){
		var geoCoord = _this.geoCoordMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'line',
			shape: {
				x1: p[0],
				y1: p[1],
				x2: p[0],
				y2: p[1]
			},
			style: {
				stroke: '#878787'
			},
			zlevel: 3
		};
	}));
	// 添加数据
	var pieValueFormatter = function(value) {
		return value.percent.toFixed(0) + '%';
	};
	for(var key in this.pieData) {
		if(this.pieData.hasOwnProperty(key)) {
			var outerRadius = this.pieRadius[key];
			var radius = [13, outerRadius <= 40 ? 40 : outerRadius];
			var geoCoord = this.geoCoordMap[key];
			if(geoCoord) {
				var p = this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				this.baseOptions.series.push({
					name: key,
					type: 'pie',
					radius: radius,
					center: p,
					data: this.pieData[key],
					zlevel: 3,
					label: {
						normal: {
							show: true,
							position: 'inside',
							formatter: pieValueFormatter,
							fontSize: 12
						},
					},
					labelLine: {
						normal: {
							show: false
						}
					},
					animation: false,
					silent: true,
					itemStyle: {
						mormal: {
							opacity: 1
						}
					}
				});
			}
		}
	}
};
// 生成城市饼图
DataMap.prototype.addCityPie = function(province) {
	var _this = this,
		cityData = [],
		cityPieData = {},
		geoCoordProvinceMap = {},
		op = this.charts.getOption();
	echarts.getMap(province).geoJson.features.forEach(function(v) {
		var name = v.properties.name;
		var x = v.properties.cp[0];
		var y = v.properties.cp[1];
		geoCoordProvinceMap[name] = [x, y];
	});
	// 仅保留该省城市的数据
	cityPieData = this.parseCityPieData(province);
	for(var _key in cityPieData){
		var _sum = 0;
		for(var _i in cityPieData[_key]){
			_sum += cityPieData[_key][_i].value;
		}
		cityData.push({
			name: _key,
			value: _sum
		});
	}
	// 获取半径
	var cityRadius = this.convertCityPieRadius(cityData);
	// 设置圆心标题
	this.baseOptions.title = (function() {
		var result = [];
		for(var key in cityPieData) {
			if(cityPieData.hasOwnProperty(key)) {
				var geoCoord = geoCoordProvinceMap[key];
				var p = _this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				result.push({
					text: key.substring(0,2),
					zlevel: 100,
					textStyle: {
						fontSize: 12,
						fontFamily: '宋体'
					},
					left: p[0] - 17,
					top: p[1] - 12
				});
			}
		}
		return result;
	})();
	this.baseOptions.graphic = echarts.util.map(cityData, function(item, dataIndex) {
		var geoCoord = geoCoordProvinceMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		var r = cityRadius[item.name] <= 40 ? 40 : cityRadius[item.name];
		return {
			type: 'circle',
			position: p,
			shape: {
				cx: 0,
				cy: 0,
				r: r
			},
			invisible: true,
			draggable: true,
			ondrag: echarts.util.curry(function(dataIndex) {
				var op = _this.charts.getOption();
				var ops = op.series;
				var opt = op.title;
				var grap = op.graphic;
				var line = grap[0].elements[dataIndex+cityData.length];
				var pie = grap[0].elements[dataIndex];
				// 标题位置跟随
				opt[dataIndex].left = this.position[0] - 17;
				opt[dataIndex].top = this.position[1] - 12;
				// 指示线跟随
				line.shape.x2 = this.position[0];
				line.shape.y2 = this.position[1];
				pie.position = this.position;
				line.shape.percent = (function(r){
					var xLen = Math.abs(line.shape.x2 - line.shape.x1);
					var yLen = Math.abs(line.shape.y2 - line.shape.y1);
					var lineLength = Math.sqrt(xLen*xLen + yLen*yLen);
					// 大于临界值才显示
					if(lineLength-r<(r/2))return 0;
					return 1-((r)/lineLength);
				}(r));
				// 饼图位置跟随
				ops[dataIndex + 1].center = this.position;
				_this.charts.setOption({
					title: opt,
					series: ops,
					graphic: grap
				});

			}, dataIndex),
			zlevel: 6
		};
	}).concat(echarts.util.map(cityData, function(item, dataIndex){
		var geoCoord = geoCoordProvinceMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'line',
			shape: {
				x1: p[0],
				y1: p[1],
				x2: p[0],
				y2: p[1]
			},
			style: {
				stroke: '#878787'
			},
			zlevel: 3
		};
	}));
	// 添加数据
	var pieValueFormatter = function(value) {
		return value.percent.toFixed(0) + '%';
	};
	for(var key in cityPieData) {
		if(cityPieData.hasOwnProperty(key)) {
			var outerRadius = cityRadius[key];
			var radius = [13, outerRadius <= 40 ? 40 : outerRadius];
			var geoCoord = geoCoordProvinceMap[key];
			if(geoCoord) {
				var p = this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				this.baseOptions.series.push({
					name: key,
					type: 'pie',
					radius: radius,
					center: p,
					data: cityPieData[key],
					zlevel: 4,
					label: {
						normal: {
							show: true,
							position: 'inside',
							formatter: pieValueFormatter,
							fontSize: 12
						},
					},
					labelLine: {
						normal: {
							show: false
						}
					},
					animation: false,
					silent: true,
					itemStyle: {
						mormal: {
							opacity: 1
						}
					}
				});
			}
		}
	}
	this.charts.setOption(this.baseOptions, true);
};
// 生成柱状图
DataMap.prototype.addBar = function() {
	var _this = this;
	// 设置柱状图标题
	this.baseOptions.title = (function() {
		var result = [];
		for(var key in _this.pieData) {
			if(_this.pieData.hasOwnProperty(key)) {
				var geoCoord = _this.geoCoordMap[key];
				var p = _this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				result.push({
					text: key,
					zlevel: 100,
					textStyle: {
						fontSize: 12,
						fontFamily: '宋体'
					},
					left: p[0] - 12,
					top: p[1]
				});
			}
		}
		return result;
	})();
	this.baseOptions.xAxis = [];
	this.baseOptions.yAxis = [];
	this.baseOptions.grid = [];
	// 添加数据
	for(var idx in this.barData) {
		if(idx == '项目') {
			continue;
		}
		var geoCoord = this.geoCoordMap[idx];
		var coord = this.charts.convertToPixel({
			seriesIndex: 0
		}, geoCoord);
		this.baseOptions.xAxis.push({
			id: idx,
			animation: false,
			gridId: idx,
			type: 'category',
			nameLocation: 'middle',
			nameGap: 3,
			splitLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				show: false
			},
			axisLine: {
				onZero: false,
				lineStyle: {
					color: '#666'
				}
			},
			data: [],
			zlevel: 8
		});
		this.baseOptions.yAxis.push({
			id: idx,
			gridId: idx,
			animation: false,
			splitLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				show: false
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#1C70B6'
				}
			},
			zlevel: 8
		});
		this.baseOptions.grid.push({
			id: idx,
			width: 50,
			height: 60,
			left: coord[0] - 20,
			top: coord[1] - 60,
			right: 0,
			buttom: 0,
			zlevel: 8,
		});
		for(var i = 0; i < this.barData[idx].length; i++) {
			this.baseOptions.series.push({
				type: 'bar',
				name: this.barData['项目'][i],
				xAxisId: idx,
				yAxisId: idx,
				barGap: 0,
				barCategoryGap: 0,
				data: [this.barData[idx][i]],
				zlevel: 8,
				animation: false,
			});
		}

	}

	// 设置柱状图和标题可拖拽
	this.baseOptions.graphic = echarts.util.map(this.mapData, function(item, dataIndex) {
		var geoCoord = _this.geoCoordMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'rect',
			position: p,
			shape: {
				x: -20,
				y: -60,
				width: 60,
				height: 60
			},
			invisible: true,
			draggable: true,
			ondrag: echarts.util.curry(function(dataIndex) {
				var op = _this.charts.getOption();
				var ops = op.grid;
				var opt = op.title;
				var grap = op.graphic;
				var line = grap[0].elements[dataIndex+_this.mapData.length];
				var bar = grap[0].elements[dataIndex];
				// 标题位置跟随
				opt[dataIndex].left = this.position[0] - 12;
				opt[dataIndex].top = this.position[1];
				ops[dataIndex].left = this.position[0] - 20;
				ops[dataIndex].top = this.position[1] - 60;
				// 指示线跟随
				line.shape.x2 = this.position[0];
				line.shape.y2 = this.position[1];
				bar.position = this.position;
				line.shape.percent = (function(){
					var xLen = Math.abs(line.shape.x2 - line.shape.x1);
					var yLen = Math.abs(line.shape.y2 - line.shape.y1);
					var lineLength = Math.sqrt(xLen*xLen + yLen*yLen);
					// 大于临界值才显示
					if(lineLength-30<15)return 0;
					return 1-(30/lineLength);
				}());
				_this.charts.setOption({
					title: opt,
					grid: ops,
					graphic: grap
				});
			}, dataIndex),
			zlevel: 9
		};
	}).concat(echarts.util.map(this.mapData, function(item, dataIndex){
		var geoCoord = _this.geoCoordMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'line',
			shape: {
				x1: p[0],
				y1: p[1],
				x2: p[0],
				y2: p[1]
			},
			style: {
				stroke: '#878787'
			},
			zlevel: 3
		};
	}));
};
// 生成城市柱状图
DataMap.prototype.addCityBar = function(province) {
	var _this = this,
		cityData = [],
		cityBarData = {},
		geoCoordProvinceMap = {};
	echarts.getMap(province).geoJson.features.forEach(function(v) {
		var name = v.properties.name;
		var x = v.properties.cp[0];
		var y = v.properties.cp[1];
		geoCoordProvinceMap[name] = [x, y];
	});
	// 仅保留该省城市的数据
	cityBarData = this.parseCityBarData(province);
	for(var _key in cityBarData){
		if(_key == '项目')continue;
		var _sum = 0;
		for(var _i in cityBarData[_key]){
			_sum += Number(cityBarData[_key][_i]);
		}
		cityData.push({
			name: _key,
			value: _sum
		});
	}
	// 设置柱状图标题
	this.baseOptions.title = (function() {
		var result = [];
		for(var key in cityBarData) {
			if(cityBarData.hasOwnProperty(key)&&key!='项目') {
				var geoCoord = geoCoordProvinceMap[key];
				var p = _this.charts.convertToPixel({
					seriesName: 'chinaMap'
				}, geoCoord);
				result.push({
					text: key.substring(0,2),
					zlevel: 100,
					textStyle: {
						fontSize: 12,
						fontFamily: '宋体'
					},
					left: p[0] - 12,
					top: p[1]
				});
			}
		}
		return result;
	})();
	this.baseOptions.xAxis = [];
	this.baseOptions.yAxis = [];
	this.baseOptions.grid = [];
	// 添加数据
	for(var idx in cityBarData) {
		if(idx == '项目') {
			continue;
		}
		var geoCoord = geoCoordProvinceMap[idx];
		var coord = this.charts.convertToPixel({
			seriesIndex: 0
		}, geoCoord);
		this.baseOptions.xAxis.push({
			id: idx,
			animation: false,
			gridId: idx,
			type: 'category',
			nameLocation: 'middle',
			nameGap: 3,
			splitLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				show: false
			},
			axisLine: {
				onZero: false,
				lineStyle: {
					color: '#666'
				}
			},
			data: [],
			zlevel: 8
		});
		this.baseOptions.yAxis.push({
			id: idx,
			gridId: idx,
			animation: false,
			splitLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				show: false
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#1C70B6'
				}
			},
			zlevel: 8
		});
		this.baseOptions.grid.push({
			id: idx,
			width: 50,
			height: 60,
			left: coord[0] - 20,
			top: coord[1] - 60,
			right: 0,
			buttom: 0,
			zlevel: 8,
		});
		for(var i = 0; i < cityBarData[idx].length; i++) {
			this.baseOptions.series.push({
				type: 'bar',
				name: cityBarData['项目'][i],
				xAxisId: idx,
				yAxisId: idx,
				barGap: 0,
				barCategoryGap: 0,
				data: [cityBarData[idx][i]],
				zlevel: 8,
				animation: false,
			});
		}

	}

	// 设置柱状图和标题可拖拽
	this.baseOptions.graphic = echarts.util.map(cityData, function(item, dataIndex) {
		var geoCoord = geoCoordProvinceMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'rect',
			position: p,
			shape: {
				x: -20,
				y: -60,
				width: 60,
				height: 60
			},
			invisible: true,
			draggable: true,
			ondrag: echarts.util.curry(function(dataIndex) {
				var op = _this.charts.getOption();
				var ops = op.grid;
				var opt = op.title;
				var grap = op.graphic;
				var line = grap[0].elements[dataIndex+cityData.length];
				var bar = grap[0].elements[dataIndex];
				// 标题位置跟随
				opt[dataIndex].left = this.position[0] - 12;
				opt[dataIndex].top = this.position[1];
				ops[dataIndex].left = this.position[0] - 20;
				ops[dataIndex].top = this.position[1] - 60;
				// 指示线跟随
				line.shape.x2 = this.position[0];
				line.shape.y2 = this.position[1];
				bar.position = this.position;
				line.shape.percent = (function(){
					var xLen = Math.abs(line.shape.x2 - line.shape.x1);
					var yLen = Math.abs(line.shape.y2 - line.shape.y1);
					var lineLength = Math.sqrt(xLen*xLen + yLen*yLen);
					// 大于临界值才显示
					if(lineLength-30<15)return 0;
					return 1-(30/lineLength);
				}());
				_this.charts.setOption({
					title: opt,
					grid: ops,
					graphic: grap
				});
			}, dataIndex),
			zlevel: 9
		};
	}).concat(echarts.util.map(cityData, function(item, dataIndex){
		var geoCoord = geoCoordProvinceMap[item.name];
		var p = _this.charts.convertToPixel({
			seriesName: 'chinaMap'
		}, geoCoord);
		return {
			type: 'line',
			shape: {
				x1: p[0],
				y1: p[1],
				x2: p[0],
				y2: p[1]
			},
			style: {
				stroke: '#878787'
			},
			zlevel: 3
		};
	}));
	this.charts.setOption(this.baseOptions, true);
};

// 获取各种类型图表数据 
DataMap.prototype.getEachChartsData = function() {
	this.parseBarData();
	this.parseMapData();
	this.parseProvinceData();
	this.parsePieData();
};

// 切换图表类型
DataMap.prototype.toggleCharts = function() {
	// 当前图表类型
	var curCharts = this.charts.getOption().series[1].type;
	var curMap = this.charts.getOption().series[0].mapType;

	switch(true) {
		case (curCharts == 'pie' && curMap == 'china'):
			this.setBaseOptions();
			this.addBar();
			break;
		case (curCharts == 'pie' && curMap != 'china'):
			this.baseOptions.series = [this.baseOptions.series[0]];
			this.addCityBar(curMap);
			break;
		case (curCharts == 'bar' && curMap == 'china'):
			this.setBaseOptions();
			this.addPie();
			break;
		case (curCharts == 'bar' && curMap != 'china'):
			this.baseOptions.series = [this.baseOptions.series[0]];
			this.baseOptions.xAxis = [];
			this.baseOptions.yAxis = [];
			this.baseOptions.grid = [];
			this.addCityPie(curMap);
			break;
		default:
			break;
	}
	this.charts.setOption(this.baseOptions, true);
	this.setChartTitle();
};

// 饼图圆心标题英语
DataMap.prototype.toggleLang = function() {
	var _this = this;
	var op = this.charts.getOption(),
		curMap = op.series[0].mapType;
	if(curMap == 'china'){
		if(_this.pieData.hasOwnProperty(op.title[0].text)) {
			for(var i = 0; i < op.title.length - 1; i++) {
				op.title[i].text = ' ' + this.transformChinese(op.title[i].text, true);
			}
			this.charts.setOption(op, true);
			return;
		}else{
			var j = 0;
			for(var key in _this.pieData) {
				op.title[j].text = key;
				j++;
			}
			this.charts.setOption(op, true);
			return;
		}
	}else{
		for(var idx in _this.provinceData){
			if(_this.provinceData[idx].name.indexOf(op.title[0].text) != -1){
				for(var i = 0; i < op.title.length - 1; i++) {
					op.title[i].text = ' ' + this.transformChinese(op.title[i].text, true);
				}
				this.charts.setOption(op, true);
				return;
			}
		}
		var cityData = [],
			cityPieData = this.parseCityPieData(curMap);
		for(var _key in cityPieData){
			var _sum = 0;
			for(var _i in cityPieData[_key]){
				_sum += cityPieData[_key][_i].value;
			}
			cityData.push({
				name: _key,
				value: _sum
			});
		}
		var j = 0;
		for(var key in cityData) {
			op.title[j].text = cityData[key].name.substring(0,2);
			j++;
		}
		this.charts.setOption(op, true);
		return;
	}
};

// 表格内容修改
DataMap.prototype.syncChart = function(i, j, newData) {
	var _this = this;
	if(i && j && newData) {
		this.fileData[i][j] = newData;
	}
	this.getEachChartsData();
	var op = this.charts.getOption(),
		curCharts = op.series[1].type,
		curMap = op.series[0].mapType;
	switch(true) {
		case (curCharts == 'pie' && curMap == 'china'):
			this.setBaseOptions();
			this.addPie();
			break;
		case (curCharts == 'pie' && curMap != 'china'):
			op.series[0].data = this.provinceData;
			this.baseOptions.series = [op.series[0]];
			this.addCityPie(curMap);
			break;
		case (curCharts == 'bar' && curMap == 'china'):
			this.setBaseOptions();
			this.addBar();
			break;
		case (curCharts == 'bar' && curMap != 'china'):
			op.series[0].data = this.provinceData;
			this.baseOptions.series = [op.series[0]];
			this.baseOptions.xAxis = [];
			this.baseOptions.yAxis = [];
			this.baseOptions.grid = [];
			this.addCityBar(curMap);
			break;
		default:
			break;
	}

	this.baseOptions.title.push({
		zlevel: 100,
		text: _this.title,
		subtext: (function() {
			if(_this.title == '') {
				return '';
			}
			var temp = 0;
			_this.mapData.map(function(x) {
				temp += parseInt(x.value);
			});
			return '总量： ' + temp;
		})(),
		left: 'center',
		top: '3%',
		textStyle: {
			fontSize: 24,
			fontWeight: 'normal'
		},
		subtextStyle: {
			color: '#999',
			fontSize: 20
		}
	});
	this.charts.setOption(this.baseOptions);
};

// 点击省份下钻
DataMap.prototype.bindClick = function() {
	var _this = this;
	this.charts.on('click', function(param){
		if(!_this.fileData[0].hasOwnProperty('市'))return;
		var op = _this.charts.getOption();
		op.graphic = [];
		var isBar = (op.series[1].type == 'bar');
		if(op.series[0].mapType == 'china'){
			var selectedProvince = param.name;
			for(var i in _this.mapData){	
				if(_this.mapData[i].name == param.name){
					break;
				}
				if(i == _this.mapData.length-1){
					return;
				}	
			}
			$.get('js/lib/echarts/provinces/'+param.name+'.json', function(geoJson){
				echarts.registerMap(param.name, geoJson);
				_this.setBaseOptions();
				_this.baseOptions.series = [];
				_this.baseOptions.title = [];
				_this.baseOptions.series.push({
					name: 'chinaMap',
					type: 'map',
					mapType: param.name,
					showLegendSymbol:true,
					top: '15%',
					bottom: '25%',
					itemStyle: {
						normal: {
							areaColor: 'rgba(188, 188, 188, 0.1)',
							borderColor: '#999',
							color: '#D87E42'
						}
					},
					data: _this.provinceData,
					label: {
						normal: {
							show: false
						},
						emphasis: {
							show: false
						}
					},
					zlevel: 2
				});
				op.legend = {
					show: true
				};
				_this.charts.setOption(_this.baseOptions, true);
				if(isBar){
					_this.addCityBar(param.name);
				}else{
					_this.addCityPie(param.name);
				}
				_this.setChartTitle();
			});
		}else{
			_this.setBaseOptions();
			if(isBar){
				_this.addBar();
			}else{
				_this.addPie();
			}
			_this.charts.setOption(_this.baseOptions, true);
			_this.setChartTitle();
		}
	});
};

// 初始化图表
DataMap.prototype.init = function() {
	var _this = this;
	this.charts.showLoading();
	echarts.getMap('china').geoJson.features.forEach(function(v) {
		var name = v.properties.name;
		var x = v.properties.cp[0];
		var y = v.properties.cp[1];
		_this.geoCoordMap[name] = [x, y];
	});

	// 获取各种图表数据格式
	this.getEachChartsData();

	// 初始化配置
	this.setBaseOptions();

	// 添加饼图数据
	this.addPie();

	this.charts.setOption(this.baseOptions, true);

	this.setChartTitle();

	// 图表大小跟随窗口变化
	window.onresize = function() {
		_this.charts.resize();
	};
	// 点击事件
	this.bindClick();
	this.charts.hideLoading();
	return this.charts;
};
