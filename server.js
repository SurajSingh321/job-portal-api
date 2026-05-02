const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors({origin:"*"}));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// SECRET KEY
const SECRET = process.env.JWT_SECRET;

// Database connection
db.connect((err)=>{
    if (err){
        console.log("Database Error", err)
    }else{
        console.log("MySQL Connected")
    }
});

// ------------Middleware---------

// Token verify
function verifyToken(req,res,next){
    let token = req.headers["authorization"];
    if (!token) return res.json({message:"Token required"});
    try{
        let decoded = jwt.verify(token,SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.json({message:"Token Incorrect!"});
    }  
}

// Only access by company
function isCompany(req,res,next){
    if(req.user.role!=="company"){
        return res.json({message:"This is only for Company!"});
    }
    next();
}

// Only access by students
function isStudent(req, res, next) {
    if (req.user.role !== "student") {
        return res.json({ message: "This is only for Students!" });
    }
    next();
}

//     ----   ----- AUTH-----------

// signup
app.post("/signup", async (req, res) => {
    try {
        let { name, email, password, role } = req.body;
        let hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err) => {
                if (err) return res.json({ message: "Error!", err });
                res.json({ message: "User Created!" });
            }
        );
    } catch (error) {
        res.json({ message: "Error!", error });
    }
});

// login
app.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        db.query("SELECT * FROM users WHERE email=?", [email],
            async (err, results) => {
                if (err) return res.json({ message: "Error!", err });
                if (results.length === 0) return res.json({ message: "User not found!" });
                let user = results[0];
                let isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.json({ message: "Password Incorrect!" });
                let token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    SECRET,
                    { expiresIn: "1h" }
                );
                res.json({ message: "Login Successfully!", token, role: user.role });
            }
        );
    } catch (error) {
        res.json({ message: "Error!", error });
    }
});

// ----------JOBS------------------

// All jobs
app.get("/jobs",(req,res)=>{
    db.query("SELECT * FROM jobs",(err,results)=>{
        if(err) return res.json({message:"Error",err});
        res.json(results);
    });
});

// Job post by Company
app.post("/jobs",verifyToken,isCompany,(req,res)=>{
    let {title,company,location,salary,description}=req.body;
    db.query(
        "INSERT INTO jobs (title, company, location, salary, description, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [title, company, location, salary, description, req.user.id],
        (err)=>{
            if(err)return res.json({message:"Error",err});
            res.json({message:"Job have been posted"})
        }
    );
});

// Job update
app.put("/jobs/:id", verifyToken, isCompany, (req, res) => {
    let { title, location, salary, description } = req.body;
    db.query(
        "UPDATE jobs SET title=?, location=?, salary=?, description=? WHERE id=? AND user_id=?",
        [title, location, salary, description, req.params.id, req.user.id],
        (err) => {
            if (err) return res.json({ message: "Error!", err });
            res.json({ message: "Job update ho gayi!" });
        }
    );
});

// job delete
app.delete("/jobs/:id",verifyToken,isCompany,(req,res)=>{
    db.query(
        "DELETE FROM jobs WHERE id =? and user_id =?",
        [req.params.id,req.user.id],
        (err)=>{
            if(err) return res.json({message:"Error",err});
            res.json({message:"Job delete succesfully "});
        }
    );
});

// -------Application------------

// Job applicaiton for students
app.post("/jobs/:id/apply", verifyToken, isStudent, (req, res) => {
    db.query(
        "INSERT INTO applications (job_id, user_id) VALUES (?, ?)",
        [req.params.id, req.user.id],
        (err) => {
            if (err) return res.json({ message: "Error!", err });
            res.json({ message: "Apply Succesfully!" });
        }
    );
});

// Check applications — student
app.get("/applications", verifyToken, isStudent, (req, res) => {
    db.query(
        `SELECT applications.id, jobs.title, jobs.company, 
        jobs.location, applications.status 
        FROM applications 
        JOIN jobs ON applications.job_id = jobs.id 
        WHERE applications.user_id=?`,
        [req.user.id],
        (err, results) => {
            if (err) return res.json({ message: "Error!", err });
            res.json(results);
        }
    );
});

// Check job applicaiton - for company
app.get("/jobs/:id/applications", verifyToken, isCompany, (req, res) => {
    db.query(
        `SELECT applications.id, users.name, users.email, applications.status 
        FROM applications 
        JOIN users ON applications.user_id = users.id 
        WHERE applications.job_id=?`,
        [req.params.id],
        (err, results) => {
            if (err) return res.json({ message: "Error!", err });
            res.json(results);
        }
    );
});

app.put("/applications/:id", verifyToken, isCompany, (req, res) => {
    let { status } = req.body;  // "accepted" ya "rejected"
    db.query(
        "UPDATE applications SET status=? WHERE id=?",
        [status, req.params.id],
        (err) => {
            if (err) return res.json({ message: "Error!", err });
            res.json({ message: `Application ${status} ho gayi!` });
        }
    );
});

app.listen(process.env.PORT, () => {
    console.log("Server running");
});
