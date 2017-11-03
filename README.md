# Data Graphicalization Tool
### 数据图形化助手
---


## About
This project was developed for visualizing data on a heat map. You can import an Excel file which filled with data according to the template and it will generate a chinese heat map. If your Excel data is a two-dimensional array, the map will be generated with pie charts or bar charts for each provinces which has its own data.


## Featuers
1. Open the window of data table to modify the data and the heat map will be updated immediately, then you can save your change or revoke it.
2. Reupload a new Excel file and update the heat map.
3. Modify the title of heat map.
4. Pies can be transformed into bars and vice versa.
5. The title of each pies and bars and the label of each provinces can be switchd to acronym for phonetic alphabet.
6. Pies and bars are dragable, you can drag them to a better positon.
7. Exoprt the data as a `.xlsx` file after you've modified the data through the data table.
8. Exoprt the heat map as a `.png` file.


## Excel Templates
*That's not necessary to fill the column '市' if you just want to show the heat map of each provinces and don't drill it.*

### Basic Heat Map

|   省  |   市  |   数据   | 
|  :--: |  :--: |   :--:   |
|  广东 | 广州市| 46409506 |
|  广东	| 深圳市| 21049246 |
|  广东	| 珠海市| 2168031  |
|  广东	| 湛江市| 30383776 |
|  浙江	| 金华市| 34456683 | 
|  浙江	| 绍兴市| 13702486 |
|  浙江	| 温州市| 16052475 |

### Heat Map with Pie Charts or Bar Charts

| 省 |  市  |  凯越  |  思域  | 福克斯 |
|:--:| :--: |  :--:  |  :--:  |  :--:  |
|广东|广州市|11687087|35546456|46409506|
|广东|深圳市|8669742 |7483307 |21049246|
|广东|阳江市|2429750 |3407933 |2168031 |
|浙江|金华市|8031949 |4606466 |34456683|
|浙江|绍兴市|5273287 |4098490 |13702486|
|浙江|温州市|1484500 |1819675 |16052475|



## Usage
Open `index.html` in browser directly, or install `browser-sync` and run `browser-sync start --server` and Navigate to `http://localhost:3000`.


## Release Note

### Version: 2.0 
###### Date: 2017/11/02
- Feature Drill map was added.
- Added marker line while dragging a pie or bar.
- Feature Transform to English was recoded.
- Fixed some bugs.

### Version: 1.0 
###### Date: 2017/10/25
- Basic heat map.
- Heat map with pie charts or bar charts.



## About Author
- Percy Xu
- Wechat: xu616222774
- email: xu616222774@gmail.com