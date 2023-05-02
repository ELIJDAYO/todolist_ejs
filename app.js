//jhint esversion:6
// var->let->const (still modifiable)
const express = require("express");
const bodyParser = require("body-parser");

const date = require(__dirname + "/date.js");

const app = express();

let items = ["Buy food","Cook food","Eat food"]
let workItems = []
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
// when only one fun
  // let day = date();
// when multiple fun
  let day = date.getDay();
  res.render("list", {
    listTitle: day,
    newListItems: items
  });
});

app.post("/",function(req,res){
  let item = req.body.newItem;
  // to check whats posted
    console.log(req.body);
  if(req.body.list === "Work List"){
    workItems.push(item);
    res.redirect("/work");
  }else{
    items.push(item);
    res.redirect("/");
  }
  // console.log(item);

});

app.get("/work", function(req,res){
  res.render("list",{listTitle: "Work List", newListItems: workItems});
});
app.get("/about", function(req,res){
  res.render("about")
});

app.post("/work", function(req,res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function() {
  console.log("Server on port 3000")
})
