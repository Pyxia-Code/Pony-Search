"user strict";

function escape_HTML(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

function Browser(browser_parent, content){
	var that = this;
	this.browser_parent = browser_parent;
	this.content = content;
	this.content_current;
	this.view_max_page;
	this.elements_per_page = 72;
	this.search_phrase = ""; //Search phrase is always lower case to be case insensitive
	this.search_owner_phrase = "";
	this.sort_key = "";

	//Create HTML elements
	//Search bar
	this.browse_search = document.createElement("input");
	this.browse_search.classList.add("browse_search");
	this.browse_search.type = "text";
	this.browse_search.placeholder = "Search";
	this.browse_search.onchange = function(obj){
		that.search_phrase = obj.target.value.toLowerCase();
		that.array_reload();
	}
	this.browser_parent.append(this.browse_search);
	//Owner search bar
	this.browse_search = document.createElement("input");
	this.browse_search.classList.add("browse_search");
	this.browse_search.type = "text";
	this.browse_search.placeholder = "Uploader search";
	this.browse_search.onchange = function(obj){
		that.search_owner_phrase = obj.target.value.toLowerCase();
		that.array_reload();
	}
	this.browser_parent.append(this.browse_search);

	//Browse options
	this.option_changed = function(obj){
		if(obj.target.name == "sort"){
			that.sort_key = obj.target.value;
			that.array_reload();
		}
		else if(obj.target.name == "season"){
			that.browse_episode_select.innerHTML = "";
			for(let i in that.mlp_seasons[that.browse_season_select.value]){
				let opt = document.createElement("option");
				opt.innerHTML = that.mlp_seasons[that.browse_season_select.value][i];
				opt.value = that.mlp_seasons[that.browse_season_select.value][i];
				that.browse_episode_select.append(opt);
			}
			that.season = that.browse_season_select.value;
		}
		if(obj.target.name == "episode" || obj.target.name == "season"){
			that.episode = that.browse_episode_select.value;
			console.log(that.season + that.episode);
			that.array_reload();
		}
	};

	this.browse_options_div = document.createElement("div");
	this.browse_options_div.classList.add("browse_options");

	this.sort_by_options = [
		["---", ""],
		["Name", "title"],
		["Date", "upload_date"],
		["Uploader", "uploader"]
	];
	this.season = "-";
	this.episode = "-";
	this.mlp_seasons = {
		"-": ["-"],
		"S1": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25", "E26"],
		"S2": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S3": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13"],
		"S4": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S5": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S6": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S7": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S8": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"S9": ["E01+02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13",
		       "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25+26"],
		"Other": ["Before G4"],
	};
	this.airing_dates = {
		"OtherBefore G4": [00000000, 20101009],
		"S1E01": [20101010, 20101021],
		"S1E02": [20101022, 20101028],
		"S1E03": [20101029, 20101104],
		"S1E04": [20101105, 20101111],
		"S1E05": [20101112, 20101118],
		"S1E06": [20101119, 20101125],
		"S1E07": [20101126, 20101202],
		"S1E08": [20101203, 20101209],
		"S1E09": [20101210, 20101216],
		"S1E10": [20101217, 20101223],
		"S1E11": [20101224, 20110106],
		"S1E12": [20110107, 20110127],
		"S1E13": [20110128, 20110203],
		"S1E14": [20110204, 20110210],
		"S1E15": [20110211, 20110217],
		"S1E16": [20110218, 20110224],
		"S1E17": [20110225, 20110303],
		"S1E18": [20110304, 20110310],
		"S1E19": [20110311, 20110317],
		"S1E20": [20110318, 20110324],
		"S1E21": [20110325, 20110407],
		"S1E22": [20110408, 20110414],
		"S1E23": [20110415, 20110421],
		"S1E24": [20110422, 20110428],
		"S1E25": [20110429, 20110505],
		"S1E26": [20110506, 20110916],
		"S2E01": [20110917, 20110923],
		"S2E02": [20110924, 20111014],
		"S2E03": [20111015, 20111021],
		"S2E04": [20111022, 20111104],
		"S2E05": [20111105, 20111111],
		"S2E06": [20111112, 20111118],
		"S2E07": [20111119, 20111125],
		"S2E08": [20111126, 20111202],
		"S2E09": [20111203, 20111209],
		"S2E10": [20111210, 20111216],
		"S2E11": [20111217, 20120106],
		"S2E12": [20120107, 20120113],
		"S2E13": [20120114, 20120120],
		"S2E14": [20120121, 20120127],
		"S2E15": [20120128, 20120203],
		"S2E16": [20120204, 20120210],
		"S2E17": [20120211, 20120217],
		"S2E18": [20120218, 20120302],
		"S2E19": [20120303, 20120309],
		"S2E20": [20120310, 20120316],
		"S2E21": [20120317, 20120323],
		"S2E22": [20120324, 20120330],
		"S2E23": [20120331, 20120406],
		"S2E24": [20120407, 20120420],
		"S2E25+26": [20120421, 20121109],
		"S3E01+02": [20121110, 20121116],
		"S3E03": [20121117, 20121123],
		"S3E04": [20121124, 20121200],
		"S3E05": [20121201, 20121207],
		"S3E06": [20121208, 20121214],
		"S3E07": [20121215, 20121221],
		"S3E08": [20121222, 20121228],
		"S3E09": [20121229, 20130118],
		"S3E10": [20130119, 20130125],
		"S3E11": [20130126, 20130208],
		"S3E12": [20130209, 20130215],
		"S3E13": [20130216, 20131122],
		"S4E01+02": [20131123, 20131129],
		"S4E03": [20131130, 20131206],
		"S4E04": [20131207, 20131213],
		"S4E05": [20131214, 20131220],
		"S4E06": [20131221, 20131227],
		"S4E07": [20131228, 20140103],
		"S4E08": [20140104, 20140110],
		"S4E09": [20140111, 20140117],
		"S4E10": [20140118, 20140124],
		"S4E11": [20140125, 20140200],
		"S4E12": [20140201, 20140207],
		"S4E13": [20140208, 20140214],
		"S4E14": [20140215, 20140221],
		"S4E15": [20140222, 20140300],
		"S4E16": [20140301, 20140307],
		"S4E17": [20140308, 20140314],
		"S4E18": [20140315, 20140321],
		"S4E19": [20140322, 20140328],
		"S4E20": [20140329, 20140404],
		"S4E21": [20140405, 20140418],
		"S4E22": [20140419, 20140425],
		"S4E23": [20140426, 20140502],
		"S4E24": [20140503, 20140509],
		"S4E25+26": [20140510, 20150403],
		"S5E01+02": [20150404, 20150410],
		"S5E03": [20150411, 20150417],
		"S5E04": [20150418, 20150424],
		"S5E05": [20150425, 20150501],
		"S5E06": [20150502, 20150515],
		"S5E07": [20150516, 20150522],
		"S5E08": [20150523, 20150612],
		"S5E09": [20150613, 20150619],
		"S5E10": [20150620, 20150626],
		"S5E11": [20150627, 20150703],
		"S5E12": [20150704, 20150710],
		"S5E13": [20150711, 20150911],
		"S5E14": [20150912, 20150918],
		"S5E15": [20150919, 20150925],
		"S5E16": [20150926, 20151002],
		"S5E17": [20151003, 20151009],
		"S5E18": [20151010, 20151016],
		"S5E19": [20151017, 20151023],
		"S5E20": [20151024, 20151030],
		"S5E21": [20151031, 20151106],
		"S5E22": [20151107, 20151113],
		"S5E23": [20151114, 20151120],
		"S5E24": [20151121, 20151127],
		"S5E25+26": [20151128, 20160325],
		"S6E01+02": [20160326, 20160401],
		"S6E03": [20160402, 20160408],
		"S6E04": [20160409, 20160415],
		"S6E05": [20160416, 20160429],
		"S6E06": [20160430, 20160506],
		"S6E07": [20160507, 20160513],
		"S6E08": [20160514, 20160520],
		"S6E09": [20160521, 20160527],
		"S6E10": [20160528, 20160603],
		"S6E11": [20160604, 20160610],
		"S6E12": [20160611, 20160729],
		"S6E13": [20160730, 20160805],
		"S6E14": [20160806, 20160812],
		"S6E15": [20160813, 20160819],
		"S6E16": [20160820, 20160826],
		"S6E17": [20160827, 20160902],
		"S6E18": [20160903, 20160909],
		"S6E19": [20160910, 20160916],
		"S6E20": [20160917, 20160923],
		"S6E21": [20160924, 20161000],
		"S6E22": [20161001, 20161007],
		"S6E23": [20161008, 20161014],
		"S6E24": [20161015, 20161021],
		"S6E25+26": [20161022, 20170414],
		"S7E01+02": [20170415, 20170421],
		"S7E03": [20170422, 20170428],
		"S7E04": [20170429, 20170505],
		"S7E05": [20170506, 20170512],
		"S7E06": [20170513, 20170519],
		"S7E07": [20170520, 20170526],
		"S7E08": [20170527, 20170602],
		"S7E09": [20170603, 20170609],
		"S7E10": [20170610, 20170616],
		"S7E11": [20170617, 20170804],
		"S7E12": [20170805, 20170804],
		"S7E13": [20170805, 20170811],
		"S7E14": [20170812, 20170818],
		"S7E15": [20170819, 20170825],
		"S7E16": [20170826, 20170901],
		"S7E17": [20170902, 20170908],
		"S7E18": [20170909, 20170915],
		"S7E19": [20170916, 20170922],
		"S7E20": [20170923, 20170929],
		"S7E21": [20170930, 20171006],
		"S7E22": [20171007, 20171013],
		"S7E23": [20171014, 20171020],
		"S7E24": [20171021, 20171027],
		"S7E25+26": [20171028, 20180323],
		"S8E01+02": [20180324, 20180330],
		"S8E03": [20180331, 20180406],
		"S8E04": [20180407, 20180413],
		"S8E05": [20180414, 20180420],
		"S8E06": [20180421, 20180427],
		"S8E07": [20180428, 20180504],
		"S8E08": [20180505, 20180511],
		"S8E09": [20180512, 20180518],
		"S8E10": [20180519, 20180525],
		"S8E11": [20180526, 20180601],
		"S8E12": [20180602, 20180608],
		"S8E13": [20180609, 20180803],
		"S8E14": [20180804, 20180803],
		"S8E15": [20180804, 20180810],
		"S8E16": [20180811, 20180817],
		"S8E17": [20180818, 20180824],
		"S8E18": [20180825, 20180900],
		"S8E19": [20180901, 20180907],
		"S8E20": [20180908, 20180914],
		"S8E21": [20180915, 20180921],
		"S8E22": [20180922, 20180928],
		"S8E23": [20180929, 20181005],
		"S8E24": [20181006, 20181012],
		"S8E25+26": [20181013, 20190405],
		"S9E01+02": [20190406, 20190412],
		"S9E03": [20190413, 20190419],
		"S9E04": [20190420, 20190426],
		"S9E05": [20190427, 20190503],
		"S9E06": [20190504, 20190510],
		"S9E07": [20190511, 20190517],
		"S9E08": [20190518, 20190524],
		"S9E09": [20190525, 20190600],
		"S9E10": [20190601, 20190607],
		"S9E11": [20190608, 20190614],
		"S9E12": [20190615, 20190621],
		"S9E13": [20190622, 20190802],
		"S9E14": [20190803, 20190809],
		"S9E15": [20190810, 20190816],
		"S9E16": [20190817, 20190823],
		"S9E17": [20190824, 20190830],
		"S9E18": [20190831, 20190906],
		"S9E19": [20190907, 20190913],
		"S9E20": [20190914, 20190920],
		"S9E21": [20190921, 20190927],
		"S9E22": [20190928, 20191004],
		"S9E23": [20191005, 20191011],
		"S9E24": [20191012, 20191011],
		"S9E25+26": [20191012, 20696968],
	};

	//Sort by
	let text = document.createElement("span");
	text.innerHTML = "Sort by:";
	this.browse_options_div.append(text);
	this.browse_sort_select = document.createElement("select");
	this.browse_sort_select.name = "sort";
	this.browse_sort_select.onchange = this.option_changed;
	for(let i in this.sort_by_options){
		let opt = document.createElement("option");
		opt.innerHTML = this.sort_by_options[i][0];
		opt.value = this.sort_by_options[i][1];
		this.browse_sort_select.append(opt);
	}
	this.browse_options_div.append(this.browse_sort_select);

	//Season
	text = document.createElement("span");
	text.innerHTML = "Season:";
	this.browse_options_div.append(text);
	this.browse_season_select = document.createElement("select");
	this.browse_season_select.name = "season";
	this.browse_season_select.onchange = this.option_changed;
	for(let i in this.mlp_seasons){
		let opt = document.createElement("option");
		opt.innerHTML = i;
		opt.value = i;
		this.browse_season_select.append(opt);
	}
	this.browse_options_div.append(this.browse_season_select);

	//Episode
	text = document.createElement("span");
	text.innerHTML = "Episode:";
	this.browse_options_div.append(text);
	//this.browse_options_div.innerHTML += "Episode:";
	this.browse_episode_select = document.createElement("select");
	this.browse_episode_select.name = "episode";
	this.browse_episode_select.onchange = this.option_changed;
	for(let i in this.mlp_seasons[this.browse_season_select.value]){
		let opt = document.createElement("option");
		opt.innerHTML = this.mlp_seasons[this.browse_season_select.value][i];
		opt.value = this.mlp_seasons[this.browse_season_select.value][i];
		this.browse_episode_select.append(opt);
	}
	this.browse_options_div.append(this.browse_episode_select);
	
	this.browser_parent.append(this.browse_options_div);

	//Browse stats
	this.browse_tab_stats = document.createElement("center");
	this.browse_tab_stats.classList.add("browse_tab_stats");
	this.browser_parent.append(this.browse_tab_stats);

	//Elements
	this.elements_parent = document.createElement("center");
	this.elements_parent.classList.add("videos");
	this.browser_parent.append(this.elements_parent);

	//Controls
	var browse_page_controls = document.createElement("center");
	browse_page_controls.classList.add("browse_page_controls");
	this.browser_parent.append(browse_page_controls);

	this.view_prev_btn = document.createElement("button");
	this.view_prev_btn.onclick = function(){that.view_prev()};
	this.view_prev_btn.innerHTML = "<";
	browse_page_controls.append(this.view_prev_btn);

	this.page_input = document.createElement("input");
	this.page_input.type = "text";
	this.page_input.onchange = function(){that.view_page_input(this)};
	browse_page_controls.append(this.page_input);

	this.view_next_btn = document.createElement("button");
	this.view_next_btn.onclick = function(){that.view_next()};
	this.view_next_btn.innerHTML = ">";
	browse_page_controls.append(this.view_next_btn);

	//Functions
	this.get_key = function(key){
		for(var i in this.content){
			if(this.content[i]["key"] == key){
				return JSON.parse(JSON.stringify(this.content[i])); //Return a copy instead of a reference
			}
		}
	};

	this.array_reload = function(){
		//Reapplies all the filters and sorts the content array
		//Then executes _view_reload for the new array to be shown
		const t0 = performance.now(); //Benchmarking

		//Sort and filter content array
		this.content_current = this.content.slice();
		if(this.search_phrase){
			this.content_current = this.content_current.filter(function(a){
				return a["title"].toLowerCase().includes(that.search_phrase) ||
				       a["uploader"].toLowerCase().includes(that.search_phrase) ||
				       String(a["tags"]).toLowerCase().includes(that.search_phrase);
			});
		}
		if(this.search_owner_phrase){
			this.content_current = this.content_current.filter(function(a){return a["uploader"].toLowerCase().includes(that.search_owner_phrase);});
		}
		if(this.sort_key){
			this.content_current.sort(function(a,b){return a[that.sort_key].localeCompare(b[that.sort_key]);});
		}
		if(this.season+this.episode != "--"){
			let airing_date = this.airing_dates[this.season + this.episode];
			console.log(airing_date);
			let min_date = airing_date[0];
			let max_date = airing_date[1];
			this.content_current = this.content_current.filter(function(a){
				return Number(a["upload_date"]) >= min_date &&
				       Number(a["upload_date"]) <= max_date;
			});
		}

		const t1 = performance.now();
		const td = (t1-t0).toFixed(2);
		console.log(`Query took ${td} ms`);

		//Show stats
		this.browse_tab_stats.innerHTML = this.content_current.length;
		this.browse_tab_stats.innerHTML += "/";
		this.browse_tab_stats.innerHTML += this.content.length;
		this.browse_tab_stats.innerHTML += " in ";
		this.browse_tab_stats.innerHTML += td;
		this.browse_tab_stats.innerHTML += "ms";

		this.view_page = 0;
		this.view_max_page = Math.floor(this.content_current.length/this.elements_per_page);
		this._view_reload();
	};
	this.create_element = function(metadata, url=""){
		//Returns an element
		var element = document.createElement("a");
		url = "https://youtube.com/watch?v=" + metadata["id"];
		element.href = url;
		element.classList.add("element");

		element.title += "Name: " + metadata["title"] + "\n";
		if(metadata["uploader"])
			element.title += "Uploader: " + metadata["uploader"] + "\n";
		if(metadata["upload_date"])
			element.title += "Upload date: " + metadata["upload_date"] + "\n";
		if(metadata["tags"])
			element.title += "Tags:\n" + metadata["tags"].join("\n") + "\n";

		//Thumbnail
		var thumbnail_a = document.createElement("a");
		var thumbnail = document.createElement("img");
		thumbnail.classList.add("element_thumbnail");
		if(metadata["unavailable"]==true){
			thumbnail.classList.add("unavailable");
		}
		if(metadata["reupload"]==true){
			thumbnail.classList.add("reupload");
		}
		//If thumbnail 404s replace it and a link to the video with an archived version
		//TODO: This isn't 100% reliable, as some videos don't have thumbnails
		//      and checking for 404 errors by measuring image size isn't
		//      reliable, although it works suprisingly well
		var archives = Object.keys(metadata["archived"]);
		if(archives.length > 0){
			thumbnail.archiveurl = metadata["archived"][archives[0]];
			thumbnail.onload = function(){
				if(this.naturalHeight==90 && this.naturalWidth==120){
					this.parentElement.href = this.archiveurl;
					var ext_pos = this.archiveurl.lastIndexOf(".");
					this.src = this.archiveurl.substring(0, ext_pos) + ".jpg";
					this.onload = null;
					this.classList.add("unavailable");
				}
			};
		}
		thumbnail.src = metadata["thumbnail"];

		thumbnail_a.append(thumbnail)
		element.append(thumbnail);

		//Info
		var element_info = document.createElement("div");
		element_info.classList.add("element_info");
		
		var title = document.createElement("a");
		title.classList.add("element_title");
		title.innerHTML = escape_HTML(metadata["title"]);
		element_info.append(title);

		var uploader_a = document.createElement("a");
		uploader_a.href = metadata["uploader_url"];
		var uploader = document.createElement("span");
		uploader.classList.add("element_uploader");
		uploader.innerHTML = escape_HTML(metadata["uploader"]);
		uploader_a.append(uploader);
		element_info.append(uploader_a);

		element.append(element_info);

		return element;
	};
	this._view_reload = function(){
		//Reload the element div
		//This is executed when page no. is changed
		//When filters are changed array_reload is executed which then executes _view_reload

		//Lock controls so it can't be pressed while a page is loading
		this.view_prev_btn.disabled = 1;
		this.view_next_btn.disabled = 1;
		this.page_input.disabled = 1;
		//Page number
		this.page_input.value = this.view_page;
		//Reload the element view
		this.elements_parent.innerHTML = "";
		for(var i=this.view_page*this.elements_per_page;
		    i<Math.min(this.content_current.length, (this.view_page+1)*this.elements_per_page);
		    i++){
			var el = this.create_element(this.content_current[i]);
			if(el) this.elements_parent.append(el);
		}
		//Unlock controls
		this.page_input.disabled = 0;
		if(this.view_page == 0){
			this.view_prev_btn.disabled = 1;
		}else{
			this.view_prev_btn.disabled = 0;
		}
		if(this.view_page == this.view_max_page){
			this.view_next_btn.disabled = 1;
		}else{
			this.view_next_btn.disabled = 0;
		}
	};
	/* Controls */
	this.view_next = function(){
		this.view_page+=1;
		this._view_reload();
	};
	this.view_prev = function(){
		this.view_page-=1;
		this._view_reload();
	};
	this.view_page_input = function(obj){
		var obj_val = Number(obj.value);
		if(!isNaN(obj_val)){
			if((0 <= obj_val) && (obj_val <= this.view_max_page)){
				this.view_page = obj_val;
			}
			else if(obj_val < 0){
				this.view_page = 0;
			}
			else if(obj_val > this.view_max_page){
				this.view_page = this.view_max_page;
			}
		}
		this._view_reload();
	};
}

