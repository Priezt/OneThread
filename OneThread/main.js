var conf = {};
var feed_stack = [];
var current_feed = '';
var adpt = '';
var errors = [];
var to_be_shown = [];
var cache = new Array();
var adapter_error = new Array();

$(init);

function init(){
	console.log("init");
	load_conf();
	$("#start").click(function(){
		start_main_loop();
	});
	$("#test").click(function(){
		test_func();
	});
}

function test_func(){
	$.ajax({
		url: 'http://www.kaixin001.com/home',
		cache: false,
		success: function(data){
			$("#playground")
				.empty()
				.append($(fetch_html(data)))
				.show();
			console.log("success");
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log("error");
		}
	});
}

function start_main_loop(){
	console.log('start main loop');
	window.setTimeout("tick()", 1000);
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
	window.setTimeout("check_update()", 1000);
	window.setTimeout("tick()", conf.interval * 60 * 1000);
}

function check_update(){
	console.log("check update");
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
			if(items[d].date >= items[d+1].date){
				var temp = items[d];
				items[d] = items[d+1];
				items[d+1] = temp;
			}
		}
	}
	var earliest_date = Date.now() - conf.hours * 60 * 60 * 1000;
	var result = [];
	for(var c=0;c<items.length;c++){
		if(items[c].date < earliest_date){
			break;
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
		);
		new_div.insertAfter($("#top_dummy"));
	}
}

function phase_6_show_notification(items){
	console.log("phase 6: " + items.length);
	for(var c=0;c<items.length;c++){
		var item = items[c];
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
	phase_end();
}

function phase_end(){
	console.log("phase end");
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
