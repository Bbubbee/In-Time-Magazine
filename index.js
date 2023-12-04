
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
    Get births and store them in an array. Only generates a limited amount of births. 
*/
function get_births(births_object) {
    var births_length = Object.keys(births_object).length;

    // Randomly generare 30 births. Ensure it follows chronological order. 
    var random_list = generate_random_list(20, births_length); 

    // Create birth instances. 
    for (var i = 0; i < random_list.length; i++) {
        var index = random_list[i]; 

        var link;
        var wiki = births_object[index].wikipedia; 
        if (Object.keys(wiki).length <= 0) {
            console.log("no wiki for this birth");
            link = "#"
        }
        else {
            var w = Object.values(wiki[0]);
            link = w[1];
        }

        // Add birth to array. 
        var b = new Birth(births_object[index].year, births_object[index].description, link);
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


/* 
    Generates a list of random numbers. Orders the random numbers from to lowest to highest. 
    @amount = the amount of random numbers to generate. 
    @max    = the highest number that can be generated.
*/
function generate_random_list(amount, max) {
    var random_list = [] 

    // Generates the amount of random numbers needed. 
    for (var i = 0; i < amount; i++) {
        do {
            var r = Math.floor(Math.random() * max);
            random_list.push(r); 
        } while (!random_list.includes(r));
    }

    // Order the list from lowest to highest. 
    random_list = random_list.sort(function(a, b) { return a - b; });

    return random_list; 
}


