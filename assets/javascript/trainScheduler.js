/* -----------------------
    Project:    Train Scheduler
    Author:     German Garcia
    Date:       Apr 15, 2019
    Last Date Modified:     Apr 15, 2019

    Description:    Train scheduler access a Firebase DB to pull: 
                        - Train Name
                        - Train Destination
                        - Frequency
                        - first train Time

                    The script calculates the Next Arrival time 

                    The information is displayed at trainScheduler.html

                    The user can add another train by using the form 
                    at trainScheduler.html

---------------------------- */ 

/* global moment firebase */
// <script src="https://www.gstatic.com/firebasejs/5.9.4/firebase.js"></script>
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAOIdVa7JpQRTvmck1YQIm7625aYaSMEdY",
    authDomain: "trainscheduler-bc88a.firebaseapp.com",
    databaseURL: "https://trainscheduler-bc88a.firebaseio.com",
    projectId: "trainscheduler-bc88a",
    storageBucket: "trainscheduler-bc88a.appspot.com",
    messagingSenderId: "548794737370"
  };
  firebase.initializeApp(config);
// get reference to DB service:
var database = firebase.database();


// --------------------------------------------------------------
// Global Variable section:
var trainName = "";
var trainDestination = "";
var firstTrainTime = "";
var frequency = 0; 

// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update your page in real-time when the firebase database changes.
database.ref().on("child_added", function(snapshot) {

    //console.log(snapshot.val());
    // Set the variables to display in the form AND 
    //    to calculate the Next Arrival.
    trainName = snapshot.val().trainName;
    trainDestination = snapshot.val().trainDestination;
    firstTrainTime = snapshot.val().trainFirstTime;
    frequency = parseInt(snapshot.val().trainFrequency);

    //calculate Next Arrival and Minutes away from all the trains in the DB
    var firstTime = firstTrainTime.split(":");
    //console.log(firstTime);
    var trainTime = moment().hours(firstTime[0]).minutes(firstTime[1]); 
    //console.log("TrainTime:");
    // console.log(trainTime); 

    var maxMoment = moment.max(moment(), trainTime); 
    var timeMinutes;
    var timeArrival;

    if (maxMoment === trainTime) {
        timeArrival = trainTime.format("hh:mm A");
        timeMinutes = trainTime.diff(moment(), "minutes");
      } else {
        // Calculate the minutes until arrival using hardcore math
        // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
        // and find the modulus between the difference and the frequency.
        var differenceTimes = moment().diff(trainTime, "minutes");
        var tRemainder = differenceTimes % frequency;
        timeMinutes = frequency - tRemainder;
        // To calculate the arrival time, add the tMinutes to the current time
        timeArrival = moment()
          .add(timeMinutes, "m")
          .format("hh:mm A");
      }
      //console.log("timeMinutes:", timeMinutes);
      //console.log("timeArrival:", timeArrival);


    // Create table row
    var tableRow = $('<tr class="light-row">');
    var trainNameTable = $('<td scope="col">');
    trainNameTable.text(trainName); 
    var trainDestTable = $('<td scope="col">');
    trainDestTable.text(trainDestination);
    var firstTrainTimeTable = $('<td scope="col">');
    firstTrainTimeTable.text(firstTrainTime);
    var frequencyTable = $('<td scope="col">');    
    frequencyTable.text(frequency);
    var nextArrivalTbl = $('<td scope="col">');
    nextArrivalTbl.text(timeArrival);
    var minAwayTbl = $('<td scope="col">');
    minAwayTbl.text(timeMinutes); 

    tableRow.append(trainNameTable);
    tableRow.append(trainDestTable);
    tableRow.append(frequencyTable);
    tableRow.append(firstTrainTimeTable);
    tableRow.append(nextArrivalTbl);
    tableRow.append(minAwayTbl);
    tableRow.appendTo($("#trainDbInfo"));

    /*
    console.log(trainName);
    console.log(trainDestination);
    console.log(firstTrainTime);
    console.log(frequency);
    */
   
    // If any errors are experienced, log them to console.
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  
  // --------------------------------------------------------------
  // Whenever a user clicks the submit button, upload the information to firebase
  
  $("#submitButton").on("click", function(event) {
        event.preventDefault();
        // Get the input values
        var trainName_form = $("#trainName").val().trim();
        var trainDestination_form = $("#trainDestination").val().trim();
        var trainFirstTime_form = $("#firstTrainTime").val().trim();
        var trainFrequency_form = parseInt($("#trainFrequency").val().trim());
    
        // Log the Bidder and Price (Even if not the highest)
        /*
        console.log(trainName_form);
        console.log(trainDestination_form);
        console.log(trainFirstTime_form);
        console.log(trainFrequency_form);
        */
        // Save the new price in Firebase. This will cause our "value" callback above to fire and update
        // the UI.
        // database.ref().set({
        database.ref().push({
             trainName:          trainName_form,
             trainDestination:   trainDestination_form,
             trainFirstTime:     trainFirstTime_form,
             trainFrequency:     trainFrequency_form
        });

        //console.log("Information added: "); 

        //Clean text boxes
        $("#trainName").val("");
        $("#trainDestination").val("");
        $("#firstTrainTime").val("");
        $("#trainFrequency").val("");

    });

   
    $("#clearForm").on("click", function(event) {
        event.preventDefault();
        //Clean text boxes
        $("#trainName").val("");
        $("#trainDestination").val("");
        $("#firstTrainTime").val("");
        $("#trainFrequency").val("");
    });      