import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const port = 3000;
const app = express();
const API_URL = "https://api.jikan.moe/v4"

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function getAnimeTypes() {
    try {
        const response = await axios.get(API_URL + "/anime");
        const types = response.data.data.map(item => item.type);
        return new Set(types);
    } catch (error) {
        console.error("Error fetching anime types: " + error.message);
        return new Set();
    }
}

app.use(async (req, res, next) => {
    req.type_filter = await getAnimeTypes();
    next();
});

app.get("/", async(req, res)=>{
    try {
        const response = await axios.get(API_URL + "/anime");
        res.render("index.ejs", { type: req.type_filter });
    } catch (error) {
        console.error("Request Error: " + error.message);
        res.render("index.ejs", { error: error.message });
    }
});

app.get("/random-suggest", async(req, res)=>{

    try {
        const response = await axios.get(API_URL + "/random/anime");
        const result = response.data;
        //console.log(result);
        //console.log(result.data.title); //output: Zui Zui Zukkorobashi
        //console.log(result.data.images.jpg.image_url); // https://cdn.myanimelist.net/images/anime/11/35537.jpg
        //console.log(result.data.trailer.url); // https://www.youtube.com/watch?v=oxecAdYTMzM
        //console.log(result.data.trailer.url.slice(-11)); // oxecAdYTMzM
        const data = {
            name : result.data.title,
            year: result.data.year,
            season : result.data.season,
            episodes : result.data.episodes,
            poster_img_url : result.data.images.jpg.image_url,
            synopsis : result.data.synopsis,
        }
        if (result.data.trailer.url) {
            data.trailer_url = result.data.trailer.url.slice(-11);
        } else {
            data.trailer_url = null;
        }
        res.render("index.ejs", { data: data, type: req.type_filter });
    }catch (error){
        console.error("Request Error: " + error.message);
        res.render("index.ejs", {error: error.message});
    }
});

app.post("/type-suggestion", async(req, res)=>{

   // console.log(req.body.type); // TV
   try{
        const selectedOption = req.body.type;
        const response = await axios.get(API_URL + "/anime");
        const filteredTitles = response.data.data.filter(item => item.type === selectedOption).map(item => item.title);
        //console.log(filteredTitles);// [ 'Cowboy Bebop',...]
        const randomIndex = Math.floor(Math.random()*filteredTitles.length);
        const data = {
            name: response.data.data.filter(item => item.type === selectedOption).map(item => item.title)[randomIndex],
            year: response.data.data.filter(item => item.type === selectedOption).map(item => item.year)[randomIndex],
            season : response.data.data.filter(item => item.type === selectedOption).map(item => item.season)[randomIndex],
            episodes : response.data.data.filter(item => item.type === selectedOption).map(item => item.episodes)[randomIndex],
            poster_img_url : response.data.data.filter(item => item.type === selectedOption).map(item => item.images.jpg.image_url)[randomIndex],
            synopsis : response.data.data.filter(item => item.type === selectedOption).map(item => item.synopsis)[randomIndex],

        }
        if (response.data.data.filter(item => item.type === selectedOption).map(item => item.trailer.url)[randomIndex]) {
            data.trailer_url = response.data.data.filter(item => item.type === selectedOption).map(item => item.trailer.url)[randomIndex].slice(-11);
        } else {
            data.trailer_url = null;
        }
        res.render("index.ejs", { data: data, type: req.type_filter });

   }catch(error){
        console.error("Request Error: " + error.message);
        res.render("index.ejs", {error: error.message});
   }
});

app.listen(port, ()=>{
    console.log(`Server listening on ${port} port.`)
});