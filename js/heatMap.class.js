/**
 * Author: Percy
 * Date: 2017-10-27
 * Time: 10:01
 */
/**
 * 热力图图表类
 * 
 * @param {string} id 图表容器id
 * @param {any} fileData Excel解析后的原始数据
 * @param {string} title 图表标题
 */
function HeatMap(id, fileData, title) {
	this.fileData = JSON.parse(JSON.stringify(fileData));
	this.originData = JSON.parse(JSON.stringify(fileData));
	this.title = title ? title : '';
	this.charts = echarts.init(document.getElementById(id));
}
HeatMap.prototype = new BaseMap();

HeatMap.prototype.geoCoordMap = {};
HeatMap.prototype.mapData = [];
HeatMap.prototype.provinceData = [];
HeatMap.prototype.isEn = false
// 初始配置
HeatMap.prototype.baseOptions = {};

HeatMap.prototype.setBaseOptions = function() {
	var _this = this;
	this.baseOptions = {
		title: {
			zlevel:5,
			show: true,
			text: [_this.title],
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
				fontSize: 16
			}
		},
		legend: {show:true},
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
				color: ['#D3EDFF', '#24A7FF', '#0E72CC'],
				// color: ['#D3EDFF', '#7CCAFF', '#24A7FF'],
				symbolSize: [30, 100]
			}
		},
		series: [{
			name: 'chinaMap',
			type: 'map',
			mapType: 'china',
			label: {
				normal: {
					show: true,
					formatter: function(val) {
						for(var i in _this.mapData){
							if(val.name == _this.mapData[i].name){
								if(_this.isEn == true) {
									return _this.transformChinese(val.name) + '\n' + _this.mapData[i].value;
								} else {
									return val.name + '\n' + _this.mapData[i].value;
								}
								break;
							}
						}
						return '';
					},
					fontSize: 16
				},
				emphasis: {
					show: false
				}
			},
			top: '1%',
			bottom: '8%',
			itemStyle: {
				normal: {
					areaColor: 'rgba(188, 188, 188, 0.1)',
					borderColor: '#999'
				}
			},
			data: this.mapData,
			zlevel: 3
		}]
	};
	// 初次加载
	if(this.baseOptions && typeof this.baseOptions === 'object') {
		this.charts.setOption(this.baseOptions, true);
	}
};

// 生成地图数据
HeatMap.prototype.parseMapData = function() {
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
		sum += Number(this.fileData[i]['数据']);
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
HeatMap.prototype.parseProvinceData = function() {
	var result = [];
    for(var i in this.fileData){
        var sum = 0;
        sum += Number(this.fileData[i]['数据']);
        result.push({
				'name': this.fileData[i]['市'],
				'value': sum
			});
    }
	this.provinceData = result;
};

// 表格内容修改
HeatMap.prototype.syncChart = function(i, j, newData) {
	var op = this.charts.getOption(),
		curMap = op.series[0].mapType;
	if(i && j && newData) {
		this.fileData[i][j] = newData;
	}
	this.parseMapData();
	this.parseProvinceData();
	switch(true) {
		case (curMap == 'china'):
			this.setBaseOptions();
			break;
		case (curMap != 'china'):
			op.series[0].data = this.provinceData;
			this.baseOptions.series = [op.series[0]];
			break;
	}

	this.charts.setOption(this.baseOptions, true);
	this.setChartTitle();
};

// 省份标题英语
HeatMap.prototype.toggleLang = function() {
	this.isEn ? this.isEn = false : this.isEn = true;
	this.charts.setOption(this.charts.getOption());
};

// 点击省份下钻
HeatMap.prototype.bindClick = function() {
	var _this = this,
	    op = this.charts.getOption();
	this.charts.on('click', function(param){
		if(!_this.fileData[0].hasOwnProperty('市'))return;
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
				op.series[0] = {
					name: 'chinaMap',
					type: 'map',
					mapType: param.name,
					label: {
						normal: {
							show: true,
							formatter: function(val) {
								for(var i in _this.fileData){
									if(val.name == _this.provinceData[i].name){
										if(_this.isEn == true) {
											return _this.transformChinese(val.name.substring(0,2)) + ': ' + _this.provinceData[i].value;
										} else {
											return val.name + '\n' + _this.provinceData[i].value;
										}
										break;
									}
								}
								return '';
							},
							fontSize: 16
						},
						emphasis: {
							show: true
						}
					},
					showLegendSymbol:true,
					top: '10%',
					bottom: '25%',
					itemStyle: {
						normal: {
							areaColor: 'rgba(188, 188, 188, 0.1)',
							borderColor: '#999'
						}
					},
					data: _this.provinceData,
					zlevel: 3
				};
				op.legend = {
					show: true
				};
				_this.charts.setOption(op, true);
				_this.setChartTitle();
			});
		}else{
			op.series[0] = {
				name: 'chinaMap',
				type: 'map',
				mapType: 'china',
				label: {
					normal: {
						show: true,
						formatter: function(val) {
							for(var i in _this.mapData){
								if(val.name == _this.mapData[i].name){
									if(_this.isEn == true) {
										return _this.transformChinese(val.name) + '\n' + _this.mapData[i].value;
									} else {
										return val.name + '\n' + _this.mapData[i].value;
									}
									break;
								}
							}
							return '';
						},
						fontSize: 16
					},
					emphasis: {
						show: false
					}
				},
				top: '1%',
				bottom: '8%',
				itemStyle: {
					normal: {
						areaColor: 'rgba(188, 188, 188, 0.1)',
						borderColor: '#999'
					}
				},
				data: _this.mapData,
				zlevel: 3
			};
			op.legend = {
				show: false
			};
			console.log(_this.mapData);
			_this.charts.setOption(op, true);
			_this.setChartTitle();
		}
	});
};

// 初始化图表
HeatMap.prototype.init = function() {
	var _this = this;
	echarts.getMap('china').geoJson.features.forEach(function(v) {
		var name = v.properties.name;
		var x = v.properties.cp[0];
		var y = v.properties.cp[1];
		_this.geoCoordMap[name] = [x, y];
	});

	// 获取热力图数据格式
	this.parseMapData();
	this.parseProvinceData();

	// 初始化配置
	this.setBaseOptions();

	this.charts.setOption(this.baseOptions, true);

	// 图表大小跟随窗口变化
	window.onresize = function() {
		_this.charts.resize();
	};

	// 点击事件
	this.bindClick();

	return this.charts;
};