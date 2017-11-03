/**
 * Author: Percy
 * Date: 2017-10-26
 * Time: 17:00
 */
/**
 * 基础地图图表类
 * 
 * @param {string} id 图表容器id
 * @param {any} fileData Excel解析后的原始数据
 */
function BaseMap(id, fileData, title) {
	this.fileData = JSON.parse(JSON.stringify(fileData || {}));
	this.originData = JSON.parse(JSON.stringify(fileData || {}));
	this.title = title || '';
	this.charts = id?echarts.init(document.getElementById(id)):null;
}
/**
 * 构造方法
 *
 * @prop {Object} charts echarts实例
 * @prop {Array<Object>} fileData Excel解析后的原始数据
 * 例子: [
 *          {
 *              广东: '15687087',
 *              浙江: '2560100'
 *          }
 *       ]
 * @prop {Object} geoCoordMap 地图各省份坐标集合
 * 例子: {
 *          上海: [121.472644, 31.231706],
 *          云南: [102.712251, 25.040609],
 *       }
 * @prop {Array<Object>} mapData 中国图表数据
 * 例子: [
 *          {
 *              name: '广东',
 *              value: '183153798'
 *          },
 *          {
 *              name: '浙江',
 *              value: '62297480'
 *          }
 *       ]
 * @prop {Array<Object>} provinceData 省份图表数据
 * 例子: [
 *          {
 *              name: '广州市',
 *              value: '183153798'
 *          },
 *          {
 *              name: '深圳市',
 *              value: '62297480'
 *          }
 *       ]
 */
BaseMap.prototype = {

    baseOptions: {},

    /**
     * 修改图表标题
     * 
     * @param {string} newTitle 可选, 传值时为更改标题，不传值时可用于修改图表数据后更新副标题的总量
     */
	setChartTitle: function(newTitle) {
		var _this = this,
			text = _this.title,
			op = this.charts.getOption();
		if(newTitle) {
			_this.title = newTitle;
			text = newTitle;
            op.title[op.title.length - 1].text = text;
			op.title[op.title.length - 1].subtext = (function() {
				if(text == '') {
					return '';
				}
                var temp = 0;
                if(op.series[0].mapType == 'china'){
                    _this.mapData.map(function(x) {
                        temp += parseInt(x.value);
                    });
                }else{
                    _this.fileData.map(function(x) {
						if(x['省'] == op.series[0].mapType){
							for(var k in x){
								if(k == '省' || k == '市')continue;
								temp += Number(x[k]);
							}
						}
					});   
                }
				return '总量： ' + temp;
			})();
		}else{
			op.title.push({
				zlevel: 100,
				text: text,
				subtext: (function() {
					if(_this.title == '') {
						return '';
					}
                    var temp = 0;
                    if(op.series[0].mapType == 'china'){
                        _this.mapData.map(function(x) {
                            temp += parseInt(x.value);
                        });
                    }else{
                        _this.fileData.map(function(x) {
                            if(x['省'] == op.series[0].mapType){
                                for(var k in x){
                                    if(k == '省' || k == '市')continue;
                                    temp += Number(x[k]);
                                }
                            }
                        });
                    }
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
			});
        }
		this.charts.setOption(op, true);
    },
    
    /**
     *  生成表格
     * 
     * @param {string} selector 表格容器的css选择器 
     */
	generateTable: function(selector) {
		var tbContainer = $(selector);
		var thead = '<tr>',
			tbody = '';
		for(var th in this.fileData[0]) {
			thead += ('<th>' + th + '</th>');
		}
		thead += '</tr>';
		for(var i = 0; i < this.fileData.length; i++) {
			tbody += '<tr>';
			for(var j in this.fileData[i]) {
				tbody += ('<td><input type="text" data-row="' + i + '" data-column="' + j + '" value="' + this.fileData[i][j] + '"></td>');
			}
			tbody += '</tr>';
		}
		var tbStr = '<table>' + thead + tbody + '</table>';
		tbContainer.html(tbStr);
	},

    /**
     * 首字母大写
     * 
     * @param {string} str 需要转换的英文字符串 
    */
    UpperFirstLetter: function(str){   
        return str.replace(/\b\w+\b/g, function(word) {   
            return word.substring(0,1).toUpperCase() + word.substring(1);   
        });   
    },

    /**
     * 将省份，城市转换成英文首字母缩写
     * 
     * @param {string} text 需要转换的中文字符串 
     * @param {string} isFirstLetter 是否转换为首字母缩写 
    */
    transformChinese: function(text, isFirstLetter){
        var result;
        try {
            if(isFirstLetter&&isFirstLetter==true){
                result = pinyinUtil.getFirstLetter(text, false);
            }else{
                result = pinyinUtil.getPinyin(text, '', false, false);
            }
            result = this.UpperFirstLetter(result);
        }catch(error) {
            console.error('Please import pinyinjs first.');
        }
        return result;
    }
};