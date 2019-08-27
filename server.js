const fs = require('fs');
const mysql = require('mysql');
const csv = require('fast-csv');

const multer = require('multer');
const express = require('express');

const app = express();
cors = require('cors'), app.use(cors());
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

var executeQueryShowTable = function (query, res) {
  //var request = new connection.Request();
  // query to the database
  connection.query(query, function (err, response) {
    if (err) {
      //return err
      //console.log("Error while querying database :- " + err);
      res.send(err);
    } else {
      var apiResult = {};
      apiResult = {
        // TODO: "status": "found"
        "dynamic": "y",
        "columns": Object.keys(response[0]),
        "data": response
      }

      //console.log("EXECUTEQUERY");
      //return response;
      //console.log(Object.keys(response[0]));
      res.json(apiResult);
    }
  });
}

// 2 - Search students from masterlist 
// added 3 more functions: sortname=1 to sort name ascending
// sortemail= 1
// sortmatricnumber=1
app.get("/api/students/", function (req, res) {
  var studentname = req.query.name;
  var matricnumber = req.query.matricnumber;
  var tier = req.query.tier;

  var query = "select * from student_masterlist";

  var sortname = req.query.sortname; //Sort A-Z (name)
  var sortmatricnumber = req.query.sortmatricnumber;
  var sortemail = req.query.sortemail;

  if (matricnumber) {
    query = query + " where matricnumber LIKE '%" + matricnumber + "%'";
  }
  if (studentname) {
    if (matricnumber) {
      query = query + " and ";
    } else {
      query = query + " where ";
    }
    query = query + "studentname LIKE '%" + studentname + "%'";

  } else if (tier) {
    if (matricnumber || studentname) {
      query = query + " and ";
    } else {
      query = query + " where ";
    }
    query = query + "tier=" + tier;
  }
  if (sortname) {
    query = query + " ORDER BY STUDENTNAME";
  } else if (sortmatricnumber) {
    query = query + " ORDER BY MATRICNUMBER";
  } else if (sortemail) {
    query = query + " ORDER BY NTUEMAILADDRESS";
  }

  //console.log(query);
  executeQueryShowTable(query, res);
});



//THIS IS NOT USABLE YET
app.get("/api/students/participation/", function (req, res) {
  var matricnumber = req.query.matricnumber;
  var studentname = req.query.studentname;


  var query = "select * from " + eventlist + " where matricnumber='" + matricnumber + "'";

  //// TODO: 
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
  var sortpositiontier = req.query.sortpositiontier;

  //console.log("eventname: ", eventname);
  if (eventname) {
    var query = "SELECT * FROM " + eventname;
    if (sortstudentname) {
      query = query + " ORDER BY STUDENTNAME";
      if (sortpositiontier) {
        query = query + ", EVENTPOSITIONTIER";
      }
    } else if (sortpositiontier) {
      query = query + " ORDER BY EVENTPOSITIONTIER";
    }

    executeQueryShowTable(query, res);

  } else {
    var query = "SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME IN ('EVENTNAME') AND TABLE_SCHEMA='mydb'";
    executeQuery(query, res);
  }
});

app.get("/api/eventparticipation", function (req, res) {
  var eventname = req.query.eventname;

  var query = "SELECT COUNT(*) FROM " + eventname; //Not unique Matric Number
  executeQuery(query, res);
});

app.get("/api/numberofstudents", function (req, res) {

  var query = "SELECT COUNT(*) FROM student_masterlist"; //Not unique Matric Number
  executeQuery(query, res);
});

//Delete table
app.put("/api/droptables", function (req, res) {
  var tablename = req.query.tablename;
  var apiResult = {};
  var query = "DROP TABLE " + tablename; //Not unique Matric Number
  connection.query(query, function (err, result) {
    if (err) {
      apiResult = {
        "success": "no",
        "data": err,
      }
    } else {
      apiResult = {
        "success": "yes",
        "data": tablename
      }
    }
    res.json(apiResult);
  })
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
      var file = filename.replace(/\.[^/.]+$/, "");
      var sql_checkiftableexists = "SELECT 1 FROM " + file + " LIMIT 1";
      connection.query(sql_checkiftableexists, (err, response) => {
        if (err) {
          var sql_create_eventtable = 'CREATE TABLE IF NOT EXISTS ' + file + ' (TIMESTAMP VARCHAR(255), STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(9) NOT NULL, NTUEMAILADDRESS VARCHAR(255) UNIQUE, EVENTNAME VARCHAR(255), EVENTPOSITION VARCHAR(255), EVENTPOSITIONTIER INT, EVENTSTARTDATE VARCHAR(255), EVENTENDDATE VARCHAR(255), PRIMARY KEY (MATRICNUMBER))';

          connection.query(sql_create_eventtable, (error, response) => {
            if (error) throw error;
            console.log("response", response);

            let sql_import_eventdata = 'INSERT INTO ' + file + ' (TIMESTAMP, STUDENTNAME, MATRICNUMBER, NTUEMAILADDRESS, EVENTNAME, EVENTPOSITION, EVENTPOSITIONTIER, EVENTSTARTDATE, EVENTENDDATE) VALUES ?';
            connection.query(sql_import_eventdata, [csvData], (error, response) => {
              console.log(error || response);
            });

          });
        } else {
          console.log("Table exists");
          //TODO: send json to frontend
        }

      })
      //   delete file after saving to MySQL database
      //   -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
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


      // Open the MySQL connection
      var sql_create_student_masterlist = 'CREATE TABLE IF NOT EXISTS ' + 'student_masterlist' + ' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNUMBER VARCHAR(9) NOT NULL, NTUEMAILADDRESS VARCHAR(255) UNIQUE, PRIMARY KEY (MATRICNUMBER))';
      connection.query(sql_create_student_masterlist, (error, response) => {
        console.log(error || response);
      })
      let sql_import_studentdata = 'INSERT INTO student_masterlist (STUDENTNAME, MATRICNUMBER, NTUEMAILADDRESS) VALUES ?';
      connection.query(sql_import_studentdata, [csvData], (error, response) => {
        console.log(error || response);
      });
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
      var sql_create_attrskill = 'CREATE TABLE IF NOT EXISTS ' + 'attribute2skillset' + ' (ATTRIBUTE VARCHAR(255) NOT NULL, CODE VARCHAR(5) NOT NULL, SKILLSET1 VARCHAR(255), SKILLSET2 VARCHAR(255), SKILLSET3 VARCHAR(255), PRIMARY KEY (ATTRIBUTE))';
      connection.query(sql_create_attrskill, (error, response) => {
        console.log(error || response);
      })

      let sql_import_attrskill = 'INSERT INTO attribute2skillset (ATTRIBUTE, CODE, SKILLSET1, SKILLSET2, SKILLSET3) VALUES ?';
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
      var sql_create_eventattr = 'CREATE TABLE IF NOT EXISTS ' + 'event2attribute' + ' (WORKSHOPEVENT VARCHAR(255) NOT NULL, DESCRIPTION VARCHAR(255), HOST VARCHAR(255) NOT NULL, ATTRIBUTE1 VARCHAR(255), ATTRIBUTE2 VARCHAR(255), ATTRIBUTE3 VARCHAR(255), ATTRIBUTE4 VARCHAR(255), ATTRIBUTE5 VARCHAR(255), PRIMARY KEY (workshopevent));';

      connection.query(sql_create_eventattr, (error, response) => {
        console.log(error || response);
      })

      let sql_import_eventattr = 'INSERT INTO event2attribute (WORKSHOPEVENT, DESCRIPTION, HOST, ATTRIBUTE1, ATTRIBUTE2, ATTRIBUTE3, ATTRIBUTE4, ATTRIBUTE5) VALUES ?';
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
  // TODO: FIND EVENTS THAT STUDENTS HAVE PARTICIPATED

  async function fn1_find_all_events() {
    // GET LIST OF EVENTS
    var query_eventlist = "SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME IN ('EVENTNAME') AND TABLE_SCHEMA='mydb'";
    let promise = new Promise((resolve, reject) => {
      connection.query(query_eventlist, (err, res) => {
        if (err) throw err;
        //res.json(response);
        resolve(res);
      })
    });
    var results = await promise;
    var list_of_events = [];
    for (let i = 0; i < results.length; i++) {
      list_of_events.push(results[i].TABLE_NAME)
    }
    return list_of_events;
  };

  async function fn2_getattributeskill() {
    // 2nd object
    // var event_to_attribute = [];
    // var attribute_to_skillset = [];

    var i;
    var query_event2attr = "SELECT WORKSHOPEVENT, ATTRIBUTE1, ATTRIBUTE2, ATTRIBUTE3, ATTRIBUTE4, ATTRIBUTE5 FROM EVENT2ATTRIBUTE";

    let promise1 = new Promise((resolve, reject) => {
      connection.query(query_event2attr, (err, response) => {
        if (err) throw err;
        //res.json(response);
        resolve(response);
      })
    });

    let event_to_attribute = await promise1;

    let promise2 = new Promise((resolve, reject) => {
      // 3rd object
      query_attr2skill = "SELECT ATTRIBUTE, SKILLSET1, SKILLSET2, SKILLSET3 FROM ATTRIBUTE2SKILLSET";
      connection.query(query_attr2skill, (err, response) => {
        if (err) throw err;
        resolve(response);
      });
    });
    let attribute_to_skillset = await promise2;
    var result = [event_to_attribute, attribute_to_skillset];
    return result;
  }
  var list_of_eventparticipated = [];
  fn1_find_all_events().then((res) => {

    // for (let i = 0; i < res.length; i + 0) {
    //   // var temp = fn2_geteventparticipated(studentname, res[i]);
    //   // if (temp.length) {
    //   //   list_of_eventparticipated.push(temp[0].event_name);
    //   // }
    // }
    let i = 0;
    while (i < res.length) {
      fn3_geteventparticipated(matricnumber, res[i]).then((fn3_geteventparticipated_res) => {
        if (fn3_geteventparticipated_res.length) {
          list_of_eventparticipated.push(fn3_geteventparticipated_res[0].eventname);
        }
      });
      i++;
    }
    fn4_getstudentname(matricnumber).then((studentname) => {
      fn2_getattributeskill().then((fn2_getattributeskill_res) => {

        const calculate_skillset = require('./tools/calculate_skillset');
        const result = calculate_skillset(list_of_eventparticipated, fn2_getattributeskill_res[0], fn2_getattributeskill_res[1]);
        console.log(result);

        const studentprofileAPI = {
          studentname: studentname[0].studentname,
          matricnumber: matricnumber,
          studenteventlist: {
            dynamic: "y",
            columns: ["listofeventparticipated"],
            data: []
          },
          radarchartdata: result,
        }

        for (let i = 0; i < list_of_eventparticipated.length; i++) {
          let current_event = { "listofeventparticipated": list_of_eventparticipated[i] };
          studentprofileAPI.studenteventlist.data.push(current_event);
        }

        api_res.json(studentprofileAPI);

      }).catch(error => console.log("fn2_getattributeskill error", error));
    }).catch(error => console.log("fn4_getstudentname error", error));
  }).catch(error => console.log("fn1_find_all_events error", error))


})

async function fn3_geteventparticipated(matricnumber, tablename) {
  var query_participation = "select eventname from " + tablename + " where matricnumber = '" + matricnumber + "';";

  let promise1 = new Promise((resolve, reject) => {
    connection.query(query_participation, (err, response) => {
      if (err) throw err;
      resolve(response);
    });
  });
  let eventname = await promise1;
  console.log("debug !", eventname);
  return eventname;
}

async function fn4_getstudentname(matricnumber) {
  var query_studentname = "select studentname from student_masterlist where matricnumber = '" + matricnumber + "';";

  let promise = new Promise((resolve, reject) => {
    connection.query(query_studentname, (err, response) => {
      if (err) throw err;
      resolve(response);
    });
  });
  let studentname = await promise;

  return studentname;
}

// Comparison function (eventabsentees)
async function c1_eventabsentees(eventtable) {
  var query_eventabsentees = "Select studentname, matricnumber from student_masterlist where matricnumber in (SELECT matricnumber from " + eventtable + ");";

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