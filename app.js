//jhint esversion:6
// var->let->const (still modifiable)
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bson = require("bson");
const _ = require("lodash");
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
 _id : String,
 name:  String
});

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
 _id : new bson.ObjectId().toString(),
 name:"Welcome to your ToDo List!"});
const item2 = new Item({
 _id :  new bson.ObjectId().toString(),
 name:"Hit the + button to add new item."});
const item3 = new Item({
 _id :  new bson.ObjectId().toString(),
 name:"<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

const listSchema = new Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // find all, return list of documents
  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
        .then(function () {
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
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
    .then(function (foundList) {
      if(!foundList){
        console.log("Add new list?");
        const list = new List({
          name: customListName,
          items: defaultItems,
          index: {
          unique: true,
          dropDups: true
        }
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        // console.log("Already existing list");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
      // res.redirect("/");
    })
    .catch(function (err) {
      console.log(err);
    });

});
app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    _id:  new bson.ObjectId().toString(),
    name: itemName,
    index: {
    unique: true,
    dropDups: true
  }
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName})
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Deleted successfully");
        res.redirect("/")
      })
      .catch(function (err) {
        console.log(err);
      });
      // if its customlist name
  }else{
    // use this instead of using js fun loop and filter
    List.findOneAndUpdate({name: listName}, {$pull: {
        "items" : {
          _id: checkedItemId
        }
      }
    })
    .then(function () {
      res.redirect("/" + listName)
    })
    .catch(function (err) {
      console.log(err);
    });
  }
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
