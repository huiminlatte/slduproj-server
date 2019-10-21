const fs = require('fs');
const mysql = require('mysql');
const csv = require('fast-csv');
const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express');
const app = express();
const moment = require('moment');
cors = require('cors'), app.use(cors());
app.use(bodyParser.json());
global.__basedir = __dirname;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb'
});

connection.connect((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Connected to Database");
  }
})

// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + '/uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
  }
});
const upload = multer({
  storage: storage
});

app.get('/', (req, res) => {
  res.send("Welcome to SLDU APP!");
  console.log(req.query);
})

// -> Express Upload RestAPIs
// TODO: Upload successful 
app.post('/api/uploadeventfile', upload.single("uploadfile"), (req, res) => {
  // checkiftableexists(req.fi);

  importEventData2MySQL(__basedir + '/uploads/' + req.file.filename, req.file.originalname);
  res.json({
    'msg': 'File uploaded successfully!',
    'file': req.file
  });

});

app.post('/api/uploadstudentmasterlist', upload.single("uploadfile"), (req, res) => {
  importStudentData2MySQL(__basedir + '/uploads/' + req.file.filename);
  res.json({
    'msg': 'File uploaded/import successfully!',
    'file': req.file
  });
});

app.post('/api/uploadactivestudentlist', upload.single("uploadfile"), (req, res) => {
  importActiveStudentData2MySQL(__basedir + '/uploads/' + req.file.filename);
  res.json({
    'msg': 'File uploaded/import successfully!',
    'file': req.file
  });
});


app.post('/api/uploadattribute2skillset', upload.single("uploadfile"), (req, res) => {
  importAttrSkillData2MySQL(__basedir + '/uploads/' + req.file.filename);
  res.json({
    'msg': 'File uploaded/import successfully!',
    'file': req.file
  });
});

app.post('/api/uploadevent2attribute', upload.single("uploadfile"), (req, res) => {
  importEventAttriData2MySQL(__basedir + '/uploads/' + req.file.filename);
  res.json({
    'msg': 'File uploaded/import successfully!',
    'file': req.file
  });
});

//Function to connect to database and execute query
var executeQuery = function (query, res) {
  //var request = new connection.Request();
  // query to the database
  connection.query(query, function (err, response) {
    if (err) {
      //return err
      //console.log("Error while querying database :- " + err);
      res.send(err);
    } else {

      res.send(response);
    }
  });
}
function convertDateFormat(response) {
  for (var i = 0; i < Object.keys(response[0]).length; i++) {
    // console.log(Object.keys(response[0])[i]);
    if (Object.keys(response[0])[i] == 'STARTDATE') {
      // console.log(i);
      for (var j = 0; j < response.length; j++) {
        response[j].STARTDATE = moment(response[j].STARTDATE, 'YYYY-MM-DD').format("DD/MM/YYYY");
        // console.log(moment(response[j].STARTDATE).format("DD/MM/YYYY"));
      }
    }
  }
  for (var i = 0; i < Object.keys(response[0]).length; i++) {
    if (Object.keys(response[0])[i] == 'ENDDATE') {
      // console.log(i);
      for (var j = 0; j < response.length; j++) {
        response[j].ENDDATE = moment(response[j].ENDDATE, 'YYYY-MM-DD').format("DD/MM/YYYY");
      }
    }
  }
  // console.log(response[1]);
  return response;
}

var executeQueryShowTable = function (query, res) {
  //var request = new connection.Request();
  // query to the database
  console.log("Query", query);
  connection.query(query, function (err, response) {
    try {
      var response2 = convertDateFormat(response);
      var apiResult = {};
      apiResult = {
        // TODO: "status": "found"
        "dynamic": "y",
        "columns": Object.keys(response2[0]),
        "data": response2
      }
      res.json(apiResult);
    }
    catch (err) {
      res.send(err);
    }
  });
}


// 2 - Search students from masterlist 

app.get("/api/search/studentname/", function (req, res) {
  var studentname = req.query.studentname;
  var query = "select * from STUDENT_MASTERLIST where STUDENTNAME LIKE '%" + studentname + "%'";
  executeQueryShowTable(query, res);
});

app.get("/api/search/matricnumber/", function (req, res) {
  var matricnumber = req.query.matricnumber;
  var query = "select * from STUDENT_MASTERLIST where MATRICNUMBER LIKE '%" + matricnumber + "%'";
  executeQueryShowTable(query, res);
});

app.get("/api/search/ntuemailaddress/", function (req, res) {
  var ntuemailaddress = req.query.ntuemailaddress;
  var query = "select * from STUDENT_MASTERLIST where NTUEMAILADDRESS LIKE '%" + ntuemailaddress + "%'";
  executeQueryShowTable(query, res);
});

app.get("/api/search/event/", function (req, res) {
  var eventname = req.query.eventname;
  var query = "select * from EVENTS where `EVENT/WORKSHOPNAME` LIKE '%" + eventname + "%'";
  executeQueryShowTable(query, res);
});

app.get("/api/search/eventposition/", function (req, res) {
  var eventposition = req.query.eventposition;
  var query = "select * from EVENTS where POSITION LIKE '%" + eventposition + "%'";
  executeQueryShowTable(query, res);
});

app.get("/api/search/eventstartyear/", function (req, res) {
  var eventstartyear = req.query.eventstartyear;
  if (!eventstartyear) {
    var query = "SELECT * FROM EVENTS";
  }
  else {
    var query = "SELECT * FROM EVENTS WHERE YEAR(STARTDATE)=" + eventstartyear;

  }
  executeQueryShowTable(query, res);
});

app.get("/api/search/eventendyear/", function (req, res) {
  var eventendyear = req.query.eventendyear;
  if (!eventendyear) {
    var query = "SELECT * FROM EVENTS";
  }
  else {
    var query = "SELECT * FROM EVENTS WHERE YEAR(ENDDATE)=" + eventendyear;

  }
  executeQueryShowTable(query, res);
});



// To view list of uploaded files : /api/uploadedfiles
// To view specific file contents : /api/uploadedfiles?filename=:filename
// 
app.get("/api/uploadedfiles", function (req, res) {
  var filename = req.query.filename;
  if (filename) {
    var query = "SELECT * FROM " + filename;
    executeQueryShowTable(query, res);
    //errresponse = executeQuery(query, res);
    //console.log("ERR RESPONSE")
    //console.log(errresponse); 
  } else {
    var query = "SHOW TABLES;";
    executeQuery(query, res);
    //setTimeout(errresponse = executeQuery(query, res));
    //console.log("ERR RESPONSE")
    //console.log(errresponse); 
  }
});

// List of Events : 
// To Extract data from a certain event: localhost:8080/api/events/?eventname=escendo
// Eventname must be exact (Use /api/view_events to provide a dropdown list for selecting events)
// sortstudentname=1 
// sortpositiontier=1
app.get("/api/events", function (req, res) {
  var eventname = req.query.eventname;
  var sortstudentname = req.query.sortstudentname;

  //console.log("eventname: ", eventname);
  if (eventname) {
    var query = "SELECT * FROM " + eventname;
    if (sortstudentname) {
      query = query + " ORDER BY STUDENTNAME";
    }

    executeQueryShowTable(query, res);

  } else {
    var query = "SELECT DISTINCT FILENAME FROM EVENTS";
    executeQuery(query, res);
  }
});

app.get("/api/eventparticipation", function (req, res) {
  var eventname = req.query.eventname;

  var query = "SELECT COUNT(*) FROM " + eventname; //Not unique Matric Number
  executeQuery(query, res);
});

app.get("/api/numberofstudents", function (req, res) {

  var query = "SELECT COUNT(*) FROM STUDENT_MASTERLIST";
  executeQuery(query, res);
});


app.put("/api/droptables", function (req, res) {
  var tablename = req.query.tablename;
  var apiResult = {};
  var query = "DROP TABLE " + tablename; //Not unique Matric Number
  var eventsdrop_query = "DELETE FROM EVENTS WHERE FILENAME='" + tablename + "';";
  try {
    connection.query(query, function (err, result) {

      try {
        connection.query(eventsdrop_query, function (err2, result2) {
          if (result2.affectedRows != 0) {
            apiResult = {
              "success": "yes",
              "data": tablename,
            }

          }
          else {
            apiResult = {
              "success": "no",
              "data": tablename,
            }

          }
          res.json(apiResult);



        })
      }
      catch (err2) {
        res.send(err2);
      }

    });

  }
  catch (err) {
    res.send(err);
  }

});

// -> Import Event CSV File to MySQL database
function importEventData2MySQL(filePath, filename) {
  var apiResult = {};
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  //console.log(typeof(filename));
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      // Remove Header ROW
      //console.log(csvData);
      csvData.shift();

      //var eventname = csvData[0][4].replace(/\s/g, '');
      var file = filename.replace(/\.[^/.]+$/, "").replace(/\s/g, '');
      var file_check = filename.replace(/\.[^/.]+$/, "");
      // console.log("file: ", file);
      // console.log("file_check: ", file_check);

      var sql_settimezone = "SET time_zone = '+08:00'";
      connection.query(sql_settimezone, (error0, response0) => {
        if (error0) throw (error0);
        else console.log(response0);

        // Create table for first time adding event
        sql_createeventfile = 'CREATE TABLE IF NOT EXISTS EVENTS (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(10) NOT NULL, NTUEMAILADDRESS VARCHAR(255), POSITION VARCHAR(255), STARTDATE DATE, ENDDATE DATE, `EVENT/WORKSHOPNAME` VARCHAR(255), FILENAME VARCHAR(255))';

        for (var i = 0; i < csvData.length; i++) {
          csvData[i][4] = moment(csvData[i][4], 'DD/MM/YY').format('YYYY-MM-DD');
          csvData[i][5] = moment(csvData[i][5], 'DD/MM/YY').format('YYYY-MM-DD');
          console.log(csvData[i][4], csvData[i][5]);
        }



        connection.query(sql_createeventfile, (error, response) => {
          if (error) throw error;
          console.log(error || response);
          let sql_check_eventexists = "SELECT EXISTS(SELECT * FROM EVENTS WHERE FILENAME='" + file_check + "') as RESULT";
          var data = [];
          for (var i = 0; i < csvData.length; i++) {
            data.push([csvData[i][0], csvData[i][1], csvData[i][2], csvData[i][3], csvData[i][4], csvData[i][5], csvData[i][6], file]);
          }
          console.log(data[34]);
          connection.query(sql_check_eventexists, data, (error2, response2) => {
            console.log(response2 || error2);
            if (!response2[0].RESULT) {
              let sql_import_eventdata = 'INSERT INTO EVENTS (STUDENTNAME, MATRICNUMBER, NTUEMAILADDRESS, POSITION, STARTDATE, ENDDATE, `EVENT/WORKSHOPNAME`, FILENAME) VALUES ?';
              connection.query(sql_import_eventdata, [data], (error3, response3) => {
                if (error3) throw error3;
                console.log(error3 || response3);
                var sql_checkiftableexists = "SELECT 1 FROM " + file + " LIMIT 1";
                connection.query(sql_checkiftableexists, (err, response) => {
                  if (err) {
                    var sql_create_eventtable = 'CREATE TABLE IF NOT EXISTS ' + file + ' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(10) NOT NULL, NTUEMAILADDRESS VARCHAR(255), POSITION VARCHAR(255), STARTDATE DATE, ENDDATE DATE, `EVENT/WORKSHOPNAME` VARCHAR(255));';

                    connection.query(sql_create_eventtable, (error, response) => {
                      if (error) throw error;
                      let sql_import_eventdata = 'INSERT INTO ' + file + ' (STUDENTNAME, MATRICNUMBER, NTUEMAILADDRESS, POSITION, STARTDATE, ENDDATE, `EVENT/WORKSHOPNAME` ) VALUES ?';
                      connection.query(sql_import_eventdata, [csvData], (error, response) => {
                        console.log(error || response);
                      });

                    });
                  } else {
                    console.log("Table exists");
                    //TODO: send json to frontend
                  }
                })


              });
            }


          });
        });

      });

      //   delete file after saving to MySQL database
      //   -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath);
    });

  stream.pipe(csvStream);
}

// -> Import Event CSV File to MySQL database
function importStudentData2MySQL(filePath) {
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      // Remove Header ROW
      csvData.shift();


      var sql_create_student_masterlist = 'CREATE TABLE IF NOT EXISTS ' + 'STUDENT_MASTERLIST' + ' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(9) NOT NULL, NTUEMAILADDRESS VARCHAR(255) UNIQUE, PRIMARY KEY (MATRICNUMBER))';
      connection.query(sql_create_student_masterlist, (error, response) => {
        console.log(error || response);
      })
      let sql_import_studentdata = 'INSERT INTO STUDENT_MASTERLIST (studentname, matricnumber, ntuemailaddress) SELECT * FROM (SELECT ?, ?, ?) AS tmp WHERE NOT EXISTS (SELECT matricnumber FROM STUDENT_MASTERLIST WHERE matricnumber = ? ) LIMIT 1;';

      for (var i = 0; i < csvData.length; i++) {
        connection.query(sql_import_studentdata, [csvData[i][0], csvData[i][1], csvData[i][2], csvData[i][1]], (error, response) => {
          console.log(error || response);
        });
      }

      // var sql_dropexistingstudentmasterlist = "DROP TABLE IF EXISTS ACTIVESTUDENTMASTERLIST";
      // connection.query(sql_dropexistingstudentmasterlist, (error, response) => {
      //   console.log(error || response);
      // })

      // var sql_create_active_student_masterlist = 'CREATE TABLE IF NOT EXISTS ' + 'ACTIVESTUDENTMASTERLIST' + ' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(9) NOT NULL, NTUEMAILADDRESS VARCHAR(255) UNIQUE, PRIMARY KEY (MATRICNUMBER))';
      // connection.query(sql_create_active_student_masterlist, (error, response) => {
      //   console.log(error || response);
      // });

      // let sql_importactivestudentmasterlist = 'INSERT INTO ACTIVESTUDENTMASTERLIST (studentname, matricnumber, ntuemailaddress) SELECT * FROM (SELECT ?, ?, ?) AS tmp WHERE NOT EXISTS (SELECT matricnumber FROM ACTIVESTUDENTMASTERLIST WHERE matricnumber = ? ) LIMIT 1;';
      // for (var i = 0; i < csvData.length; i++) {
      //   connection.query(sql_importactivestudentmasterlist, [csvData[i][0], csvData[i][1], csvData[i][2], csvData[i][1]], (error, response) => {
      //     console.log(error || response);
      //   });
      // }


      // delete file after saving to MySQL database
      // -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
    });
  stream.pipe(csvStream);
}

function importActiveStudentData2MySQL(filePath) {
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      // Remove Header ROW
      csvData.shift();

      var sql_dropexistingstudentmasterlist = "DROP TABLE IF EXISTS ACTIVESTUDENTLIST";
      connection.query(sql_dropexistingstudentmasterlist, (error, response) => {
        console.log(error || response);
      })

      var sql_create_student_masterlist = 'CREATE TABLE IF NOT EXISTS ' + 'ACTIVESTUDENTLIST' + ' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(9) NOT NULL, NTUEMAILADDRESS VARCHAR(255) UNIQUE, PRIMARY KEY (MATRICNUMBER))';
      connection.query(sql_create_student_masterlist, (error, response) => {
        console.log(error || response);
      })
      let sql_import_studentdata = 'INSERT INTO ACTIVESTUDENTLIST (studentname, matricnumber, ntuemailaddress) SELECT * FROM (SELECT ?, ?, ?) AS tmp WHERE NOT EXISTS (SELECT matricnumber FROM ACTIVESTUDENTLIST WHERE matricnumber = ? ) LIMIT 1;';

      for (var i = 0; i < csvData.length; i++) {
        connection.query(sql_import_studentdata, [csvData[i][0], csvData[i][1], csvData[i][2], csvData[i][1]], (error, response) => {
          console.log(error || response);
        });
      }



      // delete file after saving to MySQL database
      // -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
    });
  stream.pipe(csvStream);
}


function importAttrSkillData2MySQL(filePath) {
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      // Remove Header ROW
      csvData.shift();
      console.log(csvData);

      // Open the MySQL connection
      var sql_create_attrskill = 'CREATE TABLE IF NOT EXISTS ' + 'ATTRIBUTE2SKILLSET' + ' (ATTRIBUTE VARCHAR(255) NOT NULL, CODE VARCHAR(5) NOT NULL, SKILLSET1 VARCHAR(255), SKILLSET2 VARCHAR(255), SKILLSET3 VARCHAR(255), PRIMARY KEY (ATTRIBUTE))';
      connection.query(sql_create_attrskill, (error, response) => {
        console.log(error || response);
      })

      let sql_import_attrskill = 'INSERT INTO ATTRIBUTE2SKILLSET (ATTRIBUTE, CODE, SKILLSET1, SKILLSET2, SKILLSET3) VALUES ?';
      connection.query(sql_import_attrskill, [csvData], (error, response) => {
        console.log(error || response);
      });
      // delete file after saving to MySQL database
      // -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
    });
  stream.pipe(csvStream);
}

function importEventAttriData2MySQL(filePath) {
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      // Remove Header ROW
      csvData.shift();
      //console.log(csvData);

      // Open the MySQL connection
      var sql_create_eventattr = 'CREATE TABLE IF NOT EXISTS ' + 'EVENT2ATTRIBUTE' + ' (WORKSHOPEVENT VARCHAR(255) NOT NULL, DESCRIPTION VARCHAR(255), HOST VARCHAR(255) NOT NULL, ATTRIBUTE1 VARCHAR(255), ATTRIBUTE2 VARCHAR(255), ATTRIBUTE3 VARCHAR(255), ATTRIBUTE4 VARCHAR(255), ATTRIBUTE5 VARCHAR(255), PRIMARY KEY (workshopevent));';

      connection.query(sql_create_eventattr, (error, response) => {
        console.log(error || response);
      })

      let sql_import_eventattr = 'INSERT INTO EVENT2ATTRIBUTE (WORKSHOPEVENT, DESCRIPTION, HOST, ATTRIBUTE1, ATTRIBUTE2, ATTRIBUTE3, ATTRIBUTE4, ATTRIBUTE5) VALUES ?';
      connection.query(sql_import_eventattr, [csvData], (error, response) => {
        console.log(error || response);
      });
      // delete file after saving to MySQL database
      // -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
    });
  stream.pipe(csvStream);
}

app.get('/api/skillset', (req, api_res) => {
  var matricnumber = req.query.matricnumber;
  // var given_studentname = req.query.studentname;
  // var given_ntuemailaddress = req.query.ntuemailaddress;


  var list_of_eventparticipated = [];
  var list_of_eventposition = [];
  var list_of_eventstartdate = [];
  var list_of_eventenddate = [];


  fn1_geteventparticipated(matricnumber).then((fn1_geteventparticipated_res) => {
    for (var i = 0; i < fn1_geteventparticipated_res.length; i++) {
      list_of_eventparticipated.push(fn1_geteventparticipated_res[i]["EVENT/WORKSHOPNAME"]);
    }
    for (var i = 0; i < fn1_geteventparticipated_res.length; i++) {
      list_of_eventposition.push(fn1_geteventparticipated_res[i]["POSITION"]);
    }
    for (var i = 0; i < fn1_geteventparticipated_res.length; i++) {
      list_of_eventstartdate.push(moment(fn1_geteventparticipated_res[i]["STARTDATE"]).format("DD/MM/YYYY"));
    }
    for (var i = 0; i < fn1_geteventparticipated_res.length; i++) {
      list_of_eventenddate.push(moment(fn1_geteventparticipated_res[i]["ENDDATE"]).format("DD/MM/YYYY"));
    }
    fn3_getstudentname(matricnumber).then((studentname) => {
      // console.log("fn2");
      fn2_getattributeskill().then((fn2_getattributeskill_res) => {
        // console.log("fn3");
        // console.log(fn2_getattributeskill_res[0]);
        const calculate_skillset = require('./tools/calculate_skillset');
        const result = calculate_skillset(list_of_eventparticipated, fn2_getattributeskill_res[0], fn2_getattributeskill_res[1]);

        const studentprofileAPI = {
          studentname: studentname[0].studentname,
          matricnumber: matricnumber,
          studenteventlist: {
            dynamic: "y",
            columns: ["Events", "Event Position", "Event Start Date", "Event End Date"],
            data: []
          },
          radarchartdata: result,
        }

        for (let i = 0; i < list_of_eventparticipated.length; i++) {
          let current_event = {
            "Events": list_of_eventparticipated[i],
            "Event Position": list_of_eventposition[i],
            "Event Start Date": list_of_eventstartdate[i],
            "Event End Date": list_of_eventenddate[i]
          };
          studentprofileAPI.studenteventlist.data.push(current_event);
        }


        api_res.json(studentprofileAPI);

      }).catch(error => console.log("fn2_getattributeskill error", error));
    }).catch(error => console.log("fn3_getstudentname error", error));
  }).catch(error => console.log("fn1_find_all_events error", error))
})

async function fn1_geteventparticipated(matricnumber) {
  var query_participation = "select * from EVENTS where MATRICNUMBER LIKE '" + matricnumber + "'";

  let promise1 = new Promise((resolve, reject) => {
    connection.query(query_participation, (err, response) => {
      if (err) throw err;
      resolve(response);
    });
  });
  let results = await promise1;
  return results;
}

async function fn2_getattributeskill() {
  // 2nd object
  // var event_to_attribute = [];
  // var attribute_to_skillset = [];

  var i;
  var query_event2attr = "SELECT WORKSHOPEVENT, ATTRIBUTE1, ATTRIBUTE2, ATTRIBUTE3, ATTRIBUTE4, ATTRIBUTE5 FROM EVENT2ATTRIBUTE";

  let promise1 = new Promise((resolve, reject) => {
    connection.query(query_event2attr, (err, response) => {
      if (err) reject(err);
      //res.json(response);
      resolve(response);
    })
  });

  let event_to_attribute = await promise1;

  let promise2 = new Promise((resolve, reject) => {
    // 3rd object
    query_attr2skill = "SELECT ATTRIBUTE, SKILLSET1, SKILLSET2, SKILLSET3 FROM ATTRIBUTE2SKILLSET";
    connection.query(query_attr2skill, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
  let attribute_to_skillset = await promise2;
  var result = [event_to_attribute, attribute_to_skillset];
  return result;
}

async function fn3_getstudentname(matricnumber) {
  var query_studentname = "select studentname from STUDENT_MASTERLIST where matricnumber LIKE '" + matricnumber + "';";

  let promise = new Promise((resolve, reject) => {
    connection.query(query_studentname, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
  let studentname = await promise;

  return studentname;
}

// Comparison function (eventabsentees)
async function c1_eventabsentees(eventtable) {
  var query_eventabsentees = "Select studentname, matricnumber from STUDENT_MASTERLIST where matricnumber in (SELECT matricnumber from " + eventtable + ");";

  let promise = new Promise((resolve, reject) => {
    connection.query(query_eventabsentees, (err, response) => {
      if (err) throw err;
      resolve(response);
    });
  });

  let eventabsentees = await promise;

  return eventabsentees;
}

async function c2_eventcommonparticipants(event1, event2) {
  var query_eventcommonparticipants = "Select studentname, matricnumber from " + event1 + " where matricnumber in (SELECT matricnumber from " + event2 + ");";


  let promise = new Promise((resolve, reject) => {
    connection.query(query_eventcommonparticipants, (err, response) => {
      if (err) throw err;
      resolve(response);
    });
  });

  let eventcommonparticipants = await promise;

  return eventcommonparticipants;
}

app.post('/api/commonparticipants', (req, res) => {
  var event_list = req.body.Events;
  sql_commonparticipants = "SELECT " + event_list[0] + ".MATRICNUMBER, " + event_list[0] + ".STUDENTNAME FROM " + event_list[0];

  for (var i = 1; i < event_list.length; i++) {
    sql_commonparticipants = sql_commonparticipants + " INNER JOIN " + event_list[i] + " ON " + event_list[0] + ".MATRICNUMBER= " + event_list[i] + ".MATRICNUMBER ";
  }

  connection.query(sql_commonparticipants, function (err, response) {
    if (err) {
      //return err
      //console.log("Error while querying database :- " + err);
      res.send(err);
    } else {

      res.json({ "commonparticipants": response, "tables": event_list });
    }
  });

})

app.post('/api/commonabsentees', (req, res) => {
  const event_list = req.body.Events;


  var sql_droptable = "DROP TABLE IF EXISTS ALL_PARTICIPANTS";
  var sql_allparticipants = "CREATE TEMPORARY TABLE ALL_PARTICIPANTS SELECT MATRICNUMBER FROM " + event_list[0];
  for (var i = 1; i < event_list.length; i++) {
    sql_allparticipants = sql_allparticipants + " UNION SELECT MATRICNUMBER FROM " + event_list[i];
  }
  var sql_commonabsentees = "SELECT ACTIVESTUDENTLIST.MATRICNUMBER, ACTIVESTUDENTLIST.STUDENTNAME FROM ACTIVESTUDENTLIST LEFT JOIN ALL_PARTICIPANTS ON ACTIVESTUDENTLIST.MATRICNUMBER=ALL_PARTICIPANTS.MATRICNUMBER WHERE ALL_PARTICIPANTS.MATRICNUMBER IS NULL";

  connection.query(sql_droptable, function (err, response) {
    console.log(sql_droptable, err || response);
    if (err) {
      res.send(err);
    } else {
      connection.query(sql_allparticipants, function (err2, response2) {
        console.log(sql_allparticipants, err2 || response2);

        if (err2) {
          res.send(err2);
        }
        else {
          connection.query(sql_commonabsentees, function (err3, response3) {
            console.log(sql_commonabsentees, err3 || response3);
            if (err3) {
              res.send(err3);
            }
            else {
              connection.query(sql_droptable, function (err4, response4) {
                console.log(sql_droptable, err4 || response4);
                if (err4) {
                  res.send(err4);
                }
                else {
                  res.json({ "event_list": event_list, "common_absentees": response3 });

                }
              })
            }
          })

        }
      })
    }
  });

})

app.get('/api/compare_absentees2events', (req, res) => {
  const event1 = req.query.event1;
  const event2 = req.query.event2;
  //console.log(event1, event2);
  c1_eventabsentees(event1).then((event1_absentees) => {
    c1_eventabsentees(event2).then((event2_absentees) => {
      c2_eventcommonparticipants(event1, event2).then((event_commonparticipants) => {
        const absentees_2events = require('./tools/absentees_2events');
        const result = absentees_2events(event1_absentees, event2_absentees);

        API_compare2events = {
          "absent2events": result,
          "absentevent1": {
            eventname: event1,
            numberofabsentees: event1_absentees.length,
            event1_absentees: event1_absentees
          },
          "absentevent2": {
            eventname: event2,
            numberofabsentees: event2_absentees.length,
            event2_absentees: event2_absentees
          },
          "attendbothevents": {
            event1: event1,
            event2: event2,
            number: event_commonparticipants.length,
            attendboth: event_commonparticipants
          }
        }

        res.json(API_compare2events);
      }).catch(error => console.log("c2 error", error));
    }).catch(error => console.log("c1 error", error));
  }).catch(error => console.log("c1 error", error));

})



// Create a Server
let server = app.listen(8080, function () {

  let host = server.address().address
  let port = server.address().port

  console.log("App listening at http://%s:%s", host, port)

})