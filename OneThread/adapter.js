var adapters = {
	'weibo': {
		'icon': 'img/weibo.png',
		'url': 'http://weibo.com/aj/mblog/fsearch',
		'login': 'http://weibo.com/',
		'parser': function(data){
			//console.log(data);
			var result = [];
			var d = $(data.data);
			//console.log(d);
			$("#playground").append(d);
			$("#playground dl.feed_list").each(function(){
				//console.log("got");
				var date = parseInt($(this).find("p.info a.date").attr("date"));
				var uid = $(this).attr("mid");
				var link = "http://weibo.com" + $(this).find("p.info a.date").attr("href");
				var author = $(this).find("dt.face a img");
				$(this).find("dd.clear").remove();
				$(this).find(".info").remove();
				$(this).find("dt.face").remove();
				$(this).find("a").each(function(){
					var href = $(this).attr("href");
					if(href.indexOf("/") == 0){
						href = "http://weibo.com" + href;
					}
					$(this).attr("href", href);
				}).click(item_link_click);
				$(this).find("img.bigcursor").click(function(){
					var src = $(this).attr("src");
					console.log("click: " + src);
					if(src.indexOf('thumbnail') > 0){
						src = src.replace(/thumbnail/, 'bmiddle');
						$(this).css("cursor", "url(img/small.cur)");
					}else if(src.indexOf('bmiddle') > 0){
						src = src.replace(/bmiddle/, 'thumbnail');
						$(this).css("cursor", "url(img/big.cur)");
					}
					console.log("exchange: " + src);
					$(this).attr("src", src);
				}).css("cursor", "url(img/big.cur)");
				var item = {
					'content': $(this),
					'author': author,
					'date': date,
					'uid': uid,
					'link': link
				};
				result.push(item);
			});
			//console.log(result);
			return result;
		}
	},
	'twitter': {
		'icon': 'img/twitter.png',
		'url': 'http://twitter.com',
		'login': 'http://twitter.com/',
		'parser': function(data){
			var result = [];
			var d = $(fetch_html(data));
			//console.log(d);
			$("#playground").empty();
			$("#playground").append(d);
			$("#playground div.js-stream-item").each(function(){
				//console.log($(this).find("div.stream-item-content").attr("data-status"));
				var data_status = JSON.parse($(this).find("div.stream-item-content").attr("data-status"));
				//console.log(data_status);
				var date = Date.parse(data_status.created_at);
				var uid = data_status.id_str;
				var link = "http://twitter.com";
				var author = $(this).find("div.tweet-image img");
				var content = $(this).find("div.tweet-content");
				content.find("div.tweet-row").last().remove();
				content.find("a").each(function(){
					var href = $(this).attr("href");
					if(href.indexOf("/") == 0){
						href = "http://twitter.com" + href;
					}
					$(this).attr("href", href);
				}).click(item_link_click);
				var item = {
					'content': content,
					'author': author,
					'date': date,
					'uid': uid,
					'link': link
				};
				//console.log(item);
				result.push(item);
			});
			//console.log(result);
			return result;
		}
	},
	'kaixin': {
		'icon': 'img/kaixin.png',
		'url': 'http://www.kaixin001.com/home',
		'login': 'http://www.kaixin001.com/',
		'parser': function(data){
			var result = [];
			var d = $(fetch_html(data));
			$("#playground").append(d);
			var nw = Date.now();
			//console.log(d);
			$("#playground div#divnews div.gw1").each(function(){
				//console.log($(this));
				var date_string = $(this).find("div.b_func_bar > span").first().text();
				//console.log(date_string);
				var date = parse_kaixin_time(date_string);
				//console.log(date);
				var uid = md5($(this).find("div.newscnt").html());
				var link = "http://www.kaixin001.com/home";
				var author = $("<div></div>").css("display", "none");
				var content = $(this).find("div.newscnt");
				content.find("a").each(function(){
					var href = $(this).attr("href");
					if(href.indexOf("/") == 0){
						href = "http://www.kaixin001.com" + href;
					}else if(href.indexOf("http") != 0){
						href = "http://www.kaixin001.com/home/" + href;
					}
					$(this).attr("href", href);
					$(this).attr("target", "_blank");
				}).click(item_link_click);
				var item = {
					'content': content,
					'author': author,
					'date': date,
					'uid': uid,
					'link': link
				};
				result.push(item);
			});
			//result = result.slice(0, 20);
			//console.log(result);
			return result;
		}
	},
	'douban': {
		'icon': 'img/douban.png',
		'url': 'http://shuo.douban.com',
		'login': 'http://shuo.douban.com/',
		'disable': true,
		'parser': function(data){
			var result = [];
			var lines = data.split(/[\r\n]+/);
			var json = "";
			var re = new RegExp(/^\s*App\.Cache\.set.*App\.Collections\.HomeTimeline\((\[.*\]), \{ category\: \'all\'\}\)\);$/);
			for(var c=0;c<lines.length;c++){
				//console.log(lines[c]);
				var re_result = re.exec(lines[c]);
				if(re_result){
					json = re_result[1];
					break;
				}
			}
			//console.log(json);
			if(json != ""){
				var d = JSON.parse(json);
				console.log(d);
				for(var c=0;c<d.length;c++){
					var post = d[c];
					var author = $("<a></a>")
						.attr("href", "http://shuo.douban.com/#!/" + post.user.uid)
						.append(
							$("<img>")
								.attr("src", post.user.small_avatar)
						)
						.click(item_link_click);
					var dt = new Date(post.created_at);
					var date = dt.getTime();
					var uid = post.id;
					var link = "http://shuo.douban.com/";
					var content = "";
					var item = {
						'content': content,
						'author': author,
						'date': date,
						'uid': uid,
						'link': link
					};
					result.push(item);
				}
				//result = result.slice(0, 20);
				//console.log(result);
				return result;
			}else{
				return false;
			}
		}
	},
	'facebook': {
		'icon': 'img/facebook.png',
		'url': 'http://www.facebook.com',
		'login': 'http://www.facebook.com',
		'parser': function(data){
			var all_match = fetch_re_all(data, new RegExp(/\bbig_pipe\.onPageletArrive\((\{.*\})\);<\/script>$/));
			for(var c=0;c<all_match.length;c++){
				var ob = JSON.parse(all_match[c]);
				if(ob.append == "home_stream" && ob.id == "pagelet_sub_stream_0"){
					var content = $(ob.content.pagelet_sub_stream_0);
					$("#playground").append(content);
				}
			}
			var result = [];
			$("#playground div.storyContent").each(function(){
				var date = fetch_facebook_timestamp($(this));
				var uid = Math.random().toString();
				var link = "http://www.facebook.com";
				var author = $(this).find("a.actorPhoto");
				var content = $(this);
				content.find("a").each(function(){
					$(this).attr("target", "_blank");
				}).click(item_link_click);
				content.find("form").remove();
				content.find("a.actorPhoto").remove();
				var item = {
					'content': content,
					'author': author,
					'date': date,
					'uid': uid,
					'link': link
				};
				//console.log(item);
				result.push(item);
			});
			return result;
		}
	}
};

$.each(adapters, function(k, v){
	if(v.disable){
		delete adapters[k];
	}
});

console.log(adapters);

function item_link_click(event){
	console.log($(this).attr("href"));
	window.open($(this).attr("href"), '_blank');
	event.preventDefault();
}

function item_open_link_click(event){
	console.log($(this).attr("href"));
	window.open($(this).attr("href"), '_blank');
	event.preventDefault();
}

function md5(str){
	return calcMD5(str);
}

function parse_kaixin_time(date_string){
	var parts = date_string.split(' ');
	var current_date = new Date();
	var default_date = current_date.getTime() - 2 * 24 * 60 * 60 * 1000;
	if(parts.length != 2){
		return default_date;
	}
	var rparts = parts[1].split(":");
	if(rparts.length != 2){
		return default_date;
	}
	if(parts[0] == "\u4eca\u5929"){
		current_date.setHours(parseInt(rparts[0]));
		current_date.setMinutes(parseInt(rparts[1]));
		return current_date.getTime();
	}else if(parts[0] == "\u6628\u5929"){
		current_date.setHours(parseInt(rparts[0]));
		current_date.setMinutes(parseInt(rparts[1]));
		return current_date.getTime() -  1 * 24 * 60 * 60 * 1000;
	}else{
		return default_date;
	}
}

function time2str(date){
	var d = new Date();
	d.setTime(date);
	var result = "";
	result += d.getFullYear();
	result += "/";
	result += (d.getMonth() + 1);
	result += "/";
	result += d.getDate();
	result += " ";
	result += d.toLocaleTimeString();
	return result;
}

function fetch_facebook_timestamp(d){
	var feedback_params = d.find("form input[name='feedback_params']").val();
	var re1 = RegExp(/\"content_timestamp\"\:\"([0-9]+)\"/);
	var re_result_1 = re1.exec(feedback_params);
	if(re_result_1){
		return parseInt(re_result_1[1]) * 1000;
	}else{
		var date_string = d.find("abbr.timestamp").attr("data-date");
		if(date_string){
			//console.log("date string matched: " + date_string);
			return Date.parse(date_string);
		}else{
			//console.log("nothing match, use now()");
			return Date.now();
		}
	}
}
