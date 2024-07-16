require("./db");
const express = require("express");
const app = express();
const schema = require("./csv.model");
const path = require("path");
const multer = require("multer");
const csv = require("csvtojson");
const csvParser = require("json2csv").Parser;

const port = process.env.PORT || 5000;

app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.get("/csv", (req, res) => {
    res.render("index");
});

// Import data from the CSV file into Database
app.post("/csv", upload.single("csvfile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "File not uploaded" });
        }

        if (path.extname(req.file.path).toLowerCase() !== ".csv") {
            return res.status(400).json({ success: false, message: "Please upload a CSV file" });
        }

        const data = [];
        const response = await csv().fromFile(req.file.path);

        // Below commented code use for import particular fields
        // for (let i = 0; i < response.length; i++) {
        //     data.push({
        //         username: response[i].name,
        //         password: response[i].pass,
        //         mobile: response[i].mobile,
        //     });
        // }
        await schema.insertMany(response);

        res.status(200).json({ success: true, message: "CSV Imported", payload: { response } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Download the CSV file from the database
app.get("/exportData", async (req, res) => {
    try {
        const users = [];

        var userData = await schema.find({});
        userData.forEach((user) => {
            const { username, password, mobile } = user;
            users.push({ username, password, mobile });
        });

        // Fix the fields of the CSV file
        const csvField = ["name", "pass", "phone"];
        const csvparser = new csvParser({ csvField });
        const csvData = csvparser.parse(users);

        // Set the Header to download the CSV file
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment: filename=userData.csv");

        res.status(200).json({ success: true, message: "Downloaded" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(port, (req, res) => {
    console.log(`PORT : ${port} 🖥️ 🚀`);
});
