// ***** *** Require Packages: *** *****
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// *** Create a New Database inside MongoDB via Connecting mongoose: ***
 mongoose.connect("mongodb+srv://admin-afsara:afsara123@cluster0.xb9pwec.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); // ==> use this if deprect a warning 
 
// *** Create a Schema: ***
const itemsSchema = {
  name: String
};
 
const Item = mongoose.model("Item", itemsSchema);
 

const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
 
    if (foundItems.length === 0) {
    
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to databse.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });
});
 
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name: customListName}, function(err, foundList){
 
    if (!err) {
      if (!foundList) {
        
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save(function()
        {
          res.redirect("/" + customListName);
        });
      }
      else {
       
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
 
  });
  
});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today"){ 
    item.save();
    
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save(function()
        {
          res.redirect("/" + listName);
        }
      );
    });
  }
});
 
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName.trim();
 
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
 
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
