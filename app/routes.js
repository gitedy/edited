var img = require('./models/image');
var mime = require('mime-types')
// var ImagesClient = require('google-images');
// var image_downloader = require('image-downloader');
var imagemin = require('imagemin');
var imageGrayScale = require('image-grayscale');
var jpeg = require('jpeg-js');
var globby = require('globby');
const del = require('del');
// var search = require('image-search');
// var googleapis = require('googleapis');
// var scraper = require("image-scraper");
var Scraper = require ('images-scraper')
var https=require('https');
	var google = new Scraper.Google();
var fs = require('fs');
var stream=require('stream');
	var request = require('request');
// var fs = require('fs')
// 	var gm = require('gm').subClass({imageMagick: true})
var http = require("http");
// var Scraper = require('google-images-scraper');
var URL	 = require('url')

// var im = require('imagemagick');
var mimee = require('mime-magic');

var getPixels = require("get-pixels")




// var gmToGrayscale = require('gm-to-grayscale');
// var Caman = require('caman').Caman;

// var crawler = require('img-crawler');



function randomString(len, an){
	an = an&&an.toLowerCase();
	var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
	for(;i++<len;){
		var r = Math.random()*(max-min)+min <<0;
		str += String.fromCharCode(r+=r>9?r<36?55:61:48);
	}
	return str;
}



// ===========================================================================================


// var client = new ImagesClient('011808000419947783707:kuxl5jbpm6m', 'AIzaSyA5oN40fVa5HNPjzWVv0_3XRjUfFnl8L44');


module.exports = function(app) {

	app.get('/api/cas/', function(req, res,next) {

		var search_string= req.query.search_text;
		console.log(search_string)

		var col= {name:search_string};
		var files=[];
		var data1=[];
		var data2='';
		var final_data=[];
		// client.search(''+search_string+'',{page: 3,size:'medium'})
		// 		.then(function (images) {
		google.list({
			keyword: search_string,
			num: 5,
			detail: true,
			nightmare: {
				show: false
			}
		})
			.then(function (images) {

						var list = [];
						for (i = 0; i < images.length; i++) {
							var str = images[i].url;
							// console.log(str);
							var dtr = str.search("\\?,~");
							// console.log(dtr);
							if (dtr != -1) {
								str = str.slice(0, dtr);
								// console.log(str)
							}
							list.push({url: str})
						}
						// console.log(list);

						for (i = 0; i < list.length; i++) {
							var x = list[i].url;
							var options = {
								url: x,
								dest: './upload/',
								done: function (err, filename, image) {
									if (err) {

										files.push("");

									}else {
									var f_slice = filename.slice(7);
									var f_name = 'upload/' + f_slice + '';
									console.log(f_name);
										files.push(f_name);

									}

									if (files.length >= 10) {
										console.log('All files downloaded');

										img.update(col, {path: files}, {upsert: true}, function (err, dat) {
											if (err) {
												res.send(err);
											}
// =========================================================Grayscaling===============================================================================
											globby(['./upload/*.jpg','!./upload/*.ico', '!./upload/*.txt']).then(function (paths) {
												return Promise.all(paths.map(function (e) {
													return imageGrayScale(e, {logProgress: 1});
												}));
											})
												.then(function (val) {
													console.log('grayscale done!');
													del(['./upload/*.*','!./upload/*.txt']).then(function (paths) {
														console.log('Deleted files and folders:\n', paths.join('\n'));
													});
// ==============================================================Compressing=======================================================================================
													imagemin(['./dist/*.{jpg,png,jpeg}','!./upload/*.txt'], './public/upload', {     // compression algorithm
													}).then(function (files) {


														del(['./dist/*.*','!./upload/*.txt']).then(function (paths) {
															console.log('Deleted files and folders:\n', paths.join('\n'));
														});
														res.send('ok');
													})
														.catch(function (err) {
															// fires once even if one error (Promise.all)
															if (err) console.log(err);
														})
												})
												.catch(function (val) {
													// fires once even if one error (Promise.all)
													if (err) console.log(err);
												});


										});
										
									}
								}
							};
							image_downloader(options);
						}

				});

	});

	app.get('/api/list', function(req, res) {
		img.find( { name : { $exists : true } },function (err,result) {
			res.send(result);
		} );

	});

	app.get('/api/fetch', function(req, res) {
		var keywords= req.query.data;
		console.log(keywords);

		img.find( {name:keywords},function (err,result) {

			console.log(JSON.stringify(result))
			res.send(result);

		} );

	});



app.get('/api/find/',function (req,res) {


	// res.send('ok');

	 function download (uri, filename, callback){
		request.head(uri,{timeout:5000}, function(err, red, body){
			var error= new Error('err')
			// console.log('content-type:', res.headers['content-type']);
			// console.log('content-length:', res.headers['content-length']);

			// if(red.headers['content-type']=='image/svg+xml' || red.headers['content-type']=='text/html' || red.headers['content-type']=='undefined'){
			// 	console.log('skipped')
            //
			// }else{
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback).on('error',function (err) {
				callback(err,filename);
				
			});
			// }

		});
	};


	var search_string= req.query.search_text;
	console.log(search_string);

	var col= {name:search_string};


	google.list({
		keyword: search_string,
		num: 10,
		detail: true,
		nightmare: {
			show: false
		}
	})
		.then(function (data) {


			var list = [];
			for (i = 0; i < data.length; i++) {
				var str = data[i].url;
				// console.log(str);
				var dtr = str.search("\\?,~");
				// console.log(dtr);
				if (dtr != -1) {
					str = str.slice(0, dtr);
					// console.log(str)
				}
				list.push({url: str})
			}

console.log('listing done')

			// res.send(data);
			var pathl=[];
			for (i=0; i<list.length; i++) {
				var uri=list[i].url;
				// var filename = uri.split('/').pop().split('#')[0].split('?')[0];
				var name = randomString(10);
				var filename=name+'.'+'jpg';

				var path_url= './upload/'+filename+'';
// 			console.log(filename);
//  				console.log(path_url);
				pathl.push(path_url);
                var x=0;
				download(uri, path_url, function (err,filename) {
					if(err){
						console.log(err,filename);
					}
					x++;
					console.log('downloaded'+filename);
					if(x>=10){
						console.log('All Images downloaded')
						globby(['./upload/*.*','!./upload/*.ico','!./upload/*.gif', '!./upload/*.txt']).then(function (paths) {
							console.log('All path has veen patched for grayscaling')
							var pathss=[];
							var l=0;
							paths.map(function (e) {
								mimee(e, function (err, type) {
									if (err) {
										console.error(err.message);
										// ERROR: cannot open `/path/to/foo.pdf' (No such file or directory)
									} else {
										console.log(type)
										if(type==='text/html'){
											l++;
											console.log('Detected mime type not supported');
										}else{

											l++ ;
											pathss.push(e);
											if(l>paths.length-1){
												console.log(pathss)

												function change(arr){
													return new Promise(function (resolve,reject) {
														resolve('hello')

													})
												};

												change(pathss).then(function () {
													return Promise.all(pathss.map(function (e) {
														return imageGrayScale(e, {logProgress: 1});
													}));
												}).then(function () {
													console.log('done done')

													del(['./upload/*.*','!./upload/*.txt']).then(function (paths) {
														// console.log('Deleted files and folders:\n', paths.join('\n'));
													});


													imagemin(['./dist/*.{jpg,png,jpeg}','!./upload/*.txt'], './public/upload', {     // compression algorithm
													}).then(function (files) {

														del(['./dist/*.*','!./dist/*.txt']).then(function (paths) {
															// console.log('Deleted files and folders:\n', paths.join('\n'));
														});


														var paths= [];

														for(i=0;i<files.length;i++){
															paths.push(files[i].path)
														}
														console.log(paths);


														img.update(col, {path: paths}, {upsert: true}, function (err, dat) {
															if (err) {
																console.log(err);
																res.send(err);
															}else {

																console.log('data send');


																del(['./dist/*.*','!./upload/*.txt']).then(function (paths) {
																	// console.log('Deleted files and folders:\n', paths.join('\n'));
																});

																res.send('ok');
															}
														});




														// res.send('ok');
													})


												})

											}

										}
									}
								})
							});
						})



						// });
					}

				});







			}




		}).catch(function(err) {
		console.log('err', err);
	});






});



// 	app.get('/api/gm',function (req,res) {
//
//
// 		var data=[
// 			{
// 				type: "image/png",
// 				width: 220,
// 				height: 179,
// 				size: 6640,
// 				url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/220px-Twitter_bird_logo_2012.svg.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTbU4hBtHbg-G5CM5QgPOphDZBNyupK_JLr3yWUT2WxDP-XL9EmGGi7ZKE",
// 					width: 107,
// 					height: 87
// 				}
// 			},
// 			{
// 				type: "image/",
// 				width: 200,
// 				height: 200,
// 				size: 13678,
// 				url: "https://avatars1.githubusercontent.com/u/50278?v=3&s=200",
// 				thumbnail: {
// 					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ5U8tuxj4HvGxrNpIUIQG7LB4auSBI8-QjMU4vLINHm5Tz_cbAWDDfxQ",
// 					width: 104,
// 					height: 104
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 300,
// 				height: 300,
// 				size: 4414,
// 				url: "https://blog.twitter.com/sites/all/themes/gazebo/img/twitter-bird-white-on-blue.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRnLYJS0_HWmh6COvF3wwvJh1D9sNnI-CN-83iYp1IGG_75f7efjAjQag",
// 					width: 116,
// 					height: 116
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 256,
// 				height: 256,
// 				size: 10971,
// 				url: "http://www.pngall.com/wp-content/uploads/2016/07/Twitter-Download-PNG.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQJYT9dGcmxlZkkkDauYl4Vlkj9ZIPvc2qVEs2IPpSZuuo69UTCYf-4NA",
// 					width: 111,
// 					height: 111
// 				}
// 			},
// 			{
// 				type: "image/svg+xml",
// 				width: 300,
// 				height: 244,
// 				size: 2048,
// 				url: "https://upload.wikimedia.org/wikipedia/en/archive/9/9f/20161107041729!Twitter_bird_logo_2012.svg",
// 				thumbnail: {
// 					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtyQwmTLY0hJYS-xwrT3Y6QCBuXmssAjmmXO7YO1CTt7tRHThngxUBNQ",
// 					width: 116,
// 					height: 94
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 280,
// 				height: 280,
// 				size: 12110,
// 				url: "https://ton.twimg.com/dtc/33414a20-ac3f-4f46-b0f8-63aef9b2dbb8/_static/imgs/DTC_Services_1h_hero_bg.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSMtbFk4k1jfguozZdum3KoCTFqfSt8x07ahFroj_2vMwwIRiZjIPj-cu0",
// 					width: 114,
// 					height: 114
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 220,
// 				height: 179,
// 				size: 6591,
// 				url: "http://oelkien.com/wp-content/uploads/2016/10/Twitter_bird_logo_2012.svg_.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfjYIBdk2k7sAjgaM7WTayI7EjdyP01S47Ir7uUy2xkf1zVPS-AT_cTg",
// 					width: 107,
// 					height: 87
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 300,
// 				height: 258,
// 				size: 10054,
// 				url: "https://cdn.downdetector.com/static/uploads/c/300/a4e0b/twitter-logo_22.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQx2iEsmN4prxkWdCadUYzTlYLXy0TxaEc1HJ0tRKiXLYeJ702Bx0ekbCg",
// 					width: 116,
// 					height: 100
// 				}
// 			},
// 			{
// 				type: "image/",
// 				width: 300,
// 				height: 300,
// 				size: 8721,
// 				url: "https://lh3.googleusercontent.com/32GbAQWrubLZX4mVPClpLN0fRbAd3ru5BefccDAj7nKD8vz-_NzJ1ph_4WMYNefp3A=w300",
// 				thumbnail: {
// 					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTrdLlO_kReEbRxhUKn7wUjfXXxFo9CFYkcz3aNX29BwGp7_eZ8kToZMg",
// 					width: 116,
// 					height: 116
// 				}
// 			},
// 			{
// 				type: "image/png",
// 				width: 256,
// 				height: 256,
// 				size: 6183,
// 				url: "https://cdn.sameroom.io/img/providers/colored/twitter.png",
// 				thumbnail: {
// 					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiXIB_A5GP_yoSWUV8NVtbe9n2OP4oBG7dyhw4bParqyhYjYgkGoagU74",
// 					width: 111,
// 					height: 111
// 				}
// 			}
// 		];
//
//
//
// 		// url('https://upload.wikimedia.org/wikipedia/en/archive/9/9f/20161107041729!Twitter_bird_logo_2012.svg');
//
//
// 		// const myURL = URL.parse('https://upload.wikimedia.org/wikipedia/en/archive/9/9f/20161107041729!Twitter_bird_logo_2012.svg').protocol;
//         //
//         // console.log(myURL);
//
// 		// var mjs = require("mongojs");
//
// // url of the image to save to mongo
// // 		var image_url = "http://i.imgur.com/5ToTZky.jpg";
//
// 		// var save_to_db = function(type, image) {
//         //
// 		// 	// connect to database and use the "test" collection
// 		// 	var db = mjs.connect("mongodb://localhost:27017/database", ["test"]);
//         //
// 		// 	// insert object into collection
// 		// 	db.test.insert({ type: type, image: image }, function() {
// 		// 		db.close();
// 		// 	});
//         //
// 		// };
//
// 		var processItems = function(x){
// 			var f=fs.createWriteStream(x+'.'+'jpeg');
// 			if( x < data.length ) {
//
// 				if(URL.parse(data[x].url).protocol=='https:'){
// 					https.get(data[x].url, function(res) {
// 						var buffers = [];
// 						var length = 0;
// 						res.on("data", function(chunk) {
// 							// store each block of data
// 							length += chunk.length;
// 							buffers.push(chunk);
//
// 							f.write(chunk);
// 						});
// 						res.on("end", function() {
// 							f.end();
// 							processItems(x+1);
// 							// combine the binary data into single buffer
// 							var image = Buffer.concat(buffers);
// 							// determine the type of the image
// 							// with image/jpeg being the default
// 							var type = 'image/jpeg';
// 							if (res.headers['content-type'] !== undefined)
// 								type = res.headers['content-type'];
// 							console.log(image);
// 						});
// 					});
// 				}else{
// 					http.get(data[x].url, function(res) {
// 						var buffers = [];
// 						var length = 0;
// 						res.on("data", function(chunk) {
// 							// store each block of data
// 							length += chunk.length;
// 							buffers.push(chunk);
//
// 							f.write(chunk);
// 						});
// 						res.on("end", function() {
// 							f.end();
// 							processItems(x+1);
// 							// combine the binary data into single buffer
// 							var image = Buffer.concat(buffers);
// 							// determine the type of the image
// 							// with image/jpeg being the default
// 							var type = 'image/jpeg';
// 							if (res.headers['content-type'] !== undefined)
// 								type = res.headers['content-type'];
// 							console.log(image);
// 						});
// 					});
// 				}
//
//
//
//
// 			}else{
// 				console.log('done')
// 			}
// 		};
//
// processItems(0);
//
//
//
//
// 	});

	app.get('/api/gm', function (req, res, next) {


		var data=[
			{
				type: "image/png",
				width: 220,
				height: 179,
				size: 6640,
				url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Twitter_bird_logo_2012.svg/220px-Twitter_bird_logo_2012.svg.png",
				thumbnail: {
					url: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTbU4hBtHbg-G5CM5QgPOphDZBNyupK_JLr3yWUT2WxDP-XL9EmGGi7ZKE",
					width: 107,
					height: 87
				}
			},
			{
				type: "image/",
				width: 200,
				height: 200,
				size: 13678,
				url: "https://avatars1.githubusercontent.com/u/50278?v=3&s=200",
				thumbnail: {
					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ5U8tuxj4HvGxrNpIUIQG7LB4auSBI8-QjMU4vLINHm5Tz_cbAWDDfxQ",
					width: 104,
					height: 104
				}
			},
			{
				type: "image/png",
				width: 300,
				height: 300,
				size: 4414,
				url: "https://blog.twitter.com/sites/all/themes/gazebo/img/twitter-bird-white-on-blue.png",
				thumbnail: {
					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRnLYJS0_HWmh6COvF3wwvJh1D9sNnI-CN-83iYp1IGG_75f7efjAjQag",
					width: 116,
					height: 116
				}
			},
			{
				type: "image/png",
				width: 256,
				height: 256,
				size: 10971,
				url: "http://www.pngall.com/wp-content/uploads/2016/07/Twitter-Download-PNG.png",
				thumbnail: {
					url: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQJYT9dGcmxlZkkkDauYl4Vlkj9ZIPvc2qVEs2IPpSZuuo69UTCYf-4NA",
					width: 111,
					height: 111
				}
			},
			{
				type: "image/svg+xml",
				width: 300,
				height: 244,
				size: 2048,
				url: "https://upload.wikimedia.org/wikipedia/en/archive/9/9f/20161107041729!Twitter_bird_logo_2012.svg",
				thumbnail: {
					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtyQwmTLY0hJYS-xwrT3Y6QCBuXmssAjmmXO7YO1CTt7tRHThngxUBNQ",
					width: 116,
					height: 94
				}
			},
			{
				type: "image/png",
				width: 280,
				height: 280,
				size: 12110,
				url: "https://ton.twimg.com/dtc/33414a20-ac3f-4f46-b0f8-63aef9b2dbb8/_static/imgs/DTC_Services_1h_hero_bg.png",
				thumbnail: {
					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSMtbFk4k1jfguozZdum3KoCTFqfSt8x07ahFroj_2vMwwIRiZjIPj-cu0",
					width: 114,
					height: 114
				}
			},
			{
				type: "image/png",
				width: 220,
				height: 179,
				size: 6591,
				url: "http://oelkien.com/wp-content/uploads/2016/10/Twitter_bird_logo_2012.svg_.png",
				thumbnail: {
					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfjYIBdk2k7sAjgaM7WTayI7EjdyP01S47Ir7uUy2xkf1zVPS-AT_cTg",
					width: 107,
					height: 87
				}
			},
			{
				type: "image/png",
				width: 300,
				height: 258,
				size: 10054,
				url: "https://cdn.downdetector.com/static/uploads/c/300/a4e0b/twitter-logo_22.png",
				thumbnail: {
					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQx2iEsmN4prxkWdCadUYzTlYLXy0TxaEc1HJ0tRKiXLYeJ702Bx0ekbCg",
					width: 116,
					height: 100
				}
			},
			{
				type: "image/",
				width: 300,
				height: 300,
				size: 8721,
				url: "https://lh3.googleusercontent.com/32GbAQWrubLZX4mVPClpLN0fRbAd3ru5BefccDAj7nKD8vz-_NzJ1ph_4WMYNefp3A=w300",
				thumbnail: {
					url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTrdLlO_kReEbRxhUKn7wUjfXXxFo9CFYkcz3aNX29BwGp7_eZ8kToZMg",
					width: 116,
					height: 116
				}
			},
			{
				type: "image/png",
				width: 256,
				height: 256,
				size: 6183,
				url: "https://cdn.sameroom.io/img/providers/colored/twitter.png",
				thumbnail: {
					url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiXIB_A5GP_yoSWUV8NVtbe9n2OP4oBG7dyhw4bParqyhYjYgkGoagU74",
					width: 111,
					height: 111
				}
			}
		];
		

		globby(['./upload/*.*','!./upload/*.ico','!./upload/*.gif', '!./upload/*.txt']).then(function (paths) {
console.log(paths.length)
			var pathss=[];
			var l=0;
	paths.map(function (e) {
		mimee(e, function (err, type) {
				if (err) {
					console.error(err.message);
					// ERROR: cannot open `/path/to/foo.pdf' (No such file or directory)
				} else {
					if(type==='text/html'){
						l++;
						console.log('Detected mime type not supported');
					}else{

						l++ ;
						pathss.push(e);
						if(l>=paths.length-1){
							console.log(pathss)

							function change(arr){
								return new Promise(function (resolve,reject) {
									resolve('hello')

								})
							};

							change(pathss).then(function () {
								return Promise.all(pathss.map(function (e) {
									return imageGrayScale(e, {logProgress: 1});
								}));
							}).then(function () {
								console.log('done done')


								imagemin(['./dist/*.{jpg,png,jpeg}','!./upload/*.txt'], './public/upload', {     // compression algorithm
								}).then(function (files) {


									var paths= [];

									for(i=0;i<files.length;i++){
										paths.push(files[i].path)
									}
									console.log(paths);


									img.update({name:'tree'}, {path: paths}, {upsert: true}, function (err, dat) {
										if (err) {
											console.log(err);
											res.send(err);
										}else {

											console.log('data send');
											res.send('ok');
										}
									});



									del(['./dist/*.*','!./upload/*.txt']).then(function (paths) {
										// console.log('Deleted files and folders:\n', paths.join('\n'));
									});
									// res.send('ok');
								})

								
							})

						}

					}
				}
			})
});
		})







		// console.log(mime.lookup('./upload/1609-tree.jpg'));

	});
 // application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};