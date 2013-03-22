var mathHero =
{
	mag3d: function(x1, x2)
	{
		return Math.sqrt( 
						Math.pow( ( x1.x - x2.x ), 2 ) +
						Math.pow( ( x1.y - x2.y ), 2 ) +
						Math.pow( ( x1.z - x2.z ), 2 ) );  
	},

	inSphere: function(center, radius, x)
	{
		return Math.pow( (x.x - center.x), 2 ) +
				Math.pow( (x.y - center.y), 2 )	+
				Math.pow( (x.z - center.z), 2 ) < (radius * radius);
	}
};

var monitorHero = 
{
	/* Performance Monitor
	 * ------------------------------------------------
	 * Records hand position (for right now). Stores 
	 * hand position in 2D array for later use with report 
	 * card. Keeps track of waist position to determine appropriate
	 * hand gestures ie big and above waist or little-to-no-movement
	 * below the waist. Keeps a running score for the user to see
	 * as a percentage of things they've done well over all the things
	 * they've done well and done poorly. Will attempt to do some 
	 * basic rocking analysis as well (might want to focus on this
	 * for the next iteration). Print hand gestures for machine 
	 * learning later.
	 * 
	 */

	//	Wiggle room for user to make mistakes, move their 
	//	hands a little bit in either direction. 
	SMALL_MOVEMENT_RADIUS: 4,
	SMALL_MOVEMENT_ALPHA: 0.2,
	DWELL_ALPHA: 10,

	QUALITY: 4,
	_WIDTH: 300,
	_HEIGHT: 375,
	SCREEN_WIDTH: 300,
	SCREEN_HEIGHT: 375,
	SIZE: 0,
	HEAT_BUCKETS: [],

	NUM_X_BUCKETS: 48,
	NUM_Y_BUCKETS: 64,
	hand_coordinate_array: 0,
	waistY: 0,
	waist_offset: 0,	// offset for people with short arms
	movement_duration: 25,	// 25/30 seconds of movement
	left_movement_vector: [],	// cache about 1 second of movement
	right_movement_vector:[],  
	hand_points: [],

    initHandTracker: false,
    trackable: [],

    onPageExit: function()
    {
    	this.saveTrackable();
    	this.saveHeatMap();
    },

    plotTrackable: function(tracked, parent)
    {
    	jQuery.noConflict();

		var trackable = JSON.parse(tracked);
		var xCoords = [];
		for (var i=0; i < trackable.length; i++){
			xCoords.push(trackable[i].x)
		}

		$.jqplot(parent,  [xCoords],{
			title: "Your Movement Over Time",
			
			axesDefaults: {
				tickOptions: {
					//showGridline:false
				},
				//pad:0
			},
			axes:{
				xaxis:{
					label:"Time (in seconds)",
					pad:0
				},
				yaxis:{
					label: "Hip Horizontal Position"
				}
			},
			seriesDefaults:{
				showMarker:false
			}
		});
    },

    drawHeatMap: function(heatMap, parent)
    {

    	$(parent).html("");	// let's clear everything in the parent

    	//	Double calculating in the event that it's being called from 
    	//	another window
    	this._HEIGHT = Math.floor( this.SCREEN_HEIGHT / this.QUALITY );
    	this._WIDTH = Math.floor( this.SCREEN_WIDTH / this.QUALITY );
    	this.SIZE = this._WIDTH * this._HEIGHT;

    	var heat_buckets = JSON.parse(heatMap);

    	var _canvas = document.createElement("canvas");
			_canvas.width = this._WIDTH;
			_canvas.height = this._HEIGHT;
			_canvas.style.width = this.SCREEN_WIDTH + 'px';
			_canvas.style.height = this.SCREEN_HEIGHT + 'px';
		$(parent).append(_canvas);

		var _context = _canvas.getContext("2d");
		_context.fillStyle = "rgb(255,253,246)";
		_context.fillRect(0, 0, this._WIDTH, this._HEIGHT);
		var _image = _context.getImageData(0, 0, this._WIDTH, this._HEIGHT);
		var _data = _image.data;

		for (var i = 0; i < this.SIZE; i ++ )
		{
			var x = Math.floor(i / this._WIDTH);
			var y = i - ( x * this._WIDTH )
			var index = ( x + ( y * this._WIDTH ) ) * 4;

			var pixel = heat_buckets[i] > 255 ? 255 : heat_buckets[i];
			if ( pixel > 200 )
			{
				_data[index + 0] = 255;	//r
				_data[index + 1] = 0;	//g
				_data[index + 2] = 0;	//b
			}
			else if ( pixel > 150 )
			{
				_data[index + 0] = 255;	//r
				_data[index + 1] = 128;	//g
				_data[index + 2] = 0;	//b
			}
			else if ( pixel > 100 )
			{
				_data[index + 0] = 250;	//r
				_data[index + 1] = 236;	//g
				_data[index + 2] = 40;	//b
			}
			else if ( pixel > 50 )
			{
				_data[index + 0] = 0;	//r
				_data[index + 1] = 255;	//g
				_data[index + 2] = 0;	//b
			}
			else if ( pixel > 0 )
			{
				_data[index + 0] = 0;	//r
				_data[index + 1] = 0;	//g
				_data[index + 2] = 255;	//b
			}
			else 
			{
				_data[index + 0] = 255;	//r
				_data[index + 1] = 253;	//g
				_data[index + 2] = 246;	//b
			}
		}
		_context.putImageData(_image, 0, 0);
    },

    drawMoventPlot: function()
    {

    },

    initHeatMap: function()
    {
    	this._HEIGHT = Math.floor( this.SCREEN_HEIGHT / this.QUALITY );
    	this._WIDTH = Math.floor( this.SCREEN_WIDTH / this.QUALITY );
    	this.SIZE = this._WIDTH * this._HEIGHT;

    	//	Initialize everything with 
    	for ( var i = 0; i < this.SIZE; i ++ )
    	{
    		this.HEAT_BUCKETS[i] = 0;
    	}
    	return this;
    },

    addToHeatMap: function(x, y)
    {
    	//	Adds x and y coordinate to heat map and increements value at 
    	//	that position
    	this.HEAT_BUCKETS[ Math.floor(x) + (Math.floor(y) * this._WIDTH)] += 1;
    	this.saveHeatMap();
    },
    saveTrackable: function()
    {
    	localStorage.trackable = JSON.stringify(this.trackable);
    },

    saveHeatMap: function()
    {
    	localStorage.heatMap = JSON.stringify(this.HEAT_BUCKETS);
    },

    addToTrackable: function(joint)
    {
    	//	Add trackable joint to database for later visualization
    	this.trackable.push(joint);
    	this.saveTrackable();
    },

    checkForGestures: function(self)
    {
    	if ( self.hand_points.length > 20 )
    	{
    		console.log(self.hand_points[self.hand_points.length - 1].rightHand.x,
    					self.hand_points[self.hand_points.length - 21].rightHand.x);
    		if ( (self.hand_points[self.hand_points.length - 1].rightHand.x -
    			self.hand_points[self.hand_points.length - 21].rightHand.x ) > 100 )
    		{

    			document.kinectCommand("next");

    			self.initHandTracker = false;
    			var _self = self;
    			window.setInterval(function(){_self.initHandTracker = true }, 1000);

    			self.hand_points = [];
    		}
    		else if ( (self.hand_points[self.hand_points.length - 1].leftHand.x -
    			self.hand_points[self.hand_points.length - 21].leftHand.x ) > 100 )
    		{
    			
    			document.kinectCommand("previous");

    			self.initHandTracker = false;
    			var _self = self;
    			window.setInterval(function(){_self.initHandTracker = true }, 1000);

    			self.hand_points = [];
    		}
    	}
    },

    trackHands: function(coords, _this)
    {
    	if ( _this.initHandTracker )
    	{
			var handLeft = coords[0][heroKinectEngine.jnt("HAND_LEFT")];
			var handRight = coords[0][heroKinectEngine.jnt("HAND_RIGHT")];
			var d = new Date();
			var t = d.getTime();
			_this.hand_points.push({rightHand: handRight, 
									leftHand: handLeft,
									time: t });
			
			_this.checkForGestures(_this);
		}	
    },

    kinectCallback: function(coords, _this)
    {
    	//	Bleh I'm tired, maybe this will work
    	//	basically, the kinect callback acccepts hand coordinates
    	//	and adds them to the heat map after normalization 
    	//	and interpolation
    	var hipCenter = coords[0][heroKinectEngine.jnt("HIP_CENTER")];
		var handLeft = coords[0][heroKinectEngine.jnt("HAND_LEFT")];
		var handRight = coords[0][heroKinectEngine.jnt("HAND_RIGHT")];

		handRight.x = heroKinectEngine.fixZeroTo200(handRight.x);
		handRight.y = heroKinectEngine.fixZeroTo200(handRight.y);
		handRight.x = ( ( handRight.x / 200) * _this.SCREEN_WIDTH ) / _this.QUALITY;
		handRight.y = ( ( handRight.y / 200) * _this.SCREEN_HEIGHT) / _this.QUALITY;

		handLeft.x = heroKinectEngine.fixZeroTo200(handLeft.x);
		handLeft.y = heroKinectEngine.fixZeroTo200(handLeft.y);
		handLeft.x = ( ( handLeft.x / 200 ) * _this.SCREEN_WIDTH ) / _this.QUALITY;
		handLeft.y = ( ( handLeft.y / 200 ) * _this.SCREEN_HEIGHT )/ _this.QUALITY;

		//hipCenter.x = heroKinectEngine.fixZeroTo200(hipCenter.x);
		//hipCenter.y = heroKinectEngine.fixZeroTo200(hipCenter.y);

		hipCenter.x = ( ( hipCenter.x / 100 ) * _this.SCREEN_WIDTH ) / _this.QUALITY;
		hipCenter.y = ( ( hipCenter.y / 100 ) * _this.SCREEN_HEIGHT ) / _this.QUALITY;

		//_this.addToHeatMap(handRight.x, handRight.y);
		//_this.addToHeatMap(handLeft.x, handLeft.y);

		_this.addToHeatMap(hipCenter.y, hipCenter.x);
		_this.addToTrackable(hipCenter);

    },

    interpolate_hand_position: function(hand)
	{
		/*
		 * interpolate_hand_position
		 * ----------------------------------------------------------
		 * interpolates hand position so it fits within a defined 
		 * number of buckets in the array.
		 */
		return { 'x': Math.max( ( (hand.x / this.SCREEN_WIDTH ) * this.NUM_X_BUCKETS ), 0),
				 'y': Math.max( ( (hand.y / this.SCREEN_HEIGHT) * this.NUM_Y_BUCKETS ), 0) }
	},

	updateWaist: function(waist_y)
	{
		this.waistY = waist_y + this.waist_offset;
		return this;
	},

	isAboveWaist: function(hand)
	{
		//console.log(hand.y + "--->" + this.waistY);
		if ( hand.y < this.waistY )
		{
			return true;
		}
		return false;
	},

	init_handtracker: function(num_x_buckets, num_y_buckets)
	{
		if (this.initHandTracker === false)
		{
			if (typeof num_x_buckets != "undefined" )
			{
				 this.NUM_X_BUCKETS = num_x_buckets;
			}
			if (typeof y_height !="undefined")
			{
				this.NUM_Y_BUCKETS = num_y_buckets;
			}

			//	Initiate buckets	
			this.hand_coordinate_array = new Array(this.NUM_X_BUCKETS);
			for (var i = 0; i < this.NUM_X_BUCKETS; i ++ )
			{	
				this.hand_coordinate_array[i] = 0;
				this.hand_coordinate_array[i] = new Array(this.NUM_Y_BUCKETS);
				for (var j = 0; j < this.NUM_Y_BUCKETS; j ++)
				{
					this.hand_coordinate_array[i][j] = 0;
				}
			}
			this.initHandTracker = true;
		}
		return this;
	},

	cache_hands: function(left_hand, right_hand)
	{
		/* cache_hands
		 * -----------------------------------------------------------
		 * stores hands in a 2d array. Will store exactly
		 * movement_durations worth of hand positions and then start 
		 * popping off the last hand position to make room for the new
		 * hand position.
		 */
		if (this.left_movement_vector.length === this.movement_duration)
		{
			// Vector is full, start throwing away things at the end
			// to make room
			this.left_movement_vector.pop();
			this.left_movement_vector.unshift(left_hand);
			this.right_movement_vector.pop();
			this.right_movement_vector.unshift(right_hand);
		}
		else
		{
			// Vector not completely full. carry on.
			this.left_movement_vector.push(left_hand);
			this.right_movement_vector.push(right_hand);
		}
	},

	add_hands: function(left_hand, right_hand)
	{
		/* track_hands
		 * ---------------------------------------------
		 * tracks hand positions and stores them in a bucket
		 * of hand positions. Also stores them in cache for 
		 * heuristic analysis. 
		 *
		 */
		if (this.initHandTracker === false)
		{
			// Auto initialize hand tracker in 
			// the event that the user hasn't done
			// that yet
			this.initHandTracker();
			this.initHandTracker = true;
		}
		//this.record_hand_position(left_hand, right_hand);
		this.cache_hands(left_hand, right_hand);
		//this.analyze();
		return this;
	},

	record_hand_position: function(left_hand, right_hand)
	{
		/*
		 * record_hand_position
		 * ------------------------------------------------------------
		 * records all hand positions in a 2d array for analysis after 
		 * the person is finished speaking.
		 *
		 */
		left_hand_interpolated = Math.floor(this.interpolate_hand_position(
															left_hand));
		right_hand_interpolated = Math.floor(this.interpolate_hand_position(
															right_hand));
		this.hand_coordinate_array[left_hand_interpolated.x][left_hand_interpolated.y] += 1;
		this.hand_coordinate_array[right_hand_interpolated.x][right_hand_interpolated.y] += 1;
	},

	analyze: function( callback )
	{
		if (this.left_movement_vector.length === this.movement_duration)
		{
			// If the vector is full analyze //


			var right_in_sphere = 0;
			var right_out_of_sphere = 0;
			var left_in_sphere = 0;
			var left_out_of_sphere = 0;
			var central_left = this.left_movement_vector[Math.floor(this.left_movement_vector.length / 2)];
			var central_right = this.right_movement_vector[Math.floor(this.right_movement_vector.length / 2)];
			var left_above_waist = this.isAboveWaist(central_left);
			var right_above_waist = this.isAboveWaist(central_right);
			var left_large_movement = false;
			var right_large_movement = false;

			for (var hand = 0; hand < this.left_movement_vector.length; hand ++)
			{
				if (mathHero.inSphere(central_left, this.SMALL_MOVEMENT_RADIUS, 
							this.left_movement_vector[hand]))
				{
					left_in_sphere += 1;
				}
				else 
				{
					left_out_of_sphere += 1;
				}
				if (mathHero.inSphere(central_right, this.SMALL_MOVEMENT_RADIUS,
							this.right_movement_vector[hand]))
				{
					right_in_sphere += 1;
				}
				else
				{
					right_out_of_sphere += 1;
				}
			}
			if ((left_out_of_sphere / ( left_in_sphere + left_out_of_sphere)) 
				> this.SMALL_MOVEMENT_ALPHA)
			{
				left_large_movement = true;
			}
			if ((right_out_of_sphere / (right_in_sphere + right_out_of_sphere)) 
				> this.SMALL_MOVEMENT_ALPHA)
			{
				right_large_movement = true;
			}

			if (typeof callback === 'function')
			{
				callback({hand: 'left', aboveWaist: left_above_waist,
							largeMovement: left_large_movement
						});
				callback({hand:'right', aboveWaist: right_above_waist,
							largeMovement: right_large_movement
						});
			}
			//console.log("hand: left: aboveWaist: " + left_above_waist + "largeMovement?: " + left_large_movement);
			/*
			self.postMessage(JSON.stringify(
			{
				hand: 'left', 
				aboveWaist: left_above_waist,
				largeMovement: left_large_movement
			}));
			self.postMessage(JSON.stringify(
			{
				hand: 'right',
				aboveWaist: right_above_waist,
				largeMovement: right_large_movement
			}));*/
		}
	}
};

addEventListener('message', function(e)     
{
	var data = e.data;
	switch (data.func)
	{
		case 'initialize':
			performance_monitor.init_handtracker();
			break;
		case 'add_hands':     
			performance_monitor.add_hands(data.left_hand, data.right_hand);
			break;
		case 'stop':
			this.close();
			break;
		case 'updateWaist':
			performance_monitor.updateWaist(data.waist);
			break;
		default:
			break;
	};
}, false);