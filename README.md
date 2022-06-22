# Web User Activity Tracker - Javascript

![](assets/images/uat_icon.png)

### Features :
- [x]  Record user **activity** throughout the application (like typing & clicking events)
- [x]  Record user **interation flow** with your application and **replay** it to gain more insight. 
- [x] Log user metadata like **unique browser id** and other **browser metadata**

# How to use it ?
- Clone the repo
- Entrypoint (main file) is  :  `index.js` file in the root.

#### Initialization :

The index.js file exports a class `UAT_TRACKER` . So you need to initialize it as constructor.

    # can be used after NPM release
	const tracker = require('web_user_activity_tracker'); 
	# used to initialize the constructor
	const uat_tracker = new tracker.UAT_TRACKER(); 
    

#### Other important methods :
	# Start the service 
	uat_tracker.start();
	
	#Stop the service
	uat_tracker.stop();
	
	#Reset the service
	uat_tracker.reset();
	
	#Get tracking data
	uat_tracker.getTrackingData();

#### Fetching tracking data at interval 　

```javascript
function getTrackingData(){
	console.log( uat_tracker.getTrackingData() );
}

# fetch tracking data at an interval of 5000ms
const myTimeout = setInterval( getTrackingData, 5000 ); 

```

#### Using as CDN 　

```javascript
<script src="dist/index.min.js"  type="text/javascript"></script>

# Reset Data
reset();

# Start Recording
startRecoding();

# Stop Recording
stopRecording();

# Log Recorded Data
console.log(getTrackingData());

```


### End