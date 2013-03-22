var progressHero = 
{
	curWidth: 0,
	progressIntervalId: 0,
	/*Assume there is a Twitter bootstrap progress bar element in the DOM.
	This function animates that bar from 0% to 100% in totalTime seconds
	intervalTime defines how often to update the bar (default=0.1seconds, so that it seems very continuous)*/
	animate:  function(totalTime,intervalTime){
		intervalTime = typeof intervalTime !== 'undefined' ? intervalTime : 0.1;
		this.curWidth = 0;
		var _this = this;
		this.progressIntervalId = window.setInterval(function(){
			_this.curWidth += 100*intervalTime/totalTime;
			switch(Math.floor(_this.curWidth / 25))
			{
				case 0:
					$("#intro").html("<h1>Introduction</h1>");
					break;
				case 1:
					$("#intro").html("<h3>Introduction</h3>");
					$("#arg1").html("<h1>Argument 1</h1>");
					break;
				case 2:
					$("#arg1").html("<h3>Argument 1</h3>");
					$("#arg2").html("<h1>Argument 2</h1>");
					break;
				case 3:
					$("#arg2").html("<h3>Argument 2</h3>");
					$("#conclusion").html("<h1> Conclusion </h1>")
				default:
					break;
			}
			$(".bar").css("width",_this.curWidth.toString()+"%");
		},intervalTime*1000);		
	},

	_reset: function()
	{
		window.clearInterval(this.progressIntervalId);	//	clears our interval timer	
		this.curWidth = 0;								//	resets the bar width

		//	redraw all the html so it's properly bolded
		$("#intro").html("<h1>Introduction</h1>");
		$("#arg1").html("<h3>Argument 1</h3>");
		$("#arg2").html("<h3>Argument 2</h3>");
		$("#conclusion").html("<h3> Conclusion </h3>");

		//	redraw bar
		$(".bar").css("width", this.curWidth.toString() + "%");
	}
}