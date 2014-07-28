var path = require('path');
var cradle = require('cradle');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var Promise = require('bluebird');


module.exports = function(app, passport, server) {
	// =====================================
	// TAKE PICTURE ========================
	// =====================================
	app.get("/takepicture", function (req, res){
    /* Default settings */
    var host 				= 'http://neryuuk.cloudant.com'; // Host in Cloudant
    var database 			= 'homeguard'; // Name of the Database in Cloudant
    var file 				= 'file.jpg'; // Name of the attachment
    var IP 					= 'neryuuk.ddns.net'; // IP of Raspberyy Pi device
    var PORT 				= '5050'; // Port where the Python server in Raspberry Pi is listening
    var WebSocketClient 	= require('websocket').client; // Library used to create the websocket
    var fs 					= require('fs'); // Library used to save the file in the server
    // var uuid 				= require('node-uuid'); // Library used to create uuid to solve async file saving problem
    var c 					= new(cradle.Connection)(host); // Setting up a connection to Cloudant
    var client 				= new WebSocketClient(); // Creating the websocket
    var homeguard 			= c.database(database); // Getting a instance of the database from Cloudant
    client.connect('ws://'+IP+':'+PORT); // Connecting through the websocket to the Raspberry Pi


    function getFile (id){ // Function to get the file from Cloudant and embed in a HTML
    var attachmentName = 'file.jpg'; // 
    var fileName = uuid.v4(); // Generating the uuid to save the file into server
    var downloadPath = path.join(__dirname, '../tmp/pictures/'+fileName.toString()+'.jpg'); // Setting the path of where to save the file
    var writeStream = fs.createWriteStream(downloadPath); // Creating the write stream to save the file into the server
    /* Getting the attachment from the Cloudant document and setting it 
        into a variable so we can pipe to the write stream 
    */
    var readStream = homeguard.getAttachment(id, attachmentName, function (err){
      if(err){
        console.log("Error: " + err.toString());
        return
      }
      /*
        Now that the file is saved, set the server path to it and embed in a HTML response.
      */
      var serverPath = '/pictures/'+fileName.toString()+'.jpg';
      // res.send('<html><head><link rel="stylesheet" href="stylesheets/button.css"><title>HomeGuard</title></head><body><div align="center"><h1>Your picture: </h1><br><img src="'+serverPath+'" height="500"><a href="/takepicture" class="button">Take a picture</div>');
      res.render('take_picture.ejs', {
        image: serverPath
      });
      res.end(); // End the response to the request
      return;
    });
    readStream.pipe(writeStream); // Piping the file into the write stream
    
    
    }
    /* Creating the functions to handle possible errors and the when the connection
       is established.
    */
    client.on('connect', function (connection){
       console.log("Connected!");
       // connection.sendUTF("Test message.");
       connection.on('error', function (error){
          console.log("Connection Error: " + error.toString());
       });
       connection.on('close', function(){
          console.log('Closed connection.');
       });
       connection.on('message', function (message){
          var msgUtf8 = message.utf8Data;
          console.log("Received: " + message.utf8Data);
          // Parsing the message received from the RPi server and getting the id
          var parsed = msgUtf8.toString().split(":");
          var status_code = parsed[0];
          /* 
            Checking if any error ocurred, if the status code sent from
            RPi is 409 an error occured so the response is ended and
            connection closed.
          */
          if(status_code == '409'){
            console.log(msgUtf8);
            res.send('<html><body><div align="center">'+msgUtf8+'</div>');
            res.end();
            connection.close();
          }
          var id = parsed[1].trim();
          console.log("id: " + id);
          getFile(id);
          connection.close();
       });
    });
        
	});
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	// app.post('/login', do all our passport stuff here);

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	// app.post('/signup', do all our passport stuff here);

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
		console.log(req.user);
	});

  // =====================================
  // Cameras =============================
  // =====================================
  app.get('/cameras', isLoggedIn, function(req, res) {
    res.render('cameras.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // About ===============================
  // =====================================
  app.get('/about', isLoggedIn, function(req, res) {
    res.render('default.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	// =====================================
	// LOGIN  ==============================
	// =====================================
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    app.post('/contact', function (req, res){
    	var transporter = nodemailer.createTransport({
    		service: 'Gmail',
    		auth: {
    			user: 'bduhomeguard@gmail.com',
    			pass: 'password'
    		}
    	});
    	var mailOptions = {
    		from:  req.body.first_name+' '+req.body.last_name+' <'+req.body.email+'>',
    		to: 'Rafael Melo <rafamelo.oliveira@gmail.com>',
    		subject: 'Hello',
    		text: 'From: '+req.body.email+'<br>'+'First name: '+req.body.first_name+'<br> Last name: '+req.body.last_name+'<br>Text: '+req.body.user_text,
    		html: 'From: '+req.body.email+'<br>'+'First name: '+req.body.first_name+'<br> Last name: '+req.body.last_name+'<br>Text: '+req.body.user_text
    	};
    	transporter.sendMail(mailOptions, function (err, info){
    		if(err){
    			req.flash('contactMessage', 'Oops. Something wrong happened, try again!');
    			res.redirect('/contact');
    		}
    		else{
    			console.log("Message sent: " + info.response);
    			req.flash('contactMessage', 'E-mail sent. Our team will be answering you as soon as possible!');
    			res.redirect('/contact');
    		}

    	});
    });
    app.get('/contact', isLoggedIn, function (req, res){
    	res.render('contact.ejs', {
    		user: req.user,
    		message: req.flash('contactMessage')
    	});
    });
   
    app.get('/streaming', isLoggedIn, function (req, res){
      var fs = require('fs');
      var host     = 'http://neryuuk.cloudant.com'; // Host in Cloudant
      var c   = new(cradle.Connection)(host); // Setting up a connection to Cloudant
      var homeguard       = c.database('homeguard'); // Getting a instance of the database from Cloudant
      var streamFile1 = uuid.v4();
      var streamFile2 = uuid.v4();
      var streamFile3 = uuid.v4();
      var downloadPath1 = path.join(__dirname, '../tmp/pictures/'+streamFile1.toString()+'.jpg'); // Setting the path of where to save the file
      var downloadPath2 = path.join(__dirname, '../tmp/pictures/'+streamFile2.toString()+'.jpg'); // Setting the path of where to save the file
      var downloadPath3 = path.join(__dirname, '../tmp/pictures/'+streamFile3.toString()+'.jpg'); // Setting the path of where to save the file
      var attachmentName = 'file.jpg';
      // var io = require('socket.io')(server);
    var promiseWhile = function(condition, action) {
        var resolver = Promise.defer();

        var loop = function(){
            if(!condition()) return resolver.resolve();
            return Promise.cast(action())
                .then(loop)
                .catch(resolver.reject);
        };

        process.nextTick(loop)
        return resolver.promise;
    };
    var get1 = 0;
    var get2 = 0;
    var get3 = 0;
    var serverPath1 = '/pictures/'+streamFile1.toString()+'.jpg';
    var serverPath2 = '/pictures/'+streamFile2.toString()+'.jpg';
    var serverPath3 = '/pictures/'+streamFile3.toString()+'.jpg';
    promiseWhile(function(){
        return true;
    }, function(){
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                writeStream1 = fs.createWriteStream(downloadPath1);
                readStream1 = homeguard.getAttachment('81b29067bc7f4f2894c3c2f92980207e','file.jpg',function (err){
                    console.log("get1: "+get1);
                    if(get1 == 0){
                      console.log('entered here');
                      res.render('streaming2.ejs', {
                        user: req.user,
                        image: serverPath1,
                        image2: serverPath2,
                        image3: serverPath3
                      });
                      res.end();
                    }
                    get1++;
                    if(err){
                        console.log(err.toString());
                    }
                });
                readStream1.pipe(writeStream1, {end: "false"});
                resolve();
            },1000);
            setTimeout(function(){
              writeStream2 = fs.createWriteStream(downloadPath2);
              readStream2 = homeguard.getAttachment('cf43ec561b2c4ee7b4903ccaa074f4fa', 'file.jpg', function (err){
                console.log("get2: "+get2);
                get2++;
                if(err){
                  console.log(err.toString());
                }
              });
              readStream2.pipe(writeStream2, {end: "false"});
            },1000);
            setTimeout(function(){
              writeStream3 = fs.createWriteStream(downloadPath3);
              readStream3 = homeguard.getAttachment('e08b050b8b4f46ee8fe6f9de26c234d1', 'file.jpg', function (err){
                console.log("get3: "+get3);
                get3++;
                if(err){
                  console.log(err.toString());
                }
              });
              readStream3.pipe(writeStream3, {end: "false"});
            },1000);
        });
    }).then(function(){
        console.log("Done!");
    });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}