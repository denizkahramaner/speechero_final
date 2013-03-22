//	Equals function added to Object prototypes so we can 
//	compare classes to one another for removal from callback list
//	this won't work if the same class has all the same properties 
//	don't really care about being bullet proof here, just quick.
//	If you feel like breaking it, be my guest.

var _equals = function(x, y)
{
	var p;
	for(p in x) 
	{
		if(typeof(y[p])=='undefined') {return false;}
	}
	return true;
}

var heroKinectEngine =
{
	dwellEnter: -1,
	dwellCurrent: 0,
	dwellLimit: 2000,	//	2 seconds
	callbacks: [],	// array of callback functions to call
	isInitialized: false,	//	initialization flag
	JOINTS: ['SHOULDER_CENTER', 'SHOULDER_LEFT', 'SHOULDER_RIGHT',
			'ELBOW_LEFT', 'ELBOW_RIGHT', 'HAND_LEFT', 'HAND_RIGHT', 
			'WRIST_LEFT', 'WRIST_RIGHT', 'HIP_CENTER', 'HIP_LEFT', 
			'HIP_RIGHT', 'KNEE_LEFT', 'KNEE_RIGHT', 'FOOT_LEFT', 
			'FOOT_RIGHT', 'HEAD'],
	GESTURES: ['SWIPE'],

	PLAYERS: 1,
	cursor: 0,
	cursorTargetObjects: [],

	jnt: function(j) { return this.JOINTS.indexOf(j); },

	initCursor: function()
	{
		heroKinectEngine.cursor = 
			kinect.cursor.make()
				.useSmoothing( 2 )
				.useBothHands( true )
				.action( 'z-axis', -51 )
				.activate();
		return this;
	},

	addCursorRegion: function(region)
	{
		heroKinectEngine.cursorTargetObjects.push(region);
		heroKinectEngine.cursor.addRegion(region, 4);

		region.addEventListener('kinectTouchStart', function(e)
		{
			//var curs = document.getElementById("_cursor");
			$("._cursorOut").toggleClass("_cursorOver");

			var d=new Date();
			var t=d.getTime();
			heroKinectEngine.dwellEnter = t;
			heroKinectEngine.dwellCurrent = t;

		}, false);

		region.addEventListener('kinectTouchMove', function(e)
		{
			if ( heroKinectEngine.dwellCurrent - heroKinectEngine.dwellEnter >= heroKinectEngine.dwellLimit)
			{
				$(this).click();
			}
			var d=new Date();
			var t=d.getTime();

			heroKinectEngine.dwellCurrent = t;

		}, false);

		region.addEventListener('kinectTouchEnd', function(e)
		{

			heroKinectEngine.dwellEnter = -1;
			heroKinectEngine.dwellCurrent = 0;

		}, false);
		return this;
	}.bind(this),

	initKinect: function()
	{
		//	Start kinect engine. Should only be 
		//	called once in the life of the program.

		if (!heroKinectEngine.isInitialized)
		{
			//	Hasn't been initialized yet. 
			//	Initializes the kinect: Note that kinect
			//	will only initialize after document has 
			//	fully loaded.
			kinect.setUp({
				players:  this.PLAYERS,                    // # of players, max = 2
				joints:   this.JOINTS,    // array of joints to track
				gestures: this.GESTURES
			})
			.sessionPersist()
			.modal.make('css/knctModal.css')    // Green modal connection bar
			.notif.make();

			//	dedicated movement listener
			kinect.onMessage(function() 
			{
				for ( var i = 0; i < heroKinectEngine.callbacks.length; i ++ )
				{
					heroKinectEngine.callbacks[i]._function(this.coords, 
						heroKinectEngine.callbacks[i]._object);
				}
			});

			kinect.addEventListener('SWIPE', function(index, joint, direction)
			{
				console.log("swiper no swiping");
			});

			// set initialize to true;
			heroKinectEngine.isInitialized = true;
		}
		else 
		{
			//	Has been initialized. Init this sheet.
			console.log("Kinect engine already initialized. To add a new callback, use heroKinectEngine.registerCallback");
		}
		return this;
	},

	registerCallback: function(callFunction, object)
	{
		//	Registers a new callback function that handles 
		//	points from kinectjs onMessage function.
		var callback = {_function: callFunction, _object: object};
		heroKinectEngine.callbacks.push(callback);
	},

	unbindCallback: function(object)
	{
		for ( var i = 0; i < heroKinectEngine.callbacks.length; i ++ )
		{
			if (_equals(object, heroKinectEngine.callbacks[i]._object))
			{
				heroKinectEngine.callbacks.splice(i, 1);
			}
		}
	},

	fixZeroTo200: function(coord)
	{
		coord = Math.max( ( coord + 100 ), 0 );
		coord = Math.min(coord, 200);
		return coord;
	}
}