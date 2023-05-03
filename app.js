//jhint esversion:6
// var->let->const (still modifiable)
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const date = require(__dirname + "/date.js");

const app = express();

let items = ["Buy food","Cook food","Eat food"]
let workItems = []
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser : true});

const itemSchema = new Schema({
 _id : Number,
 name:  String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
 _id : 1,
 name:"Welcome to your ToDo List!"});
const item2 = new Item({
 _id : 2,
 name:"Hit the + button to add new item."});
const item3 = new Item({
 _id :3,
 name:"<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];
var lastidx = 0
app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
        .then(function () {
          lastidx = foundItems.length
          console.log("Successfully saved defult items to DB");
          res.redirect("/");
        })
        .catch(function (err) {
          console.log(err);
        });
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
  .catch(function(err){
    console.log(err);
  });

});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const item = new Item({
    _id: lastidx,
    name: itemName
  });
  item.save();
  res.redirect("/")
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
