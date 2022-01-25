//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Welcome:Welcome@cluster0.8vhpd.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);

const food = new Item({
  name: "Food"
});

const clothes = new Item({
  name: "Clothes"
});

const cleaning = new Item({
  name: "Cleaning"
});

const defaultItems = [food, clothes, cleaning];

const listSchema = {
  name:String,
  items: [itemSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Succesfully added");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err)
      console.log("Couldn't Delete");
      else
      console.log("Succesfully Deleted");
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //console.log("Doesn't Exist");
        //Create a new list
        const list = new List({
          name: customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //Show an exixting list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
