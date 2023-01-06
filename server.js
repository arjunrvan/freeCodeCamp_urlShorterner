var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cors = require("cors");
var dns = require("dns");
var app = express();
var router = express.Router;
// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("we're connected!");
});

//Schema n Model
var urlSchema = new mongoose.Schema({
  id: Number,
  url: String
});

var urlModel = mongoose.model("url", urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

//mycode
app.post("/api/shorturl/new", function(req, res) {
  let urlRegex = /https:\/\/www.|http:\/\/www./g;
  
  dns.lookup(req.body.url.replace(urlRegex, ""), (err, address, family) => {
    if (err) {
      res.json({"error":"invalid URL"});
    } else {
      urlModel
        .find()
        .exec()
        .then(data => {
          new urlModel({
            id: data.length + 1,
            url: req.body.url
          })
            .save()
            .then(() => {
              res.json({
                original_url: req.body.url,
                short_url: data.length + 1
              });
            })
            .catch(err => {
              res.json(err);
            });
        });
    }
  });
});

//get
app.get("/api/shorturl/:number", function(req, res) {
  urlModel
    .find({ id: req.params.number })
    .exec()
    .then(url => {
      res.redirect(url[0]["url"]);
    });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});