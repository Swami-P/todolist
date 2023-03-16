const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb://dbUser:Test123@ac-b0xqq5h-shard-00-00.1wana2q.mongodb.net:27017,ac-b0xqq5h-shard-00-01.1wana2q.mongodb.net:27017,ac-b0xqq5h-shard-00-02.1wana2q.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-106sq5-shard-0&authSource=admin&retryWrites=true&w=majority");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({name: "Interview follow up"});
const item2 = new Item ({name: "Check hiring pipeline"});
const item3 = new Item ({name: "Update DBSS Tracker"});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("defaultItems inserted");
        }
      });
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({name: itemName});

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const item_id = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(item_id, function(err){
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: item_id}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List ({
          name: customListName,
          // items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on the port 3000.");
});
