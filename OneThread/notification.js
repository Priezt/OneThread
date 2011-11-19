$(init);

function init(){
	var statistics = JSON.parse(localStorage['notification_stat']);
	console.log(statistics);
	$("#content")
		.empty()
		.addClass("mouseout");
	$.each(statistics, function(k, v){
		var nd = $("<div></div>")
			.addClass("site_update")
			.append(
				$("<img>")
					.attr("src", adapters[k].icon)
			)
			.append(
				$("<div></div>")
					.css("display", "inline-block")
					.css("margin", "2px")
					.text(v)
			)
		$("#content").append(nd);
	});
	$("#content")
		.hover(
			function(){
				$(this).removeClass("mouseout");
				$(this).addClass("mouseon");
			},
			function(){
				$(this).removeClass("mouseon");
				$(this).addClass("mouseout");
			}
		)
		.click(function(){
			console.log("content clicked");
			chrome.tabs.sendRequest(parseInt(localStorage["current_tab_id"]), {'func': 'focus'});
		});
}

