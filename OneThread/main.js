var conf = {};
var feed_stack = [];
var current_feed = '';
var adpt = '';
var errors = [];
var to_be_shown = [];
var cache = new Array();

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
		url: 'http://www.googleasdfasf.com',
		cache: false,
		success: function(data){
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
			'interest': ['weibo', 'kaixin']
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
		phase_end();
	}
}

function phase_2_get_url(){
	console.log("phase 2: " + adpt.url);
	$.ajax({
		url: adpt.url,
		cache: false,
		success: phase_3_data_callback,
		error: phase_error
	});
}

function phase_3_data_callback(data){
	console.log("phase 3");
	var result = adpt.parser(data);
	if(result && result.length > 0){
		console.log("item fetched: " + result.length);
		var items = [];
		for(var c=0;c<result.length;c++){
			if(is_new_item(result[c])){
				items.push(result[c]);
			}
		}
		phase_4_show_items(items);
	}else{
		phase_error();
	}
}

function phase_4_show_items(items){
	console.log("phase 4: " + items.length);
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
												.attr("src", adpt.icon)
										)
										.click(item_open_link_click)
								)
						).append(
							$("<td></td>")
								.addClass("ot_item_right")
								.append(item.content)
						)
				)
		);
		new_div.insertAfter($("#top_dummy"));
	}
	phase_end();
	//phase_1_get_adapter();
}

function phase_error(){
	console.log("phase error: " + current_feed);
	errors.push((new Date()).toUTCString() + ": " + current_feed);
	// todo: need login notification
	phase_1_get_adapter();
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
