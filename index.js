import express from "express";
import axios from "axios";

const port = 3000;
const app = express();

app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.render("index.ejs");
});

app.listen(port, ()=>{
    console.log(`Server listening on ${port} port.`)
});