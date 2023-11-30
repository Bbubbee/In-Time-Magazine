
import express from "express";
import bodyParser from "express";
import axios from "axios"; 

const port = 3000; 
const app = express(); 
const API_URL = "https://byabbe.se/on-this-day/"

var new_events = [];

/* Middleware */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.listen(port, () => {
    console.log("Server is running on port", port);
});


app.get('/', (req, res) => {
    res.render('index.ejs' );
});


// Get a bunch of events from the given date. 
app.post('/submit', async (req, res) => {
    const url = API_URL+req.body.month+"/"+req.body.day+"/events.json";

    try {
        const response = await axios.get(url);

        // Empty array of events before adding new ones. 
        new_events = [];

        get_random_events(response.data.events); 

        res.render("index.ejs", { events: new_events, date: [req.body.day, req.body.month] } );
    } catch (error) {
        console.log("error getting events");
        events = [];
        res.redirect('/'); 
    }
});



/* 
    Create Event objects out of the events received from the API.
    Makes it easier to parse later. 
*/
function get_random_events(events) {
    var event_length = Object.keys(events).length;

    for (var i = 0; i < event_length; i++) {
        // Create new event. 

        // Get wiki object. Used to derive title and link. 
        var wiki = events[i].wikipedia; 

        // Check if wiki exists. 
        if (Object.keys(wiki).length <= 0) {
            // If it doesn't exist, create an event without the title and link. 
            var e = new Event(events[i].year, events[i].description); 
        }
        else {
            wiki = Object.values(wiki[0]);
            var title = wiki[0];
            var link = wiki[1]
            var e = new Event(events[i].year, events[i].description, title, link); 
        }

        new_events.push(e);
    }
}


class Event {
    constructor(year = "?", description="Unknown description", title = "Unknown title", link = "#") {
        this.year = year; 
        this.title = title; 
        this.description = description; 
        this.link = link; 
    }
}