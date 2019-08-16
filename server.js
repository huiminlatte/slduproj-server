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
  }
  else {
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
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send("Welcome to SLDU APP!");
  console.log(req.query);
})

// -> Express Upload RestAPIs
app.post('/api/uploadeventfile', upload.single("uploadfile"), (req, res) => {
  // checkiftableexists(req.fi);

  importEventData2MySQL(__basedir + '/uploads/' + req.file.filename, req.file.originalname);
  res.json({
    'msg': 'File uploaded successfully!', 'file': req.file
  });

});

app.post('/api/uploadstudentmasterlist', upload.single("uploadfile"), (req, res) => {
  importStudentData2MySQL(__basedir + '/uploads/' + req.file.filename);
  res.json({
    'msg': 'File uploaded/import successfully!', 'file': req.file
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
    }
    else {

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
    }
    else {
      var apiResult = {};
      apiResult = {
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
    }
    else {
      query = query + " where ";
    }
    query = query + "studentname LIKE '%" + studentname + "%'";

  }
  else if (tier) {
    if (matricnumber || studentname) {
      query = query + " and ";
    }
    else {
      query = query + " where ";
    }
    query = query + "tier=" + tier;
  }
  if (sortname) {
    query = query + " ORDER BY STUDENTNAME";
  }
  else if (sortmatricnumber) {
    query = query + " ORDER BY MATRICNUMBER";
  }
  else if (sortemail) {
    query = query + " ORDER BY NTUEMAILADDRESS";
  }

  console.log(query);
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
  }
  else {
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
    }
    else if (sortpositiontier) {
      query = query + " ORDER BY EVENTPOSITIONTIER";
    }

    executeQueryShowTable(query, res);

  }
  else {
    var query = "SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME IN ('EVENTNAME') AND TABLE_SCHEMA='mydb'";
    executeQuery(query, res);
    //TODO: calculate number of events 
  }
});

app.get("/api/eventparticipation", function (req, res) {
  var eventname = req.query.eventname;

  var query = "SELECT COUNT(*) FROM " + eventname; //Not unique Matric Number
  executeQuery(query, res);
});

app.get("/api/numberofstudents", function (req, res) {
  var student_list = req.query.listname;

  var query = "SELECT COUNT(*) FROM " + student_list; //Not unique Matric Number
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
    }

    else {
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
      console.log(file);
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
        }
        else {
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



// Create a Server
let server = app.listen(8080, function () {

  let host = server.address().address
  let port = server.address().port

  console.log("App listening at http://%s:%s", host, port)

})  
