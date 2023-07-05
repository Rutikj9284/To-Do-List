//jshint esvesrion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash");
const mongoose = require("mongoose");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-rutik:Rutik@cluster0.8c42y5z.mongodb.net/todolistDB',
{useNewUrlParser: true,
useUnifiedTopology:true
})
.then(()=>{
console.log("CONNECTION OK")
})
.catch(err=>{
console.log("CONNECTION IS BAD")
console.log(err)
});

const itemsSchema = ({
  name : String
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your To Do List!"
});

const item2 = new Item({
  name : "Hit + to add new task"
});

const item3 = new Item({
  name : "<-- Hit this to delete a task"
});

const arr = [item1, item2, item3];

const listSchema = ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);
  


app.get("/", function (req, res) {
  //To avoid repetition we'll add those 3 items only when the array is empty
  //Item.find() se we are getting all the data/founditems from todolistDB

  Item.find({}
    ).then(function(foundItems){
      if(foundItems.length === 0){
        Item.insertMany(arr);
        res.redirect("/");
      }
      else{
        res.render("list", {kindOfDay:"Today", newItems: foundItems});
      }
    })
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}
    ).then(function(foundList){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: arr
        })
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list", {kindOfDay: foundList.name, newItems: foundList.items});
      }
    });
  
  

});

app.post("/", function (req, res) {
  let task = req.body.userInput;
  const listName = req.body.list;
  //create a new item of this user inputed task and just save and redirect to home
  const item = new Item({
    name: task
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete", function (req, res) {
  const checkedItemID = req.body.Checkbox;
  const list = req.body.listName;

  if(list ==="Today"){
    Item.findOneAndRemove(checkedItemID
      ).then(()=>{
        console.log("Deleted");
        res.redirect("/");
        })
  }else{
    List.findOneAndUpdate({name:list}, {$pull:{items:{_id:checkedItemID}}}
      ).then(function(foundList){
        res.redirect("/"+list);
      })
  }

  
});



// app.post("/work", function (req, res){
//   res.redirect("/work");
// })


app.listen(3000, function () {
  console.log("3000");
});

// Item.insertMany(arr
// )
// .then(function(){
//     console.log("Data inserted")  // Success
// }).catch(function(error){
//     console.log(error)      // Failure
// });