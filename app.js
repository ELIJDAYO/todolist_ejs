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

const listSchema = new Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

var lastidx = 0
app.get("/", function(req, res) {
  // find all, return list of documents
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
app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName})
    .then(function (foundList) {
      if(!foundList){
        // console.log("Add new list");
        const list = new List({
          name: customListName,
          items: defaultItems
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
  const item = new Item({
    _id: lastidx,
    name: itemName
  });
  item.save();
  res.redirect("/")
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId)
    .then(function () {
      console.log("Deleted successfully");
      res.redirect("/")
    })
    .catch(function (err) {
      console.log(err);
    });
})
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
