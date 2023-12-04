
import express from "express";
import bodyParser from "express";
import axios from "axios"; 

const port = 3000; 
const app = express(); 
const API_URL = "https://byabbe.se/on-this-day/"

var new_events = [];
var births = [];

/* Middleware */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.listen(port, () => {
    console.log("Server is running on port", port);
});


app.get('/', (req, res) => {
    res.render('index.ejs' );
});


/* 
    Get information from the given date and post it on the screen.
    Information includes events, births, and deaths. 
*/

app.post('/submit', async (req, res) => {
    try {
        /* Get events */
        const url = API_URL+req.body.month+"/"+req.body.day+"/events.json";
        const response = await axios.get(url);
        new_events = [];  // Empty array of events before adding new ones.
        get_events(response.data.events); 

        try {
            /* Get births */
            const births_url = API_URL+req.body.month+"/"+req.body.day+"/births.json";
            const births_response = await axios.get(births_url);
            births = []; 
            get_births(births_response.data.births);
        } catch (error) {
            births = [];
            console.log("error getting births");
        }

        res.render("index.ejs", { events: new_events, date: [req.body.day, req.body.month], births: births} );
    } catch (error) {
        console.log("error getting events");
        new_events = [];
        res.redirect('/'); 
    }
});



/* 
    Create Event objects out of the events received from the API.
    Makes it easier to parse later. 
*/
function get_events(events) {
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

            // This event has the possibility of being a special event. 
            var is_special = Math.random() < 0.03
            var e = new Event(events[i].year, events[i].description, title, link, is_special); 
        }
        new_events.push(e);
    }
}

class Event {
    constructor(year = "?", description="Unknown description", title = "Unknown title", link = "#", is_special = false, is_ad=false) {
        this.year = year; 
        this.title = title; 
        this.description = description; 
        this.link = link; 
        this.is_special = false;  // Change later
        this.is_ad = is_ad;
    }
}


/* 
    Get births and store them in an array. 
*/
function get_births(births) {
    var births_length = Object.keys(births).length;
    // Create birth instances. 
    for (var i = 0; i < births_length; i++) {
        var link;
        var wiki = births[i].wikipedia; 
        if (Object.keys(wiki).length <= 0) {
            console.log("no wiki for this birth");
            link = "#"
        }
        else {
            var w = Object.values(wiki[0]);
            link = w[1];
        }

        var b = new Birth(births[i].year, births[i].description, link);
        births.push(b); 
    }
}

class Birth {
    constructor(year = "?", name="Unknown name", link="#") {
        this.year = year;
        this.name = name;
        this.link = link;
    }
}


