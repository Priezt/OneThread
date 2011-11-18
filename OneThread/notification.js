$(init);

function init(){
	var statistics = JSON.parse(localStorage['notification_stat']);
	console.log(statistics);
	$("#content").empty();
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
	$("body").click(function(){
		console.log("body clicked");
	});
}

