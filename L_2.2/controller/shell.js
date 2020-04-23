var initPageNo = 0;
var speed = 500;
var default_delay = 0;
var playerControllers = angular.module('PlayerControllers', []);
var interaction;

var uagent = navigator.userAgent.toLowerCase();
var platformAgent = navigator.platform.toLowerCase();

var audio_mute = false;

function getQuery(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
}

function GetIEVersion() {
	var sAgent = window.navigator.userAgent;
	var Idx = sAgent.indexOf("MSIE");

	// If IE, return version number.
	if (Idx > 0)
		return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

	// If IE 11 then look for Updated user agent string.
	else if (!!navigator.userAgent.match(/Trident\/7\./))
		return 11;

	else
		return 0; //It is not IE
}


var myApp = angular.module('myApp', [
	'ngRoute',
	'PlayerControllers'

]).filter('to_trusted', ['$sce', function ($sce) {
	return function (text) {
		return $sce.trustAsHtml(text);
	};
}]);

myApp.directive("homepage", function () {
	return {
		scope: false,
		templateUrl: "views/common/home.html"
	};
});


function getXY(selector) {
	var index = 1;
	$(selector).each(function () {
		console.log(selector + ":nth-child(" + index + "){ left: " + $(this).css('left') + ";top: " + $(this).css('top') + ";}");
		index++;
	});
}
var audio_img = "audio_on_btn";
var audio_mute_img = "audio_off_btn";
playerControllers.controller('PlayerController', ['$scope', '$http', '$routeParams', '$sce', '$timeout', function ($scope, $http, $routeParams, $sce, $timeout) {

	$scope.current_topic = 0;
	$scope.current_page = 0;
	$scope.total_topic = 0;
	$scope.total_page = 0;
	$scope.home_status = "show";
	$scope.audio_src = audio_img;
	$scope.audio_text = "Audio";
	$scope.visited_page = 0;
	$http.get('content/' + language + '/' + file)
		.then(function (res) {
			$scope.content = res.data;
			$("body").fadeIn(1000);
			startAudio = res.data.course.audio;

			$scope.topic = $scope.content.menu.topic;
			$scope.total_topic = $scope.topic.length;
			$scope.total_page = getTotalPages();
			console.log($scope.total_topic);
			console.log($scope.total_page);
			$scope.gotoPage(0, 0);

			$scope.bookmark = false;
			$scope.visited_page = getBookmark();
			//$scope.visited_page = 5;
			//alert($scope.visited_page);
			if (!($scope.visited_page == "" || $scope.visited_page == "null" ||
			$scope.visited_page == null || $scope.visited_page == undefined)) {
				$("#bookmark").show();
				$scope.bookmark = true;

			}
			$("body").show();
	});



	$scope.transcript_status = "hide";
	$scope.resource_status = "hide";

	$scope.nextEnable = true;
	$scope.alphabetArr = ["a", "b", "c", "d", "e", "f"];
	$scope.startBtn = function () {
		$("#splashScreen").fadeOut(500);
		$("#header").fadeIn(700);
		$scope.gotoPage(Number(startPage));
		$("#preloader").addClass("screen");
	}

	$scope.next = function () {
		if ($scope.curr_page + 1 < $scope.total_page) {
			$scope.curr_page++;
			$scope.setTopicPage($scope.curr_page);
		}

	}
	$scope.gotoBookMark = function (){
		$scope.setTopicPage($scope.visited_page);
		$scope.bookmark = false;
	}
	$scope.prev = function () {
		if ($scope.curr_page != 0) {
			//console.log($scope.curr_page);
			$scope.curr_page--;
			$scope.setTopicPage($scope.curr_page);
		}
	}

	$scope.exit_course = function () {
		window.close();
	}

	$scope.hide_controls = function () {
		$scope.controller = 'controller_hide';
	}

	$scope.show_controls = function () {
		$scope.controller = 'show';
	}
	$scope.hide_controls();

	$scope.start_course = function () {
		$scope.show_controls();
		//change the number to go directly to the page.
		$scope.setTopicPage(1);
	}


	$scope.gotoPage = function (current_topic, current_page) {
		//console.log(current_topic == 0 && current_page == 0);
		if (current_topic == 0 && current_page == 0) {
			$scope.hide_controls();
		} else {
			$scope.show_controls();
		}
		$scope.current_topic = current_topic;
		$scope.current_page = current_page;
		$scope.curr_page = getPageNumber(current_topic, current_page);
		//showPreloader();
		$scope.page = $scope.topic[current_topic].pages[current_page];
		$scope.page.visited = true;

		interaction = $scope.page.interaction;
		$scope.loading = "show";
		$scope.pageURL = "views/common/blank.html";
		$scope.LoadURL = "views/" + $scope.page.file;

		console.log($scope.page.file);
		$("#page").scrollTop(0);

		if ($scope.page.style != null)
			$("#pageStyle").attr("href", "views/" + $scope.page.style);

		$(".menu ul").hide();
		$scope.home_status = "hide";
		playAudio($scope.page.audio);

	}
	$scope.audio_click = function () {
		if ($scope.audio_text == "Audio") {
			$scope.audio_src = audio_mute_img;
			$scope.audio_text = "Mute";
			$("#audio_img").attr("src", "image/shell/green/" + audio_mute_img + "_selected.png");
			$("#player").prop("muted", true);
			audio_mute = true;
		} else {
			$scope.audio_src = audio_img;
			$scope.audio_text = "Audio";
			$("#audio_img").attr("src", "image/shell/green/" + audio_img + "_selected.png");
			$("#player").prop("muted", false);
			audio_mute = false;
		}
	}
	$scope.audio_pause = function () {
			$scope.audio_src = audio_img;
			$scope.audio_text = "Audio";
			$("#player").prop("pause", true);
	}
	$scope.home = function (status) {
		$scope.home_status = status;
		$(".menu ul").hide();
		$scope.audio_click();
	}
	$scope.getTopicStatus = function (i) {
		var total_pages = $scope.topic[i].pages.length;
		var page_visited = 0;
		for (var j = 0; j < $scope.topic[i].pages.length; j++) {
			if ($scope.topic[i].pages[j].visited == true) {
				page_visited++;
			}
		}
		//console.log(page_visited/total_pages);
		return (page_visited / total_pages) * 100 + "%";
	}
	$scope.pageLoaded = function (url) {
		//console.log(url);
		if (url == "views/common/blank.html") {
			$scope.pageURL = $scope.LoadURL;
			return;
		}
		$scope.loading = "hide";
		$("#page").fadeIn(250);
		//pageLoaded();
	}

	$scope.transcript_click = function () {
		//console.log($scope.transcript_status );
		if ($scope.transcript_status == "hide") {
			$scope.transcript_status = "show";

		} else {
			$scope.transcript_status = "hide";
		}
		$(".menu ul").hide();
	}
	$scope.transcript_close = function () {
		$scope.transcript_status = "hide";
	}

	$scope.resource_click = function () {
		//console.log($scope.resource_status );
		if ($scope.resource_status == "hide") {
			$scope.resource_status = "show";
		} else {
			$scope.resource_status = "hide";
		}
		$(".menu ul").hide();
	}
	$scope.resource_close = function () {
		$scope.resource_status = "hide";
	}

	$scope.getWindowStatus = function () {
		if ($scope.resource_status == "show" || $scope.transcript_status == "show") {
			return "show";
		} else {
			return "hide";
		}
	}

	function pageLoaded() {
		//hidePreloader();
		//playAudio(topic.audio);
		console.log("pageLoaded");
		$("#page").fadeIn(500);
		//console.log("pageLoaded");
	}

	$scope.setTopicPage = function (page_no) {
		setBookmark(page_no);
		var pages = 0;

		if (page_no == 0) {
			$scope.gotoPage(0, 0);
			$scope.hide_controls();
		} else {
			for (var i = 0; i < $scope.total_topic; i++) {
				for (var j = 0; j < $scope.topic[i].pages.length; j++) {
					pages++;
					//console.log(pages+" == "+page_no);
					if (pages == page_no) {
						if (j != $scope.topic[i].pages.length - 1)
							$scope.gotoPage(i, j + 1);
						else
							$scope.gotoPage(i + 1, 0);
						return;
					}
					$scope.topic[i].pages[j].visited = true;
					console.log("$scope.topic["+i+"].pages["+j+"]  = " + $scope.topic[i].pages[j].visited)
				}
			}
		}
	}

	function getTotalPages() {
		var pages = 0;
		for (var i = 0; i < $scope.total_topic; i++) {
			pages += $scope.topic[i].pages.length;
		}
		return pages;
	}

	function getPageNumber(t, p) {
		var page_no = 0;

		for (var i = 0; i < t; i++) {
			page_no += $scope.topic[i].pages.length;
		}
		//console.log(page_no , p , 1)
		return page_no + p;
	}

	

}]);
function checkComplete() {
	var scope = angular.element("body").scope();
	console.log(scope.topic.length, scope.topic[0].pages.length);
	var total = 0;
	var visited = 0;
	for(var i=0;i<scope.topic.length;i++){
		for(var j=0;j<scope.topic[i].pages.length;j++){
			total++;
			if(scope.topic[i].pages[j].visited == true)
			{
				visited++;
			}
		}
	}
	console.log(total+" == "+visited);
	if(total == visited){
		//alert("completed");
		scormBroker.Complete('passed');
		on_unload();
	}
	//setBookmark(currentPageNumber, visited_page);
	
}
function pauseAudio() {
	audio = $("#player")
	audio.trigger("pause");
}

function playAudio(filename) {
	console.log(filename);
	audio = $("#player")
	audio.trigger("pause");
	audio.attr("src", filename);
	console.log(new Date().toLocaleTimeString() + " audio - " + filename);
	audio.get(0).onloadeddata = function () {
		console.log(new Date().toLocaleTimeString() + " audio loaded")
		if (audio_mute == true) {
			$("#player").prop("muted", true);
		} else {
			$("#player").prop("muted", false);
		}
		audio.trigger("play");
	};
	//$(".next.button").stop();
	anime.remove(".next .next_arr")
	$(".next .next_arr").css("transform", "translateX(0)");
	console.log("interaction = " + interaction);

	audio.get(0).onended = function () {
		if (interaction == false) {
			console.log("audio ended interaction = " + interaction);
			blinkNext();
		}
		blinkNext()
	};
	//blinkNext();
}
function blinkNext(){
	console.log(" blinkNext " + $(".next.button").hasClass("disable"));
	if($(".next.button").hasClass("disable") != true){
		anime({
			targets: ".next .next_arr",
			duration: 1000,
			translateX: [-39, 39],
			loop: true,
			delay: function(el, i, l) {
				return i * 200;
			  },
			easing: 'easeInOutSine'
		});

		
	}
	checkComplete();
}
function trackInteractionCompletion(arr, len){
	console.log("track", arr);
	var cnt = 0;
	for(var i=0;i<arr.length;i++){
		if(arr[i] == true)
		{
			cnt++;
		}
	}
	console.log(cnt+" == " + len);
	if(cnt == len){
		
		blinkNext();
	}
}
function getMilliSecond(s) {
	if (!isNaN(s)) {
		return s * 1000;
	}
	return 0;
}

function updateTrackTime(track) {
	var currTime = Math.round(track.currentTime * 10) / 10;
	var duration = Math.floor(track.duration).toString();
	//console.log(currTime);
}

function trackTime() {
	var currTime = Math.round(document.getElementById("player").currentTime * 10) / 10;
	return (currTime);
}

function durationTime() {
	var duration = Math.round(document.getElementById("player").duration * 10) / 10;
	return (duration);
}
var interval;

function syncAudio(elem,anim_type) {
	if(anim_type == undefined){
		anim_type = "leftToRight"
	}
	console.log(elem.length);
	elem.each(function () {
		if($(this).attr("data-anim") != "zoom")
			$(this).css("opacity", 0);
	});
	clearInterval(interval);
	interval = setInterval(function () {
		elem.each(function () {
			
			if ($(this).attr("data-time")) {
				if (trackTime() > ($(this).attr("data-time") - 0.2) && $(this).attr("is-animated") != "true") {
					console.log(trackTime() + " == " + durationTime())
					$(this).attr("is-animated", "true");
					if($(this).attr("data-anim") == "zoom"){
						anime({
							targets: $(this).get(0),
							scale: 1.1,
							direction: 'alternate',
							loop: 1,
							duration: 500,
							easing: 'easeInOutSine'
						});
					}else{
						if (anim_type == "bottomToTop") {
							anime({
								targets: $(this).get(0),
								translateY: [50, 0],
								opacity: [0, 1],
								duration: 1000
							});
						} else {
							anime({
								targets: $(this).get(0),
								translateX: [50, 0],
								opacity: [0, 1],
								duration: 1000
							});
						}
					}
				}else if(trackTime() > ($(this).attr("data-disappear") - 0.2) && $(this).attr("is-animated") == "true" 
							&& $(this).attr("is-disappear") != "true"
							&& $(this).attr("data-disappear")
						)
				{
					console.log(trackTime()+" > " + ($(this).attr("data-disappear") - 0.2))
					$(this).attr("is-disappear", "true");
					anime({
						targets: $(this).get(0),
						translateY: [0, 50],
						opacity: [1, 0],
						duration: 1000
					});

				}
			}
		})

		if (trackTime() > 0 && trackTime() == durationTime()) {
			clearInterval(interval);
		}
	}, 500);
}
function setTime(t){
	start_time = t;
}
/*function getDrag(selector, start_time = 1){
	$(selector).each(function(){
		var left = $(this).css("left");
		var top = $(this).css("top");
		var time = $(this).attr("data-time");

		time_result = "\"time\": \""+ time + "\", ";
		left_result = "\"left\": \""+ left + "\", ";
		top_result = "\"top\": \""+ top + "\" ";

		console.log("{" +time_result + left_result + top_result + "}, ");
			
	 });
}*/
$().ready(function () {
	$(window).resize(function () {
		//resize();
	});

	function resize() {
		var max_width = 1366;
		if ($(window).width() < max_width) {
			var per = ($(window).width()) / max_width;
			console.log("per = " + per);
			$(".shell").css("transform", "scale(" + per + ")");
		} else {
			$(".shell").css("transform", "scale(1)");
		}
	}
})