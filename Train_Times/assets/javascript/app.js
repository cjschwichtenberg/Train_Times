// Initialize & configure Firebase Database
var config = {
    apiKey: "AIzaSyBMfAd35BllH_wZhrvZRn2cldj_ic4_kTg",
    authDomain: "train-time-tracker-project-7.firebaseapp.com",
    databaseURL: "https://train-time-tracker-project-7.firebaseio.com",
    projectId: "train-time-tracker-project-7",
    storageBucket: "train-time-tracker-project-7.appspot.com",
    messagingSenderId: "421498122590"
};

firebase.initializeApp(config);

// Defining Global Variables
var database = firebase.database();

var trainName = "";
var destination = "";
var firstTime = "";
var frequency = "";

var timeNow = moment();

var nextArrival = "";
var minutesAway = "";

// On click event for adding new train info
$("#add-train").on("click", function(event) {

    // preventing page from reloading
    event.preventDefault();

    // Pulling value's from for inputs, trimming whitespace 
    trainName = $("#train-name-input").val().trim();
    destination = $("#destination-input").val().trim();
    firstTime = $("#first-time-input").val().trim();
    frequency = $("#frequency-input").val().trim();

    // Defining local variables for calculating next arrival and minutes away sections:

    // Turning first time form input from military HH:mm to unix(seconds) timestamp
    var firstTimeUnix = moment(firstTime, "HH:mm").format("X");
    // Getting the difference in minutes of the current time and the first time the train runs in the AM
    var timeDifference = moment().diff(moment.unix(firstTimeUnix), "minutes");
    // Getting the modulus(remainder) of the time difference and the frequency that the train runs in minutes: 
    // final calculation needed to compute next train and minutes away
    var timeRemainder = moment().diff(moment.unix(firstTimeUnix), "minutes") % frequency;

    // Calculating the minutes until next train arrives using frequency and remainder calculated above
    minutesAway = frequency - timeRemainder;
    // Calculating train arrival time by taking minutes away calculation and adding result to current time, while formatting to hh:mm am/pm
    nextArrival = moment().add(minutesAway, "minutes").format("hh:mm A");


    // pushing form inputs and final calculations to firebase to store
    database.ref().push({
        trainName: trainName,
        destination: destination,
        firstTime: firstTime,
        frequency: frequency,
        nextArrival: nextArrival,
        minutesAway: minutesAway,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
    });
});


// Logging the "child snapshot" from firebase in console
database.ref().on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val().trainName);
    console.log(childSnapshot.val().destination);
    console.log(childSnapshot.val().firstTime);
    console.log(childSnapshot.val().frequency);
    console.log(childSnapshot.val().nextArrival);
    console.log(childSnapshot.val().minutesAway);

    // Taking child snapshots and appending them to the table to view current, realtime train info 
    $("#train-table").append("<tr> <td>" + childSnapshot.val().trainName +
        "</td> <td>" + childSnapshot.val().destination +
        "</td> <td>" + childSnapshot.val().frequency +
        "</td> <td>" + childSnapshot.val().nextArrival +
        "</td> <td>" + childSnapshot.val().minutesAway +
        "</td> </tr>");
    // logging and errors from firebase to console
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Arranging data in firebase by the added timestamp of when train info was initially input
database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
    console.log(snapshot.val());
});

// clearing the input values to reset the input form
function clearInputVal() {
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#first-time-input").val("");
    $("#frequency-input").val("");

};
clearInputVal();