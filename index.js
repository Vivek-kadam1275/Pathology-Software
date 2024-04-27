import express from "express";
import bodyParser from 'body-parser'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from "pg";  // Import postgre 
import bcrypt from "bcrypt"; // Import bcrypt.
// import EJS_INCLUDE_REGEX from 'ejs-include-regex';

import ejs from "ejs";

import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { pid } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));

var app = express();
var port = 3000;
var hgb, wbc, neutrophils, lympocytes, eosinophils, monocytes, esr, rbc, hct, mcv, mch, mchc, sd, cv;
var Patientname;
var Phoneno, date, Age, Gender, doctor;
var PathName;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize express-session middleware
app.use(
    session({
        secret: "TOPSECRETWORD",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,               // it is in miliseconds.
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Pathology",
    password: "Vivek1709",
    port: 5432,
})

db.connect();

app.get('/', (req, res) => { res.sendFile(__dirname + '/public/index.html') });

app.post('/register', async (req, res) => {
    const pathName = req.body.pathology_name;
    const techName=req.body.technician_name;
    const degree=req.body.degree;
    const mobile=req.body.mobile;
    const address=req.body.address;
    const email = req.body.email;
    const password = req.body.password;
    const saltRounds = 10;
    const checkResult = await db.query("SELECT * FROM technicians WHERE email=$1", [email,]);
    console.log(checkResult);
    try {
        if (checkResult.rowCount > 0) {
            res.send("Email already exists!!!");
            res.redirect('/');
        }
        else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                const insert = await db.query("INSERT INTO technicians(pathname,techname,degree,mobile,address,email,password) values ($1,$2,$3,$4,$5,$6,$7) RETURNING *", [pathName,techName,degree,mobile,address, email, hash]);
                console.log(insert);
                const user = insert.rows[0];

                req.login(user, (err) => {
                    console.log("success");
                    res.redirect("/home");
                });

            })
        }
    }
    catch (err) {
        console.log(err);
    }

})

app.get('/home', (req, res) => {

    if (req.isAuthenticated()) {
         
        const labname = req.user.pathname;
        res.render("home.ejs", { labname: labname });
    }
    else {
        res.redirect('/');
    }
})
app.post('/login', passport.authenticate("local", {
    successRedirect: '/home',
    failureRedirect: '/',
}))

app.get('/entry',async (req, res) => {
    const userid=req.user.id;
    const result=await db.query("SELECT name,degree FROM doctors WHERE userid=$1",[userid,]);
     var doctors=result.rows;
    var doctorName=[];        // array for storing doctor's name.
    //   var doctorDegree=[];      // array for storing doctor's degree.
     
    
    for(var i=0;i<result.rowCount;i++){
        doctorName[i]=doctors[i].name;
        // doctorDegree[i]=doctors[i].degree;
    }
    res.render('entry.ejs',{name:doctorName});
});

app.post('/report', async (req, res) => {
    // console.log(req.body);
    const pathologyName=req.user.pathname;
    const title=req.body['title'];
    const patientName=req.body['Patientname'];
    const mobile=req.body['Phoneno'];
    const date=req.body['date'];
    const gender=req.body['gender'];
    const doctor=req.body['Refdr'];
    const age=req.body['Age'];
    const userid=req.user.id;
    const techName=req.user.techname;
    const degree=req.user.degree;
    const Tmobile=req.user.mobile;
    const address=req.user.address;
    
    try{
    const insertPatient=await db.query("INSERT INTO patients(contraction,name,mobile,dates,gender,doctor,age,userid) values($1,$2,$3,$4,$5,$6,$7,$8)",[title,patientName,mobile,date,gender,doctor,age,userid])

    }catch(err){
        console.log("Error"+err);
    }
    res.render('report.ejs', {
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
        title: title,
        Patientname: patientName,
        Phoneno: mobile,
        date: date,
        Gender: gender,
        Age: age,
        doctor: doctor,
        hgb: req.body['hgb'],
        wbc: req.body['wbc'],
        neutrophils: req.body['neutrophils'],
        lympocytes: req.body['lympocytes'],
        eosinophils: req.body['eosinophils'],
        monocytes: req.body['monocytes'],
        esr: req.body['esr'],
        rbc: req.body['rbc'],
        hct: req.body['hct'],
        mcv: req.body['mcv'],
        mch: req.body['mch'],
        mchc: req.body['mchc'],
        sd: req.body['sd'],
        cv: req.body['cv'],
    });
})
        // page for adding doctor to database.
app.get("/doctorEntry",(req,res)=>{
    // console.log(req.user.name);
       res.render('adddoctor.ejs');
}); 

app.get("/viewTests",async (req,res)=>{
     
    const result=await db.query("SELECT name,price FROM tests");
   
    const tests=result.rows;  // all the rows inside that table.
    var testName=[];        // array for storing test name.
    var testPrice=[];      // array for storing test price.
    
  
  for(var i=0;i<result.rowCount;i++){
      testName[i]=tests[i].name;
      testPrice[i]=tests[i].price;
  }
    res.render('tests.ejs',{name:testName,price:testPrice});
});

app.post("/addDoctor",async (req,res)=>{
      const doctor_name=req.body.doctor;
      const doctor_degree=req.body.degree;
      const userid=req.user.id;
      try{
        const entry=await db.query("INSERT INTO doctors(name,degree,userid) VALUES($1,$2,$3)",[doctor_name,doctor_degree,userid]);
        res.redirect("/doctorEntry");
      }catch(err){
        console.log(err);
      }
}); 
 

app.get('/viewDoctors',async (req,res)=>{
      const userid=req.user.id;
      const result=await db.query("SELECT name,degree FROM doctors WHERE userid=$1",[userid,]);
     
      const doctors=result.rows;  // all the rows inside that table.
      var doctorName=[];        // array for storing doctor's name.
      var doctorDegree=[];      // array for storing doctor's degree.
      
    
    for(var i=0;i<result.rowCount;i++){
        doctorName[i]=doctors[i].name;
        doctorDegree[i]=doctors[i].degree;
    }
      res.render('viewDoctors.ejs',{name:doctorName,degree:doctorDegree});
});

app.get('/test',async (req,res)=>{
    try {
        const result = await db.query('SELECT name FROM tests');
        const testNames = result.rows.map(row => row.name);
        // const testPrices=result.rows.map(row =>{row.price});
        res.json(testNames);
 
      } catch (err) {
        console.error('Error fetching test names from database: ', err);
        res.status(500).send('Internal Server Error');
      }
})

app.get('/price',async (req,res)=>{
    try {
        const result = await db.query('SELECT price FROM tests');
        const priceNames = result.rows.map(row => row.price);
        res.json(priceNames);
 
      } catch (err) {
        console.error('Error fetching test names from database: ', err);
        res.status(500).send('Internal Server Error');
      }
})
 
app.get('/bill',(req,res)=>{
    const pathologyName=req.user.pathname;
    const techName=req.user.techname;
    const degree=req.user.degree;
    const Tmobile=req.user.mobile;
    const address=req.user.address;
    console.log(pathologyName,techName,degree,Tmobile,address);
    
    res.render('bill.ejs',{
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
    });
});

app.post('/patientDetialsSubmit',async (req,res)=>{
    const title=req.body['title'];
    const patientName=req.body['Patientname'];
    const mobile=req.body['Phoneno'];
    const date=req.body['date'];
    const gender=req.body['gender'];
    const doctor=req.body['Refdr'];
    const age=req.body['Age'];
    const userid=req.user.id;

    try {
        const insertPatient = await db.query("INSERT INTO patients(contraction,name,mobile,dates,gender,doctor,age,userid) values($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [title, patientName, mobile, date, gender, doctor, age, userid])
        var pid=insertPatient.rows[0].id;
        // insertPatient=insertPatient.rows[0];
        // var pid=insertPatient.id;
         
        
    } catch (err) {
        console.log("Error" + err);
    }
    const cname=req.body['cbc'];
    const wname=req.body['widal'];
    const uname=req.body['urine'];

    const hgb=req.body['hgb'];
    const wbc=req.body['wbc'];
    const neutrophils=req.body['neutrophils'];
    const lympocytes=req.body['lympocytes'];
    const eosinophils=req.body['eosinophils'];
    const monocytes=req.body['monocytes'];
    const esr=req.body['esr'];
    const rbc=req.body['rbc'];
    const hct=req.body['hct'];
    const mcv=req.body['mcv'];
    const mch=req.body['mch'];
    const mchc=req.body['mchc'];
    const sd=req.body['sd'];
    const cv=req.body['cv'];
    
    const o=req.body.o;
    const h=req.body.h;
    const bh=req.body.bh;
    const ah=req.body.ah;
    const widaltest=req.body.widaltest;

    const quantity=req.body.quantity;
    const colour=req.body.colour;
    const appearance=req.body.appearance;
    const ph=req.body.ph;
    const diposit=req.body.diposit;
    const specificgravity=req.body.specificgravity;

    var tests=[];

    if(cname !== undefined){
        const insertTestName = await db.query("INSERT INTO patienttests(tname,pid) values($1,$2)", [cname,pid]);
        var insertCbcReport = await db.query("INSERT INTO cbc(tname,pid,hgb,wbc,neutrophils,lympocytes,eosinophils,monocytes,esr,rbc,hct,mcv,mch,mchc,sd,cv) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",[cname,pid,hgb,wbc,neutrophils,lympocytes,eosinophils,monocytes,esr,rbc,hct,mcv,mch,mchc,sd,cv])
        tests.push(cname);
    }
    if(wname !== undefined){
        const insertTestName = await db.query("INSERT INTO patienttests(tname,pid) values($1,$2)", [wname,pid]);
        var insertWidalReport = await db.query("INSERT INTO widal(tname,pid,o,h,ah,bh,widaltest) VALUES($1,$2,$3,$4,$5,$6,$7)",[wname,pid,o,h,ah,bh,widaltest])

        tests.push(wname);
    }
    if(uname !== undefined){
        const insertTestName = await db.query("INSERT INTO patienttests(tname,pid) values($1,$2)", [uname,pid]);
        var insertUrineReport = await db.query("INSERT INTO urine(tname,pid,quantity,colour,appearance,ph,diposit,specificgravity) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[uname,pid,quantity,colour,appearance,ph,diposit,specificgravity]);

        tests.push(uname);
    }
    res.render('report1.ejs',{
          id:pid,  
          contraction: title,
          name:patientName,
          mobile:mobile,
          dates:date,
          gender: gender,
          doctor: doctor,
          age:age,
          array:tests,

    });
    

});

app.post('/CBC',async (req,res)=>{
     const pid=req.body.pid;
     const cname=req.body.tname;
    //  const techid=req.user.id;

     const pathologyName=req.user.pathname;
     const techName=req.user.techname;
     const degree=req.user.degree;
     const Tmobile=req.user.mobile;
     const address=req.user.address;

     var patient= await db.query('SELECT * FROM patients WHERE id=$1',[pid]);
     patient=patient.rows[0];

     const title=patient.contraction;
     const patientName=patient.name;
    const mobile=patient.mobile;
     var date= patient.dates;
     date = new Date(date).toLocaleDateString('en-GB');
     const gender=patient.gender;
     const doctor=patient.doctor;
     const age=patient.age;

     var cbc=await db.query("SELECT * FROM cbc WHERE tname=$1 and pid=$2",[cname,pid]);
     cbc=cbc.rows[0];

     const hgb= cbc.hgb;
     const wbc=cbc.wbc;
     const neutrophils=cbc.neutrophils;
     const lympocytes=cbc.lympocytes;
     const eosinophils=cbc.eosinophils;
     const monocytes=cbc.monocytes;
     const esr=cbc.esr;
     const rbc=cbc.rbc;
     const hct=cbc.hct;
     const mcv=cbc.mcv;
     const mch=cbc.mch;
     const mchc=cbc.mchc;
     const sd=cbc.sd;
     const cv=cbc.cv;
     res.render('cbc.ejs',{
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
        title: title,
        Patientname: patientName,
        Phoneno: mobile,
        date: date,
        Gender: gender,
        Age: age,
        doctor: doctor,
        hgb: hgb,
        wbc: wbc,
        neutrophils: neutrophils,
        lympocytes: lympocytes,
        eosinophils: eosinophils,
        monocytes: monocytes,
        esr: esr,
        rbc: rbc,
        hct: hct,
        mcv: mcv,
        mch: mch,
        mchc: mchc,
        sd: sd,
        cv: cv,
     })

     
    });
app.post('/WIDAL',async (req,res)=>{
    const pid=req.body.pid;
    const wname=req.body.tname;
    console.log(pid,wname);
    
    

    const pathologyName=req.user.pathname;
    const techName=req.user.techname;
    const degree=req.user.degree;
    const Tmobile=req.user.mobile;
    const address=req.user.address;

    var patient= await db.query('SELECT * FROM patients WHERE id=$1',[pid]);
     patient=patient.rows[0];

     const title=patient.contraction;
     const patientName=patient.name;
    const mobile=patient.mobile;
    var date= patient.dates;
    date = new Date(date).toLocaleDateString('en-GB');
     const gender=patient.gender;
     const doctor=patient.doctor;
     const age=patient.age;

    var widal=await db.query('SELECT * FROM widal WHERE pid=$1 and tname=$2',[pid,wname]);
    // console.log(widal.rowCount)
    widal=widal.rows[0];

    //  console.log(widal);
     const o=widal.o;
     const h=widal.h;
     const ah=widal.ah;
     const bh=widal.bh;
     const widaltest=widal.widaltest;


      res.render('widal.ejs',{
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
        title: title,
        Patientname: patientName,
        Phoneno: mobile,
        date: date,
        Gender: gender,
        Age: age,
        doctor: doctor,
        o:o,
        h:h,
        ah:ah,
        bh:bh,
        widaltest:widaltest
       
      });
});

app.post('/URINE',async (req,res)=>{
    const pid=req.body.pid;
    const uname=req.body.tname;
    console.log(pid,uname);
    
    

    const pathologyName=req.user.pathname;
    const techName=req.user.techname;
    const degree=req.user.degree;
    const Tmobile=req.user.mobile;
    const address=req.user.address;

    var patient= await db.query('SELECT * FROM patients WHERE id=$1',[pid]);
     patient=patient.rows[0];

     const title=patient.contraction;
     const patientName=patient.name;
    const mobile=patient.mobile;
    var date= patient.dates;
    date = new Date(date).toLocaleDateString('en-GB');
     const gender=patient.gender;
     const doctor=patient.doctor;
     const age=patient.age;

    var urine=await db.query('SELECT * FROM urine WHERE pid=$1 and tname=$2',[pid,uname]);
    urine=urine.rows[0];
    
    const quantity=urine.quantity;
    const colour=urine.colour;
    const appearance =urine.appearance;
    const ph=urine.ph;
    const diposit=urine.diposit;
    const specificgravity=urine.specificgravity;   


      res.render('urine.ejs',{
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
        title: title,
        Patientname: patientName,
        Phoneno: mobile,
        date: date,
        Gender: gender,
        Age: age,
        doctor: doctor,
        quantity:quantity,
        colour:colour,
        appearance:appearance,
        ph:ph,
        diposit:diposit,
        specificgravity:specificgravity
       
      });

     
})

app.get('/history',async (req,res)=>{
    var userid=req.user.id;
    var result =await db.query('SELECT * FROM patienttests,patients WHERE patienttests.pid=patients.id AND userid=$1',[userid]);
    const size=result.rowCount; 
    result=result.rows;
    // console.log(result);
    // console.log(size);
     res.render('history.ejs',{
            arra: result, 
            size: size,
    });
})

app.get('/reports',async (req,res)=>{
    res.render('manually.ejs');
})
app.post('/print',async (req,res)=>{
     const pid=req.body.pid;
     var tname=req.body.tname;
     var techid=req.user.id;
     if(tname==="CBC"){
        
        const cname=tname;
        
   
        const pathologyName=req.user.pathname;
        const techName=req.user.techname;
        const degree=req.user.degree;
        const Tmobile=req.user.mobile;
        const address=req.user.address;
   
        var patient= await db.query('SELECT * FROM patients WHERE id=$1 AND userid=$2',[pid,techid]);
        patient=patient.rows[0];
   
        const title=patient.contraction;
        const patientName=patient.name;
       const mobile=patient.mobile;
        var date= patient.dates;
        date = new Date(date).toLocaleDateString('en-GB');
        const gender=patient.gender;
        const doctor=patient.doctor;
        const age=patient.age;
   
        var cbc=await db.query("SELECT * FROM cbc WHERE tname=$1 and pid=$2",[cname,pid]);
        cbc=cbc.rows[0];
   
        const hgb= cbc.hgb;
        const wbc=cbc.wbc;
        const neutrophils=cbc.neutrophils;
        const lympocytes=cbc.lympocytes;
        const eosinophils=cbc.eosinophils;
        const monocytes=cbc.monocytes;
        const esr=cbc.esr;
        const rbc=cbc.rbc;
        const hct=cbc.hct;
        const mcv=cbc.mcv;
        const mch=cbc.mch;
        const mchc=cbc.mchc;
        const sd=cbc.sd;
        const cv=cbc.cv;
        res.render('cbc.ejs',{
           PathologyName: pathologyName,
           NameOfTechnician:techName,
           Degree:degree,
           Mobile:Tmobile,
           Address:address,
           title: title,
           Patientname: patientName,
           Phoneno: mobile,
           date: date,
           Gender: gender,
           Age: age,
           doctor: doctor,
           hgb: hgb,
           wbc: wbc,
           neutrophils: neutrophils,
           lympocytes: lympocytes,
           eosinophils: eosinophils,
           monocytes: monocytes,
           esr: esr,
           rbc: rbc,
           hct: hct,
           mcv: mcv,
           mch: mch,
           mchc: mchc,
           sd: sd,
           cv: cv,
        })
         
     }
     else if(tname==="WIDAL"){
        // const pid=req.body.pid;
    const wname=tname;
    console.log(pid,wname);
    
    

    const pathologyName=req.user.pathname;
    const techName=req.user.techname;
    const degree=req.user.degree;
    const Tmobile=req.user.mobile;
    const address=req.user.address;

    var patient= await db.query('SELECT * FROM patients WHERE id=$1 AND userid=$2',[pid,techid]);
     patient=patient.rows[0];

     const title=patient.contraction;
     const patientName=patient.name;
    const mobile=patient.mobile;
    var date= patient.dates;
    date = new Date(date).toLocaleDateString('en-GB');
     const gender=patient.gender;
     const doctor=patient.doctor;
     const age=patient.age;

    var widal=await db.query('SELECT * FROM widal WHERE pid=$1 and tname=$2',[pid,wname]);
    // console.log(widal.rowCount)
    widal=widal.rows[0];

    //  console.log(widal);
     const o=widal.o;
     const h=widal.h;
     const ah=widal.ah;
     const bh=widal.bh;
     const widaltest=widal.widaltest;


      res.render('widal.ejs',{
        PathologyName: pathologyName,
        NameOfTechnician:techName,
        Degree:degree,
        Mobile:Tmobile,
        Address:address,
        title: title,
        Patientname: patientName,
        Phoneno: mobile,
        date: date,
        Gender: gender,
        Age: age,
        doctor: doctor,
        o:o,
        h:h,
        ah:ah,
        bh:bh,
        widaltest:widaltest
       
      });
     }
     else if(tname==="URINE"){
         
        const uname=tname;
        console.log(pid,uname);
        
        
    
        const pathologyName=req.user.pathname;
        const techName=req.user.techname;
        const degree=req.user.degree;
        const Tmobile=req.user.mobile;
        const address=req.user.address;
    
        var patient= await db.query('SELECT * FROM patients WHERE id=$1 AND userid=$2',[pid,techid]);
         patient=patient.rows[0];
    
         const title=patient.contraction;
         const patientName=patient.name;
        const mobile=patient.mobile;
        var date= patient.dates;
        date = new Date(date).toLocaleDateString('en-GB');
         const gender=patient.gender;
         const doctor=patient.doctor;
         const age=patient.age;
    
        var urine=await db.query('SELECT * FROM urine WHERE pid=$1 and tname=$2',[pid,uname]);
        urine=urine.rows[0];
        
        const quantity=urine.quantity;
        const colour=urine.colour;
        const appearance =urine.appearance;
        const ph=urine.ph;
        const diposit=urine.diposit;
        const specificgravity=urine.specificgravity;   
    
    
          res.render('urine.ejs',{
            PathologyName: pathologyName,
            NameOfTechnician:techName,
            Degree:degree,
            Mobile:Tmobile,
            Address:address,
            title: title,
            Patientname: patientName,
            Phoneno: mobile,
            date: date,
            Gender: gender,
            Age: age,
            doctor: doctor,
            quantity:quantity,
            colour:colour,
            appearance:appearance,
            ph:ph,
            diposit:diposit,
            specificgravity:specificgravity
           
          });
     }
});

passport.use(new Strategy(async function verify(username, password, cb) {
    try {
        const login = await db.query("SELECT * FROM technicians WHERE technicians.email=$1 ", [username]);
        // console.log(login);
        // console.log(login.rows); // This gives all the rows of result
        console.log(login.rowCount); //This gives total numbers of rows in result.
        if (login.rowCount > 0) {
            const user = login.rows[0];
            const storedHashedPassword = user.password;
            const storedLabName = user.name;

            bcrypt.compare(password, storedHashedPassword, (err, result) => {
                // console.log(result);// true or false
                if (err) {
                    return cb(err);
                }
                else {
                    if (result) {
                         // res.render('home.ejs', { labname: storedLabName });
                        return cb(null, user);
                    }
                    else {
                        // res.send("wrong email and password!!!")
                        return cb(null, false);
                    }
                }
            });


        }
        else {
            return cb("user not found")
        }

    }
    catch (err) {
        console.log(err);
    }
}));

// This below is used for storing the user info at local storage of client side for session

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => { console.log(`port is created at ${port}`) });







