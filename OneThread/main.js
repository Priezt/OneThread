var conf = {};
var feed_stack = [];
var current_feed = '';
var adpt = '';
var errors = [];
var to_be_shown = [];

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
	if(result){
		console.log("item fetched: " + result.length);
		var items = [];
		for(var c=0;c<result.length;c++){
			if(is_new_item(result[c])){
				items.push(result[c]);
			}
		}
		phase_4_show_items(items);
	}else{
		// todo: need login notification
		phase_1_get_adapter();
	}
}

function phase_4_show_items(items){
	console.log("phase 4: " + items.length);
	phase_1_get_adapter();
}

function phase_error(){
	console.log("phase error: " + current_feed);
	errors.push((new Date()).toUTCString() + ": " + current_feed);
	phase_1_get_adapter();
}

function phase_end(){
	console.log("phase end");
}

function is_new_item(item){
	// todo: filter rule
	return true;
}
