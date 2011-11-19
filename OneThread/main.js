var conf = {};
var feed_stack = [];
var current_feed = '';
var adpt = '';
var errors = [];
var to_be_shown = [];
var cache = new Array();
var adapter_error = {};
var running = false;
var notification = false;
var statistics;

$(init);

function init(){
	console.log("init");
	localStorage['notification_stat'] = JSON.stringify({});
	chrome.tabs.getCurrent(function(tab){
		localStorage["current_tab_id"] = "" + tab.id;
	});
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
		console.log('func: ' + request.func);
		if(request.func == "focus"){
			notification.cancel();
			chrome.tabs.update(parseInt(localStorage["current_tab_id"]), {
				selected: true
			});
		}
	});
	$("#top_dummy").hide();
	$("#refresh").show();
	$("#refresh_button").click(function(){
		window.setTimeout("check_update()", 100);
	});
	load_conf();
	load_select_sites();
	$("#start").click(function(){
		start_main_loop();
	});
	$("#test").click(function(){
		test_func();
	});
	start_main_loop();
}

function load_select_sites(){
	$("#select_sites").empty();
	$.each(adapters, function(k, v){
		var nd = $("<div></div>")
			.attr("title", k)
			.addClass("sites")
			.append(
				$("<img>")
					.attr("src", v.icon)
			);
		if($.inArray(k, conf.interest) >= 0){
			nd.addClass("site_selected");
		}else{
			nd.addClass("site_deselected");
		}
		nd.click(function(){
			var site = $(this).attr("title");
			var idx = $.inArray(site, conf.interest);
			if(idx >= 0){
				conf.interest.splice(idx, 1);
				$(this).removeClass("site_selected");
				$(this).addClass("site_deselected");
			}else{
				conf.interest.push(site);
				$(this).removeClass("site_deselected");
				$(this).addClass("site_selected");
			}
			save_conf();
		});
		$("#select_sites").append(nd);
	});
}

function test_func(){
	$.ajax({
		url: 'http://shuo.douban.com/',
		cache: false,
		success: function(data){
			$("#playground")
				.empty()
				.append($(fetch_html(data)))
				.show();
			$("#playground").append(
				$("<textarea></textarea>")
					.attr("cols", "200")
					.attr("rows", "20")
					.text(data)
			);
			console.log("success");
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log("error");
		}
	});
}

function start_main_loop(){
	console.log('start main loop');
	window.setTimeout("tick()", 100);
}

function load_conf(){
	if(localStorage['conf']){
		console.log('load conf');
		conf = JSON.parse(localStorage['conf']);
	}else{
		console.log('save default conf');
		conf = {
			'debug': true,
			'interval': 5,
			'hours': 24,
			'interest': []
		};
		save_conf();
	}
	console.log(conf);
}

function save_conf(){
	console.log('save conf');
	localStorage['conf'] = JSON.stringify(conf);
}

function tick(){
	console.log('tick: ' + (new Date()).toUTCString());
	window.setTimeout("check_update()", 100);
	window.setTimeout("tick()", conf.interval * 60 * 1000);
}

function check_update(){
	console.log("check update");
	if(running){
		return;
	}
	running = true;
	$("#top_dummy").show();
	$("#refresh").hide();
	$("#playground").empty();
	feed_stack = [];
	to_be_shown = [];
	for(var c=0;c<conf.interest.length;c++){
		feed_stack.push(conf.interest[c]);
	}
	phase_1_get_adapter();
}

function phase_1_get_adapter(){
	if(feed_stack.length > 0){
		current_feed = feed_stack.shift();
		console.log("phase 1: " + current_feed);
		adpt = adapters[current_feed];
		phase_2_get_url();
	}else{
		phase_final();
	}
}

function phase_2_get_url(){
	console.log("phase 2: " + adpt.url);
	$.ajax({
		url: adpt.url,
		cache: false,
		timeout: 30000,
		success: phase_3_data_callback,
		error: phase_error
	});
}

function phase_3_data_callback(data){
	console.log("phase 3");
	/*
	$("#playground").remove();
	$("body").append(
		$("<div></div>")
			.hide()
			.attr("id", "playground")
	);
	*/
	var result = adpt.parser(data);
	if(result && result.length > 0){
		console.log("item fetched: " + result.length);
		for(var c=0;c<result.length;c++){
			if(is_new_item(result[c])){
				result[c].adapter = current_feed;
				to_be_shown.push(result[c]);
			}
		}
		adapter_error[current_feed] = false;
		phase_1_get_adapter();
	}else{
		phase_error();
	}
}

function phase_4_sort_items(items){
	console.log("phase 4: " + items.length);
	for(var c=items.length-2;c>=0;c--){
		for(var d=0;d<=c;d++){
			if(items[d].date > items[d+1].date){
				var temp = items[d];
				items[d] = items[d+1];
				items[d+1] = temp;
			}
		}
	}
	var earliest_date = Date.now() - conf.hours * 60 * 60 * 1000;
	var result = [];
	for(var c=0;c<items.length;c++){
		//console.log("item date: " + time2str(items[c].date));
		//console.log("earliest date: " + time2str(earliest_date));
		if(items[c].date < earliest_date){
			continue;
		}
		result.push(items[c]);
	}
	console.log("result: " + result.length);
	return result;
}

function phase_5_show_items(items){
	console.log("phase 5: " + items.length);
	for(var c=0;c<items.length;c++){
		var item = items[c];
		var new_div = $("<div></div>")
			.addClass("ot_item");
		new_div.append(
			$("<table border=0></table>")
				.append(
					$("<tr></tr>")
						.append(
							$("<td></td>")
								.attr("valign", "top")
								.addClass("ot_item_left")
								.append(item.author)
								.append($("<br>"))
								.append(
									$("<a></a>")
										.attr("href", item.link)
										.append(
											$("<img>")
												.attr("src", adapters[item.adapter].icon)
										)
										.click(item_open_link_click)
								)
						).append(
							$("<td></td>")
								.attr("valign", "top")
								.addClass("ot_item_right")
								.append(item.content)
						)
				)
				.append(
					$("<tr></tr>")
						.append(
							$("<td></td>")
								.attr("colspan", "2")
								.attr("align", "left")
								.addClass("time_area")
								.text(time2str(item.date))
						)
				)
		);
		new_div.insertAfter($("#top_dummy"));
	}
}

function phase_6_show_notification(items){
	console.log("phase 6: " + items.length);
	statistics = {};
	if(localStorage['notification_stat']){
		statistics = JSON.parse(localStorage['notification_stat']);
	}
	for(var c=0;c<items.length;c++){
		var item = items[c];
		if(! statistics[item.adapter]){
			statistics[item.adapter] = 0;
		}
		statistics[item.adapter]++;
	}
	console.log(statistics);
	if(items.length > 0){
		if(notification){
			notification.cancel();
		}
		window.setTimeout("open_notification()", 1000);
	}
}

function open_notification(){
	console.log("open notification");
	localStorage['notification_stat'] = JSON.stringify(statistics);
	notification = webkitNotifications.createHTMLNotification('notification.html');
	notification.onclose = function(){
		localStorage['notification_stat'] = JSON.stringify({});
	};
	notification.show();
}

function phase_7_show_error_list(){
	console.log("phase 7");
	console.log(adapter_error);
	var has_error = false;
	$("#error_list").empty();
	$.each(adapter_error, function(k, v){
		if(v){
			var new_div = $("<div></div>")
				.addClass("error_item")
				.append(
					$("<img>")
						.attr("src", adapters[k].icon)
				)
				.click(function(){
					window.open(adapters[k].login, "_blank");
				});
			$("#error_list").append(new_div);
			has_error = true;
		}
	});
	if(has_error){
		$("#warning").show();
	}else{
		$("#warning").hide();
	}
}

function phase_error(){
	console.log("phase error: " + current_feed);
	//errors.push((new Date()).toUTCString() + ": " + current_feed);
	adapter_error[current_feed] = true;
	// todo: need login notification
	phase_1_get_adapter();
}

function phase_final(){
	console.log("phase final");
	to_be_shown = phase_4_sort_items(to_be_shown);
	phase_5_show_items(to_be_shown);
	phase_6_show_notification(to_be_shown);
	phase_7_show_error_list();
	phase_end();
}

function phase_end(){
	console.log("phase end");
	$("#top_dummy").hide();
	$("#refresh").show();
	running = false;
}

function is_new_item(item){
	if(! cache[current_feed]){
		cache[current_feed] = new Array();
	}
	if(cache[current_feed][item.uid]){
		return false;
	}else{
		cache[current_feed][item.uid] = true;
		return true;
	}
}
