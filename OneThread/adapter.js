var adapters = {
	'weibo': {
		'icon': 'img/weibo.png',
		'url': 'http://weibo.com/aj/mblog/fsearch',
		'login': '',
		'parser': function(data){
			//console.log(data);
			var result = [];
			var d = $(data.data);
			//console.log(d);
			$("#playground").empty();
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
					//console.log("click: " + src);
					if(src.indexOf('thumbnail') > 0){
						src = src.replace(/thumbnail/, 'bmiddle');
						$(this).css("cursor", "url(img/small.cur)");
					}else if(src.indexOf('bmiddle') > 0){
						src = src.replace(/bmiddle/, 'thumbnail');
						$(this).css("cursor", "url(img/big.cur)");
					}
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
		'login': '',
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
		'login': '',
		'parser': function(data){
			var result = [];
			var d = $(fetch_html(data));
			//console.log(d);
			$("#playground").empty();
			$("#playground").append(d);
			var nw = Date.now();
			//console.log(d);
			$("#playground div#divnews div.gw1").each(function(){
				//console.log($(this));
				var date = nw;
				var uid = md5($(this).find("div.newscnt").html());
				var link = "http://www.kaixin001.com/home";
				var author = $("");
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
			result = result.slice(0, 10);
			//console.log(result);
			return result;
		}
	}
};

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
