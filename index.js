const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require("body-parser");
const app = express();
const multer = require('multer');
const User = require("./Schema");
const csv = require('fast-csv');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require("path");
// Configurations for "body-parser"
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
//Multer Configrations
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "csv") {
        cb(null, true);
    } else {
        cb(new Error("Not a csv File!!"), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
// Multer Configration end

//MongoDB Connection
const url = process.env.MONGO_URL;
try {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
        console.log("connected"));
} catch (err) {
    console.log(err);
}

//DB connection end

app.use(express.static(`${__dirname}/public`))
app.use(express.json());

//Upload CSV API

app.post("/upload", upload.single("csv"), async (req, res) => {
    try {
        console.log(req.file);
        let data = [];
        fs.createReadStream(`${req.file.path}`)
            .pipe(csv.parse({ headers: true }))
            .on('error', error => console.error(error))
            .on('data', row => data.push(row))
            .on('end', async () => {
                for (let i = 0; i < data.length; i++) {
                    const saveData = new User({
                        id: data[i].id,
                        name: data[i].name,
                        age: data[i].age,
                        mark1: data[i].mark1,
                        mark2: data[i].mark2,
                        mark3: data[i].mark3,
                        average: data[i].average,
                        status: data[i].status
                    });

                    await saveData.save();
                }
                fs.unlinkSync(`${req.file.path}`)
            });
        res.status(200).json({
            status: "success",
            message: "File created successfully!!",
        });
    } catch (error) {
        console.log(error);
        res.json({
            error,
        });
    }


});

// Get Student Result By ID
app.get('/student/:id/result', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await User.findOne({ id: id });
        var result = data.average;
        if (result >= 60) {
            result = "1st"
        } else if (result >= 50) {
            result = "2st"
        }
        else if (result >= 30) {
            result = "3rd"
        }
        else {
            result = "fail";
        }
        if (data.length==0) {
            res.status(404).json({
                status: "404",
                message: "No record found"
            })
        } else {
            res.status(200).json({ data, result: result });
        }

    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err
        })
    }
})

// Get Student Result by Status
app.get('/student/:status', async (req, res) => {
    const { status } = req.query;
    const data = await User.find({ status: status });
    if (!data.length) {
        res.status(404).json({
            status: "404",
            message: "No record found"
        })
    }
    else {
        res.status(200).json({
            record: data
        })
    }

})



// Server Listening
app.listen(process.env.PORT || 3000, () => {
    console.log("server is start! " + process.env.PORT);
})