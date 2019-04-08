////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/27/2019


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



var places_found = [];
var stations_found = [];
var stations_found_hourold = [];
var stations_found_hour_cont = [];
var stations_found_hour_sma = [];
var place_selected;
var station_selected;



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

// Get hour old data from server
router.route('/stations/hourOldData').get((req, res) => {
   
    res.json(stations_found_hourold)
           
});

// Get continous hour old data from server
router.route('/stations/hourContData').get((req, res) => {
   
    res.json(stations_found_hour_cont)
           
});

// Get SMA data
router.route('/stations/sma_data').get((req, res) => {
   
    res.json(stations_found_hour_sma)
           
});

router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;             

    find_places_from_yelp(req.body.find, req.body.where).then(function (response) {
        var hits = response;
        res.json(places_found);
    });

});





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

// Added to get 1 hour/24 hour/7 days old divvy data
router.route('/stations/hourold').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0,len = stations_found.length; i < len; i++) {

        if ( stations_found[i].stationName === req.body.placeName.stationName ) { // strict equality test

            station_selected = stations_found[i];

            break;
        }
    }
    // Additional parameter to signify 1 hour/24 hours/7 days
    let query_hour;
    if('hour' == req.body.time) {
        query_hour = {
            // give the query a unique name
            name: 'fetch-hourold-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'1 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime)',
            values: [station_selected.latitude, station_selected.longitude]
        }
    } else if('day' == req.body.time) {
        query_hour = {
            // give the query a unique name
            name: 'fetch-dayold-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'24 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime)',
            values: [station_selected.latitude, station_selected.longitude]
        }
    } else {
        query_hour = {
            // give the query a unique name
            name: 'fetch-weekold-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'7 days\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime)',
            values: [station_selected.latitude, station_selected.longitude]
        }
    } 


    find_stations_from_divvy_hour_old(query_hour).then(function (response) {
        var hits = response;
        res.json({'stations_found': 'Added successfully'});
    });
 

});

// Async function to set data for every 3 min
const intervalObj = setInterval(() => {
    console.log('interviewing the interval every 3 min');
    if(station_selected != null) {
        var query_hour = {
            // give the query a unique name
            name: 'fetch-hour-cont-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'1 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime)',
            values: [station_selected.latitude, station_selected.longitude]
        }
        find_stations_from_divvy_hour_continous(query_hour)
        io.sockets.emit('updatedStation', stations_found_hour_cont);
    }
  }, 180000);

  io.on('connection', function (socket) {
    console.log('a user connected');
  });
  
// Function to calculate data for SMA
router.route('/stations/sma').post((req, res) => {
    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0,len = stations_found.length; i < len; i++) {
        if ( stations_found[i].stationName === req.body.placeName.stationName ) { // strict equality test
            station_selected = stations_found[i];
            break;
        }
    }
    // Additional parameter to signify 1 hour/24 hours/7 days
    let query_hour, query_day;
        query_hour = {
            // give the query a unique name
            name: 'fetch-sma_hr-divvy',
            // This query fetches an hour long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'1 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime) LIMIT 30',
            values: [station_selected.latitude, station_selected.longitude]
        }

        query_day = {
            // give the query a unique name
            name: 'fetch-sma_day-divvy',
            // This query fetches a day long data of the divvy bikes
            text: ' select * from divvy_stations_logs d where d.lastcommunicationtime > now() - interval \'24 hour\' and d.latitude = $1 and d.longitude = $2 order by (d.lastcommunicationtime) LIMIT 720',
            values: [station_selected.latitude, station_selected.longitude]
        }

        find_stations_from_divvy_hour_sma(query_hour, query_day).then(function (response) {
            var hits = response;
            res.json({'sma_calculated': 'Added successfully'});
        });
});

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


async function find_stations_from_divvy(query) {

    const response = await pgClient.query(query);

    stations_found = [];
// i<3 because we limited the no of divvy stations to 3
    for (i = 0; i < 3; i++) {
                
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

// async function for hour old data

async function find_stations_from_divvy_hour_old(query) {

    const response = await pgClient.query(query);

    stations_found_hourold = [];
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

        stations_found_hourold.push(station);

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

// Async function to calculate SMA

async function find_stations_from_divvy_hour_sma(query_hour, query_day) {

    const response_hour = await pgClient.query(query_hour);
    const response_day = await pgClient.query(query_day);

    let sma_hour = [];
    let sma_day = [];
    sma_30_data = sma(30);
    sma_720_data = sma(720);
    // console.log(sma_30_data);
    stations_found_hour_sma = []
    for (i = 0; i < response_day.rows.length; i++) {
        
        plainTextDateTime =  moment(response_day.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
        // Calculate SMA here
        sma_30 = sma_30_data(response_day.rows[i].availabledocks)
        sma_720 = sma_720_data(response_day.rows[i].availabledocks)
        console.log(sma_30);
        var station = {
                    "id": response_day.rows[i].id,
                    "stationName": response_day.rows[i].stationname,
                    "availableBikes": response_day.rows[i].availablebikes,
                    "availableDocks": response_day.rows[i].availabledocks,
                    "is_renting": response_day.rows[i].is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": response_day.rows[i].latitude,    
                    "longitude": response_day.rows[i].longitude,
                    "status": response_day.rows[i].status,
                    "totalDocks": response_day.rows[i].totaldocks,
                    "sma_30": sma_30,
                    "sma_720": sma_720
        };
        
        stations_found_hour_sma.push(station);

    }
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_places_from_yelp(place, where) {

    places_found = [];

//////////////////////////////////////////////////////////////////////////////////////
// Using the business name to search for businesses will leead to incomplete results
// better to search using categorisa/alias and title associated with the business name
// For example one of the famous places in chicago for HotDogs is Portillos
// However, it also offers Salad and burgers
// Here is an example of a busness review from Yelp for Pertilos
//               alias': 'portillos-hot-dogs-chicago-4',
//              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
//                             {'alias': 'salad', 'title': 'Salad'},
//                             {'alias': 'burgers', 'title': 'Burgers'}],
//              'name': "Portillo's Hot Dogs",
//////////////////////////////////////////////////////////////////////////////////////


    let body = {
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

    find_places_task_completed = true;             
      
}



app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));

