////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Srajan: 05/05/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////              SETUP NEEDED                ////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//  Install Nodejs (the bundle includes the npm) from the following website:
//      https://nodejs.org/en/download/


//  Before you start nodejs make sure you install from the  
//  command line window/terminal the following packages:
//      1. npm install express
//      2. npm install pg
//      3. npm install pg-format
//      4. npm install moment --save
//      5. npm install elasticsearch
//      6. npm install socket.io


//  Read the docs for the following packages:
//      1. https://node-postgres.com/
//      2.  result API: 
//              https://node-postgres.com/api/result
//      3. Nearest Neighbor Search
//              https://postgis.net/workshops/postgis-intro/knn.html    
//      4. https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
//      5. https://momentjs.com/
//      6. http://momentjs.com/docs/#/displaying/format/


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


const express = require('express');

const http = require('http').Server(express);
var pg = require('pg');

var bodyParser = require('body-parser');

const moment = require('moment');

const io = require('socket.io')(http);
const port = 3000;


// Connect to elasticsearch Server

const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});

// Connect to PostgreSQL server

var conString = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_stations";
var pgClient = new pg.Client(conString);
pgClient.connect();

var find_places_task_completed = false;             

const app = express();
const router = express.Router(); // This is where we declare routes for express


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

http.listen(port, () => {
    console.log(`Listening on *:${port}`);
  });

var places_found = [];
var stations_found = [];
var piechart_info = [];
var stations_found_hour_cont = [];
var stations_found_hour_logstash = [];
var stations_all_alert_table =[]
var place_selected;
var station_selected;
var time;
var all_stations;



/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//////   The following are the routes received from NG/Browser client        ////////

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



router.route('/places').get((req, res) => {

    res.json(places_found)
    
});



router.route('/place_selected').get((req, res) => {

    res.json(place_selected)
   
});

router.route('/allPlaces').get((req, res) => {

    res.json(places_found)
   
});

router.route('/stations').get((req, res) => {
   
    res.json(stations_found)
           
});

router.route('/all_stations/data').post((req, res) => {

    // Get all the stations in city of chicago
    res.json(all_stations);
});

router.route('/all_stations').post((req, res) => {

    // Get all the station's latitude and longitute for chicago
    date = new Date();
    console.log(req.body.time);
    var formatted_date = moment(date.setHours(date.getHours() - req.body.time)).format('YYYY-MM-DD HH:mm:ss');
    console.log(moment(date.setHours(date.getHours() - 1)).format('YYYY-MM-DD HH:mm:ss'));
    getall_station_latlang_chicago(formatted_date).then(function (response) {
        res.json(all_stations);
    });
});

router.route('/all_stations/dock').post((req, res) => {

    // Get all the stations in city of chicago using logstash for docks 90% full or empty
    var str = JSON.stringify(req.body, null, 4);
    date = new Date();
    console.log("In dock");
    console.log(place_selected);
    var formatted_date = moment(date.getTime() - 5*60000).format('YYYY-MM-DD HH:mm:ss');
    console.log(formatted_date);
    /*
        // Using postgre
        const query = {
            // Give the query a unique name
            name: 'fetch-divvy-docks',
            // This query fetches 3 divvy station nearby to the location we provide
            text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2))',
            values: [place_selected.latitude, place_selected.longitude]
        }
            // console.log(moment(date.setHours(date.getHours() - 1)).format('YYYY-MM-DD HH:mm:ss'));
            find_stations_from_divvy_dock(query).then(function (response) {
            res.json(stations_all_alert_table);
        });
    */
    getall_station_dock_latlang_chicago(formatted_date).then(function (response) {
        res.json(stations_all_alert_table);
    });
   
});


// Get logstash data from server

router.route('/stations/logstash').get((req, res) => {
   
    res.json(stations_found_hour_logstash)
           
});

// Get data for piechart

router.route('/stations/piechart').get((req, res) => {
   
    res.json(piechart_info)
           
});

// Find places from Yelp server

router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;             

    find_places_from_yelp(req.body.find, req.body.where, req.body.zipcode).then(function (response) {
        var hits = response;
        res.json(places_found);
    });

});

// Route for stations

router.route('/places/find/logstash').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    date = new Date();
    time = req.body.where;
    
    var formatted_date = moment(date.setHours(date.getHours() - time)).format('YYYY-MM-DD HH:mm:ss');
    console.log(moment(date.setHours(date.getHours() - time)).format('YYYY-MM-DD HH:mm:ss'));

    if(time == 1) {
        find_stations_from_logstash(req.body.find, time, formatted_date).then(function (response) {
            var hits = response;
            res.json(stations_found_hour_logstash);
        });
    } else if(time == 24) {
        find_stations_from_logstash_day(req.body.find, time, formatted_date).then(function (response) {
            var hits = response;
            res.json(stations_found_hour_logstash);
        });
    } else if(time == 168) {
        find_stations_from_logstash_week(req.body.find, time, formatted_date).then(function (response) {
            var hits = response;
            res.json(stations_found_hour_logstash);
        });
    }
    

});

// Fetch data to get divvy stations for selected place

router.route('/stations/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);
    for (var i = 0,len = places_found.length; i < len; i++) {

        if ( places_found[i].name === req.body.placeName.name ) { // strict equality test

            place_selected = places_found[i];
            break;
        }
    }
 
    const query = {
        // Give the query a unique name
        name: 'fetch-divvy',
        // This query fetches 3 divvy station nearby to the location we provide
        text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
        values: [place_selected.latitude, place_selected.longitude]
    }

    find_stations_from_divvy(query).then(function (response) {
        var hits = response;
        res.json({'stations_found': 'Added successfully'});
    });
 

});

// Route for piechart

router.route('/places/find/piechart').post((req, res) => {

    console.log("stations found" + stations_found);

    var count_90=0;
    var count_0=0;
    piechart_info = [];
    for (var i = 0,len = stations_found.length; i < len; i++) {

        var dock_per = (stations_found[i].availableBikes/stations_found[i].totalDocks)*100
        
        if ( dock_per >= 90 || dock_per <= 10) { // strict equality test
            count_90++;
        } else {
            count_0++;
        }        
    }

    var dock = {
        "dock": ">=90% or <=10%",
        "pie": count_90
    };
    piechart_info.push(dock);
    dock = {
        "dock": "<90% or >10%",
        "pie": count_0
    };
    piechart_info.push(dock);

    res.json(piechart_info);
   

});

// Async function to set data for every 3 min

const intervalObj = setInterval(() => {
    console.log('interviewing the interval every 3 min');
    if(station_selected != null) {
        /*var query_hour = {
            // give the query a unique name
            name: 'fetch-hour-cont-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'1 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime)',
            values: [station_selected.latitude, station_selected.longitude]
        }*/
        // find_stations_from_divvy_hour_continous(station_selected.placeName, time)
        // io.sockets.emit('updatedStation', stations_found_hour_logstash);
        date = new Date();
        time = req.body.where;
        console.log("In here");
        var formatted_date = moment(date.setHours(date.getHours() - time)).format('YYYY-MM-DD HH:mm:ss');
        console.log(moment(date.setHours(date.getHours() - time)).format('YYYY-MM-DD HH:mm:ss'));

        // if(time == 1) {
        //     find_stations_from_logstash(station_selected.placeName, time, formatted_date).then(function (response) {
        //         var hits = response;
        //         res.json(stations_found_hour_logstash);
        //     });
        // } else if(time == 24) {
        //     find_stations_from_logstash_day(station_selected.placeName, time, formatted_date).then(function (response) {
        //         var hits = response;
        //         res.json(stations_found_hour_logstash);
        //     });
        // } else if(time == 168) {
        //     find_stations_from_logstash_week(station_selected.placeName, time, formatted_date).then(function (response) {
        //         var hits = response;
        //         res.json(stations_found_hour_logstash);
        //     });
        // }
    }
  }, 180000);

  io.on('connection', function (socket) {
    console.log('a user connected');
  });

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

// To find stations from postgre

async function find_stations_from_divvy(query) {

    const response = await pgClient.query(query);

    stations_found = [];
    // i<3 because we limited the no of divvy stations to 3
    for (i = 0; i < response.rows.length; i++) {
                
         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,    
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };

        stations_found.push(station);

    }


}

// Fetching docks which are 90% full or empty from postgre

async function find_stations_from_divvy_dock(query) {

    const response = await pgClient.query(query);

    stations_all_alert_table = [];
// i<3 because we limited the no of divvy stations to 3
    for (i = 0; i < response.rows.length; i++) {
                
         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
                    "id": response.rows[i].id,
                    "stationName": response.rows[i].stationname,
                    "availableBikes": response.rows[i].availablebikes,
                    "availableDocks": response.rows[i].availabledocks,
                    "is_renting": response.rows[i].is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": response.rows[i].latitude,    
                    "longitude": response.rows[i].longitude,
                    "status": response.rows[i].status,
                    "totalDocks": response.rows[i].totaldocks
        };
        
        var dock_per = (response.rows[i].availablebikes/response.rows[i].totaldocks)*100
            
        if ( dock_per >= 90 || dock_per <= 10) { // strict equality test
            stations_all_alert_table.push(station);
        }     
    }
}


// async function for contious updation of data

async function find_stations_from_divvy_hour_continous(query) {

    const response = await pgClient.query(query);

    stations_found_hour_cont = [];
// i<3 because we limited the no of divvy stations to 3
    for (i = 0; i < response.rows.length; i++) {
                
         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
                    "id": response.rows[i].id,
                    "stationName": response.rows[i].stationname,
                    "availableBikes": response.rows[i].availablebikes,
                    "availableDocks": response.rows[i].availabledocks,
                    "is_renting": response.rows[i].is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": response.rows[i].latitude,    
                    "longitude": response.rows[i].longitude,
                    "status": response.rows[i].status,
                    "totalDocks": response.rows[i].totaldocks
        };

        stations_found_hour_cont.push(station);

    }
}


// SMA function

function sma(period) {
    var nums = [];
    return function(num) {
        nums.push(num);
        if (nums.length > period)
            nums.splice(0,1);  // remove the first element of the array
        var sum = 0;
        for (var i in nums)
            sum += nums[i];
        var n = period;
        if (nums.length < period)
            n = nums.length;
        return(sum/n);
    }
}


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

// Function to find places from Yelp in elastic search

async function find_places_from_yelp(place, where, zipcode) {

    places_found = [];

//////////////////////////////////////////////////////////////////////////////////////
// Using the business name to search for businesses will lead to incomplete results
// better to search using categorisa/alias and title associated with the business name
// For example one of the famous places in chicago for HotDogs is Portillos
// However, it also offers Salad and burgers
// Here is an example of a buisness review from Yelp for Portillos
//               alias': 'portillos-hot-dogs-chicago-4',
//              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
//                             {'alias': 'salad', 'title': 'Salad'},
//                             {'alias': 'burgers', 'title': 'Burgers'}],
//              'name': "Portillo's Hot Dogs",
//////////////////////////////////////////////////////////////////////////////////////



    let body;
    if(zipcode == undefined || zipcode == null || zipcode == ""){
        body = {
            size: 1000,
            from: 0,
            "query": {
              "bool" : {
                "must" : {
                   "term" : { "categories.alias" : place } 
                },
    
    
                "filter": {
                    "term" : { "location.address1" : where  }
                },
    
    
                "must_not" : {
                  "range" : {
                    "rating" : { "lte" : 3 }
                  }
                },
    
                "must_not" : {
                  "range" : {
                    "review_count" : { "lte" : 500 }
                  }
                },
    
                "should" : [
                  { "term" : { "is_closed" : "false" } }
                ],
              }
            }
        }
    } else {
        body = {
            size: 1000,
            from: 0,
            "query": {
              "bool" : {
                "must" : {
                   "term" : { "categories.alias" : place } 
                },
    
    
                "filter": {
                    "term" : { "location.zip_code" : zipcode  }
                },
    
    
                "must_not" : {
                  "range" : {
                    "rating" : { "lte" : 3 }
                  }
                },
    
                "must_not" : {
                  "range" : {
                    "review_count" : { "lte" : 500 }
                  }
                },
    
                "should" : [
                  { "term" : { "is_closed" : "false" } }
                ],
              }
            }
        }
    }

    results = await esClient.search({index: 'chicago_yelp_reviews', body: body});

    
    results.hits.hits.forEach((hit, index) => {
        
        var place = {
            "name": hit._source.name,
            "display_phone": hit._source.display_phone,
            "address1": hit._source.location.address1,
            "is_closed": hit._source.is_closed,
            "rating": hit._source.rating,
            "review_count": hit._source.review_count,
            "latitude": hit._source.coordinates.latitude,    
            "longitude": hit._source.coordinates.longitude
        };

        places_found.push(place);

    });
    console.log(places_found)
    find_places_task_completed = true;             
      
}

// A new async function to display realtime chart for 1 hr

async function find_stations_from_logstash(stationName, time, req_date) {

    stations_found_hour_logstash =[];
    this.time = time;
    if(time == 1) {
        // query_val = stationName.lastCommunicationTime.substr(0,14);
        size="40";
        // x_axis=[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60];
    }
    let body = 
    {
        "size": size,   
        "from": "0",
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "stationName.keyword": stationName.stationName
                    }
                },
                "filter": {
                    "range": {
                        "lastCommunicationTime.keyword": {
                            "gte": req_date
                        }
                    }
                }
            }
        },
        "sort": {
            "lastCommunicationTime.keyword": {
                "order": "asc"
            }
        }
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});

    sma_30_data = sma(30);
    sma_720_data = sma(720);
    count=0;
    aSamp =["a"];
    
    results.hits.hits.forEach((hit, index) => {
        count = count+1;
        var b = moment(hit._source.lastCommunicationTime).format('hh:mm a');
        console.log(moment(hit._source.lastCommunicationTime).format('hh:mm:ss a'))
        sma_30 = sma_30_data(hit._source.availableDocks);
        sma_720 = sma_720_data(hit._source.availableDocks);
        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "x_axis": b,
            "lastCommunicationTime": hit._source.lastCommunicationTime,
            "latitude": hit._source.latitude,    
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks,
            "sma_30": sma_30,
            "sma_720": sma_720
        };

        if((! aSamp.includes(b))) {
            aSamp.push(b)
            stations_found_hour_logstash.push(station);
        }
    });
}

// A new async function to display realtimechart for 24/7 days

async function find_stations_from_logstash_day(stationName, time, req_date) {

    stations_found_hour_logstash =[];
    this.time = time
    

    let body = 
    {
        "size": "1000",
        "from": "0",
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "stationName.keyword": stationName.stationName
                    }
                },
                "filter": {
                    "range": {
                        "lastCommunicationTime.keyword": {
                            "gte": req_date
                        }
                    }
                }
            }
        },
        "sort": {
            "lastCommunicationTime.keyword": {
                "order": "asc"
            }
        }
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});

    sma_30_data = sma(30);
    sma_720_data = sma(720);
    count=0;
    x_axis=0;
    sum=0;
    avg=0;
    i=1;
    aSamp =["a"];
    results.hits.hits.forEach((hit, index) => {
        
        count = count+1;
        sum = sum + hit._source.availableDocks;
        avg = sum/count;
        sma_30 = sma_30_data(hit._source.availableDocks);
        sma_720 = sma_720_data(hit._source.availableDocks);
        var a = stations_found_hour_logstash
        var b = moment(hit._source.lastCommunicationTime).startOf('hour').format('hh:mm a')
        if(index == 0) {
            x_axis = x_axis+1;
            aSamp.push(b)
            var station = {
                "id": hit._source.id,
                "stationName": hit._source.stationName,
                "availableBikes": hit._source.availableBikes,
                "availableDocks": avg,
                "is_renting": hit._source.is_renting,
                "x_axis": moment(hit._source.lastCommunicationTime).startOf('hour').format('hh:mm a'),
                "lastCommunicationTime": moment(hit._source.lastCommunicationTime).format('hh:mm a'),
                "latitude": hit._source.latitude,    
                "longitude": hit._source.longitude,
                "status": hit._source.status,
                "totalDocks": hit._source.totalDocks,
                "sma_30": sma_30,
                "sma_720": sma_720
            };
            count = 0;
            sum = 0;
            avg = 0;
            stations_found_hour_logstash.push(station);
            
        } else if(! aSamp.includes(b))
        {
            i++;
            aSamp.push(b)
            x_axis = x_axis+1;
            var station = {
                "id": hit._source.id,
                "stationName": hit._source.stationName,
                "availableBikes": hit._source.availableBikes,
                "availableDocks": avg,
                "is_renting": hit._source.is_renting,
                "x_axis": moment(hit._source.lastCommunicationTime).startOf('hour').format('hh:mm a'),
                "lastCommunicationTime": moment(hit._source.lastCommunicationTime).format('hh:mm a'),
                "latitude": hit._source.latitude,    
                "longitude": hit._source.longitude,
                "status": hit._source.status,
                "totalDocks": hit._source.totalDocks,
                "sma_30": sma_30,
                "sma_720": sma_720
            };
            count = 0;
            sum = 0;
            avg = 0;
                stations_found_hour_logstash.push(station);
        }
        

    });
}

// A new async function to display realtimechart for 7 days

async function find_stations_from_logstash_week(stationName, time, req_date) {

    stations_found_hour_logstash =[];
    this.time = time
    

    let body = 
    {
        "size": "1440",
        "from": "0",
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "stationName.keyword": stationName.stationName
                    }
                },
                "filter": {
                    "range": {
                        "lastCommunicationTime.keyword": {
                            "gte": req_date
                        }
                    }
                }
            }
        },
        "sort": {
            "lastCommunicationTime.keyword": {
                "order": "asc"
            }
        }
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});

    sma_30_data = sma(30);
    sma_720_data = sma(720);
    count=0;
    x_axis=0;
    sum=0;
    avg=0;
    i=1;
    aSamp =["a"];
    results.hits.hits.forEach((hit, index) => {
        count = count+1;
        sum = sum + hit._source.availableDocks;
        avg = sum/count;
        sma_30 = sma_30_data(hit._source.availableDocks);
        sma_720 = sma_720_data(hit._source.availableDocks);
        var a = stations_found_hour_logstash
        var b = moment(hit._source.lastCommunicationTime).format('YYYY-MM-DD')
        if(index == 0) {
            x_axis = x_axis+1;
            aSamp.push(b)
            var station = {
                "id": hit._source.id,
                "stationName": hit._source.stationName,
                "availableBikes": hit._source.availableBikes,
                "availableDocks": avg,
                "is_renting": hit._source.is_renting,
                "x_axis": b,
                "lastCommunicationTime": hit._source.lastCommunicationTime,
                "latitude": hit._source.latitude,    
                "longitude": hit._source.longitude,
                "status": hit._source.status,
                "totalDocks": hit._source.totalDocks,
                "sma_30": sma_30,
                "sma_720": sma_720
            };
            count = 0;
            sum = 0;
            avg = 0;
            stations_found_hour_logstash.push(station);
            
        } else if(! aSamp.includes(b))
        {
            i++;
            aSamp.push(b)
            x_axis = x_axis+1;
            var station = {
                "id": hit._source.id,
                "stationName": hit._source.stationName,
                "availableBikes": hit._source.availableBikes,
                "availableDocks": avg,
                "is_renting": hit._source.is_renting,
                "x_axis": b,
                "lastCommunicationTime": hit._source.lastCommunicationTime,
                "latitude": hit._source.latitude,    
                "longitude": hit._source.longitude,
                "status": hit._source.status,
                "totalDocks": hit._source.totalDocks,
                "sma_30": sma_30,
                "sma_720": sma_720
            };
            count = 0;
            sum = 0;
            avg = 0;
                stations_found_hour_logstash.push(station);
        }
        

    });
}

// An async function to get latitude and longitude for all stations in chicago

async function getall_station_latlang_chicago(req_date) {

    all_stations =[];
    

    let body = 
    {
        "from": "0",
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "city.keyword": "Chicago"
                        }
                    },
                    {
                        "range": {
                            "lastCommunicationTime.keyword": {
                                "gte": req_date
                            }
                        }
                    },
                    {
                        "range": {
                            "availableDocks": {
                                "gte": 1
                            }
                        }
                    }
                ]
            }
        },
        "sort": {
            "lastCommunicationTime.keyword": {
                "order": "asc"
            }
        }
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});

    results.hits.hits.forEach((hit, index) => {

            var latlang = {
                "latitude": hit._source.latitude,    
                "longitude": hit._source.longitude,
            };
            all_stations.push(latlang);
        });
}

// An async function to get docks which are 90% full or empty

async function getall_station_dock_latlang_chicago(req_date) {
    
    stations_all_alert_table=[];
    let body = 
    {
        "size": "1000",
        "from": "0",
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "city.keyword": "Chicago"
                        }
                    },
                    {
                        "range": {
                            "lastCommunicationTime.keyword": {
                                "gte": req_date
                            }
                        }
                    }
                ]
            }
        },
        "sort": {
            "lastCommunicationTime.keyword": {
                "order": "asc"
            }
        }
    }
    aSamp =["a"];
    results = await esClient.search({index: 'divvy_stations_logs', body: body});

    results.hits.hits.forEach((hit, index) => {

        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "lastCommunicationTime": hit._source.lastCommunicationTime,
            "latitude": hit._source.latitude,    
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks,
        };
        
        var dock_per = (hit._source.availableBikes/hit._source.totalDocks)*100
            
        if ( dock_per >= 90 || dock_per <= 10) { // strict equality test
            if((! aSamp.includes(station.stationName))) {
                aSamp.push(station.stationName)
                stations_all_alert_table.push(station);
            }
        }
    });
}

app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));