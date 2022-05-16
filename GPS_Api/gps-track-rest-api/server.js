const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const env = require('dotenv').config();
const mysql = require('mysql');
var cors = require('cors');

//dotenv for secure login data: https://www.npmjs.com/package/dotenv

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DB,
    timezone: 'utc'
});

con.connect((error) => {
    if(!error){
        console.log("Database connected");
    } else {
        console.log(error);
    }
})

app.get("/", (req, res) => {
    res.status(200).json({ response: "FleetManager API service! Please use authentication in further routes to access data" });
});

app.listen(4001, () => {
    console.log("Server running on http://localhost:4001/ !");
});

// AUTHENTICATE admin with credentials, send api token back
app.get('/auth', (req, res) => {
    let headers = req.headers;
    con.query("SELECT * from admin WHERE username = ?", [headers.username], (error, rows) => {
        if(!error){
            if(rows.length > 0){
                if(rows[0].username === headers.username && rows[0].password === headers.password){
                    console.log('User %s logged in with valid credentials. Sending api token..', rows[0].username);
                    res.status(200).json({ "message": "Authentication successful, use token for further authentication", "token": process.env.API_KEY_GET });
                    return;
                }
            }
            res.status(403).json("Invalid credentials");
            console.log('User made request with invalid credentials. Rejected!');
        } else {
            res.status(403).json("An error ocurred!");
        }
    });
});

// REGISTER new user
app.post('/register', (req, res) => {
    const imei = req.body.imei;
    const name = req.body.name;

    const userquery = "SELECT * FROM users WHERE imei = ?";
    con.query(userquery,[imei],(error, rows) => {
        if(!error) {
            if(rows.length > 0){
                res.status(409).json("IMEI already registered");
                console.log("User with IMEI %s tried to register, but already in DB", imei);
            } else {
                const insertuser = "INSERT INTO users (`imei`, `name`) VALUES (?, ?)";
                con.query(insertuser,[imei, name],(error) => {
                    if(!error){
                        res.status(200).json({ "message": "Registered successfully!" });
                        console.log("User with IMEI %s registered in DB, welcome %s!", imei, name);
                    } else {
                        res.status(400).json("Error with processing the data");
                    }
                });
            }
        }
    });
});

// POST new dataset
app.post('/post', async (req, res) => {
    const body = req.body;
    const userquery = "SELECT * FROM users WHERE imei = ?";
    con.query(userquery, [body.imei], (error, rows) => {
        if (!error) {
            if (rows.length > 0) {
                let uid = rows[0].id;
                const insert = "INSERT INTO data (`id`, `latitude`, `longitude`) VALUES (?, ?, ?)";
                con.query(insert, [uid, body.latitude, body.longitude], (error) => {
                    if (error) throw error;
                });
                return res.status(200).json("Data received");
            } else {
                res.status(403).json("IMEI not registered");
            }
        }
    });
});

//Fetch current datasets of all senders
app.get('/current', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT * FROM `data` where (id, timestamp) in ( select id, max(timestamp) from data group by id )";
        con.query(query, (error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }

});

//Fetch current dataset by id
app.get('/current/:id', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT * FROM `data` where (id, timestamp) in ( select id, max(timestamp) from data group by id ) and id = ?";
        con.query(query,[req.params.id],(error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});


//Fetch all datasets of all senders
app.get('/history', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT * FROM data";
        con.query(query, (error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//Fetch all datasets by id
app.get('/history/:id', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT * FROM data WHERE id = ?";
        con.query(query,[req.params.id],(error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//Get users
app.get('/users', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT users.id, users.imei, users.name, users.zone, 0 as datasets from users, data where users.id NOT IN (SELECT id from data) GROUP BY users.id " +
            "UNION " +
            "SELECT users.id, users.imei, users.name, users.zone, count(data.id) as datasets from users, data where users.id = data.id GROUP BY users.id";
        con.query(query,(error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//Update userdata
app.put('/users/:id', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const body = req.body;
        const query = "UPDATE `users` SET `imei` = ?, `name` = ?, `zone` = ? WHERE `id` = ?";
        con.query(query, [body.imei, body.name, body.zone, req.params.id], (error) => {
            if(!error){
                res.status(200).json('updated successfully');
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }

});

//Delete user
app.delete('/users/:id', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "DELETE FROM users WHERE users.id = ?";
        con.query(query, [req.params.id], (error) => {
            if(!error){
                res.status(200).json('deleted successfully');
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }

});

//Delete history of all clients
app.delete('/reset', (req, res) => {

    if(req.headers.token === process.env.API_KEY_GET){
        const query = "DELETE FROM data";
        con.query(query, (error) => {
            if(error){
                res.json(error);
            } else {
                res.status(200).json("deleted successfully");
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//Delete history of client by id
app.delete('/reset/:id', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "DELETE FROM data WHERE id = ?";
        con.query(query, [req.params.id], (error) => {
            if(error){
                res.json(error);
            } else {
                res.status(200).json("deleted successfully");
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }

});

// add new zone
app.post('/zone', async (req, res) => {
    const body = req.body;
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "INSERT INTO `zone` (`name`, `latitude`, `longitude`, `radius`) VALUES (?, ?, ?, ?)";
        con.query(query, [body.name, body.latitude, body.longitude, body.radius], (error) => {
            if(!error){
                res.status(200).json("Added zone");
            } else {
                if(error.code === "ER_DUP_ENTRY"){
                    const query = "UPDATE `zone` SET `latitude` = ?, `longitude` = ?, `radius` = ?  WHERE `name` = ?";
                    con.query(query, [body.latitude, body.longitude, body.radius, body.name], (error) => {
                        if(!error){
                            res.status(200).json("Updated zone");
                        } else {
                            res.status(400).json("Error");
                        }
                    });
                } else {
                    res.status(400).json("Error");
                }
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//delete a zone
app.delete('/zone', async (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "DELETE from `zone` WHERE name = ?";
        con.query(query, [req.headers.name], (error, rows) => {
            if(!error && rows.affectedRows > 0){
                res.status(200).json("Removed zone");
            } else {
                res.status(400).json("Could not remove zone");
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }
});

//Get all defined zones
app.get('/zones', (req, res) => {
    if(req.headers.token === process.env.API_KEY_GET){
        const query = "SELECT * FROM `zone`";
        con.query(query, (error, rows) => {
            if(!error){
                res.status(200).json(rows);
            } else {
                res.json(error);
            }
        });
    } else {
        res.status(401).json("Unauthorized");
    }

});





