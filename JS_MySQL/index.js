// Import libraries
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
// Initialise objects and declare constants
const app = express();
const port = 8088;

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "world_air_quality"
});

db.connect((err) => {
	if(err) {
		throw err;
	}
	console.log("Connected to database");
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

function templateRenderer(template, response){
	return function(error, results, fields){
		if(error){
			throw error;
		}
		response.render(template, { data: JSON.stringify(results) });
	}
}

app.get('/', function (req, res) {
	const data = {};
	queryCommand = "SELECT * FROM (SELECT tt1.Country, tt1.AveragePM, tt2.Output, tt2.EPI FROM \
        (SELECT Country, MAX(AveragePM) AS AveragePM FROM AirPollution GROUP BY Country) AS tt1 \
        INNER JOIN (SELECT t1.ISOCode, t1.Country AS CountryL, t2.Country AS CountryR, t2.EPI, t1.Output \
            FROM ManufacturingOutput t1 INNER JOIN EnvironmentalPerformance t2 USING (ISOCode)) AS tt2 \
            WHERE tt1.AveragePM != \"\" \
                AND tt2.Output != \"\" \
                AND tt2.EPI != \"\" \
                AND (tt1.Country=tt2.CountryL OR tt1.Country=tt2.CountryR)) AS resT \
				INNER JOIN AQI \
					WHERE resT.AveragePM >= AQI.MinPM AND resT.AveragePM <= AQI.MaxPM ORDER BY AveragePM DESC";
	db.query(queryCommand, templateRenderer('index', res));
});

app.listen(
  port,
  () => console.log('App listening on port ' + port) // success callback
);
