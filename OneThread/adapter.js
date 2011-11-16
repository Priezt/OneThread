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
				var date = $(this).find("p.info a.date").attr("date");
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
	'kaixin': {
		'url': 'http://www.kaixin001.com',
		'login': '',
		'parser': function(data){
			return [];
		}
	}
};

function item_link_click(event){
	console.log($(this).attr("href"));
	event.preventDefault();
}

function item_open_link_click(event){
	console.log($(this).attr("href"));
	event.preventDefault();
}
