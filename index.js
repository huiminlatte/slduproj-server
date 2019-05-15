const fs = require('fs');
const mysql = require('mysql');
const csv = require('fast-csv');
 
const multer = require('multer');
const express = require('express');
 
const app = express();
 
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
    else{
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
 
const upload = multer({storage: storage});

app.get('/', (req, res)=>{
    res.send("Welcome to SLDU APP!");
    console.log(req.query);
})
app.get('/hello', function (req, res) {
    res.send('GET request to the homepage')
  })

app.get('/uploadedfiles', (res,req)=>{
    res.send("Get request");

    var sql_show_uploaded_files = 'SHOW TABLES;';
    connection.query(sql_show_uploaded_files, (err, response) =>{
         //console.log(err || response);
        response_uploaded_files = response;
        console.log(response_uploaded_files);
    })
})

// -> Express Upload RestAPIs
app.post('/api/uploadeventfile', upload.single("uploadfile"), (req, res) =>{
    importEventData2MySQL(__basedir + '/uploads/' + req.file.filename);
    res.json({
        'msg': 'File uploaded/import successfully!', 'file': req.file
      });
});

app.post('/api/uploadstudentmasterlist', upload.single("uploadfile"), (req, res) =>{
    importStudentData2MySQL(__basedir + '/uploads/' + req.file.filename);
    res.json({
          'msg': 'File uploaded/import successfully!', 'file': req.file
        });
});


// -> Import Event CSV File to MySQL database
function importEventData2MySQL(filePath){
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
            // Create a connection to the database
            // Open the MySQL connection

            var eventname = csvData[0][4].replace(/\s/g, '');

            var sql_create_eventtable = 'CREATE TABLE IF NOT EXISTS '+ eventname+' (TIMESTAMP VARCHAR(255), STUDENTNAME VARCHAR(255) NOT NULL, MATRICNO VARCHAR(9) NOT NULL, EMAILADDR VARCHAR(255) UNIQUE, EVENTNAME VARCHAR(255), EVENTPOSITION VARCHAR(255), EVENTPOSITIONTIER INT, EVENTSTARTDATE VARCHAR(255), EVENTENDDATE VARCHAR(255), PRIMARY KEY (MATRICNO))';
            connection.query(sql_create_eventtable, (error, response) =>{
                        console.log(error || response);
                    })
            let sql_import_eventdata = 'INSERT INTO '+eventname+' (TIMESTAMP, STUDENTNAME, MATRICNO, EMAILADDR, EVENTNAME, EVENTPOSITION, EVENTPOSITIONTIER, EVENTSTARTDATE, EVENTENDDATE) VALUES ?';
            connection.query(sql_import_eventdata, [csvData], (error, response) => {
                console.log(error || response);
                //console.log([csvData]);
            });
      
      // delete file after saving to MySQL database
      // -> you can comment the statement to see the uploaded CSV file.
      fs.unlinkSync(filePath)
        });
 
    stream.pipe(csvStream);
}

// -> Import Event CSV File to MySQL database
function importStudentData2MySQL(filePath){
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
            var sql_create_student_masterlist = 'CREATE TABLE IF NOT EXISTS '+'student_masterlist'+' (STUDENTNAME VARCHAR(255) NOT NULL, MATRICNO VARCHAR(9) NOT NULL, EMAILADDR VARCHAR(255) UNIQUE, PRIMARY KEY (MATRICNO))';
            connection.query(sql_create_student_masterlist, (error, response) =>{
                console.log(error || response);
            })
            let sql_import_studentdata = 'INSERT INTO student_masterlist (STUDENTNAME, MATRICNO, EMAILADDR) VALUES ?';
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
