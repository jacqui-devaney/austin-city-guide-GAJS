import $ from 'jquery';
import _ from 'lodash';
import Shuffle from 'shufflejs';


// var fs = require('fs');
// var readline = require('readline');
// var google = require('googleapis');
// var googleAuth = require('google-auth-library');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyB8nv6nE2e9iD6JurhpjeeYZxuC9Fz26Fk",
  authDomain: "austin-city-guide.firebaseapp.com",
  databaseURL: "https://austin-city-guide.firebaseio.com",
  projectId: "austin-city-guide",
  storageBucket: "austin-city-guide.appspot.com",
  messagingSenderId: "717637854232"
};
firebase.initializeApp(config);

$(document).ready(function(){

var dataItems;
var placeData;
var allDataArr = [];
var mapLocation = [];

function start() {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
      'apiKey': 'AIzaSyD2X8bk-11_hLrGaSse4Jhy0-zN5uVztzc'
      // clientId and scope are optional if auth is not required.
      // 'clientId': 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      // 'scope': 'profile',
    }).then(function() {
      // 3. Initialize and make the API request.
      return gapi.client.request({
        'path': 'https://sheets.googleapis.com/v4/spreadsheets/1PzP1Yqp5RwqsyH7Jn97CD3AO5EM5TeOll7oZQRGnjhc/values/A1:K43',
      })
    }).then(function(response) {
      dataItems = response.result;
      var items = response.result;
      App.init();
    }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
    });
  };
// 1. Load the JavaScript client library.
gapi.load('client', start);

var Utils = {
  getAllCardsMarkup: function(places) {
    return $.each(places, function() {
        var markup = Utils.getCardMarkup(places);
        return markup;
    });
  },
  getCardMarkup: function(place) {
    var isImage = place.ImageURL;
    var activity = place.Activity.toLowerCase();
    var activityData = function() {
      var activityNumber = activity.split(" ").join('", "');
      if (activityNumber < 2) {
        return activity;
      } else {
        return activityNumber;
      }
    };
    var outdoorSeating = function() {
      if(place.OutdoorSeating === 'Yes') {
        return "There's outdoor seating";
      } else {
        return "There's no outdoor seating";
      }
    };
    var renderMap = function() {
      var mapCords = place.Cords.split(",");
      var mapObj = {
        place: place.Place,
        long: mapCords[0],
        lat: mapCords[1]
      };
      mapLocation.push(mapObj);
    };
    if (typeof isImage === 'string') {
      if(activity.includes('eating') || activity.includes('drinking')) {
        return `<div class="activity picture-item ${place.Activity.toLowerCase()}" ontouchstart="this.classList.toggle('hover');" data-groups='["${activityData()}"]'>
        <div class="card">
          <div class="activity-text front">
            <img class="activity-pic" src="${place.ImageURL}">
            <h1 class="activity-title">${place.Place}</h1>
            <h3 class="activity-mealtime">${place.MealTime}</h3>
            <h3 class="activity-type">${place.Type}</h3>
         </div>
         <div class="activity-text back">
           <p class="activity-happyhourtext">Happy Hour Hours:</p>
           <p class="activity-happyhour">${place.HappyHourTime}</p>
           <p class="activity-outdoor">${outdoorSeating()}</p>
           <p><a href="${place.URL}" target="_blank">Visit Website</a></p>
         </div>
         <div>
        </div>`
      } else {
        return `<div class="activity picture-item ${place.Activity.toLowerCase()}" ontouchstart="this.classList.toggle('hover');" data-groups='["${activityData()}"]'>
        <div class="card">
          <div class="activity-text front">
            <img class="activity-pic" src="${place.ImageURL}">
            <h1 class="activity-title">${place.Place}</h1>

         </div>
         <div class="activity-text back">
          <p class="activity-happyhourtext"> Hours of Operation </p>
          <p class="activity-hours">${place.HappyHourTime}</p>
          <div id="map" class="${place.Place}"></div>

         </div>
         <div>
        </div>`
      }
    } else {
      if(activity.includes('eating') || activity.includes('drinking')) {
        return `<div class="activity picture-item ${place.Activity.toLowerCase()}" ontouchstart="this.classList.toggle('hover');" data-groups='["${activityData()}"]'>
        <div class="card">
          <div class="activity-text front">
            <h1 class="activity-title">${place.Place}</h1>
            <h3 class="activity-mealtime">${place.MealTime}</h3>
            <h3 class="activity-type">${place.Type}</h3>
         </div>
         <div class="activity-text back">
           <p class="activity-happyhour">Happy Hour Hours:</p>
           <p class="activity-happyhour">${place.HappyHourTime}</p>
           <p class="activity-outdoor">${outdoorSeating()}</p>
           <p><a href="${place.URL}" target="_blank">Visit Website</a></p>
         </div>
         <div>
        </div>`
      } else {
        return `<div class="activity picture-item ${place.Activity.toLowerCase()}" ontouchstart="this.classList.toggle('hover');" data-groups='["${activityData()}"]'>
        <div class="card">
          <div class="activity-text front">
            <h1 class="activity-title">${place.Place}</h1>
            <p>photo will go here</p>
         </div>
         <div class="activity-text back">
          <p> hours </p>
          <p> map </p>
         </div>
         <div>
        </div>`
      }
    }
  }
};

var App = {
  init: function() {
    // console.log(dataItems);
    this.bindEvents();
    this.render();
  },
  bindEvents: function() {
    $('.nav').on('click', "li", this.cardShuffle.bind(this));
    $('#header').on('click', this.cardShuffleAll.bind(this));
    $('.activity').on('click', this.cardFlip());
  },
  render: function() {
    var placesArr = dataItems.values;
    var response = placesArr.forEach(function(element, i) {
      if(i > 0) {
        placeData = _.zipObject(dataItems.values[0], dataItems.values[i]);
        allDataArr.push(placeData);
        App.renderCards();
      }
    });

    var element = document.querySelector('#activity-items');
    var sizer = element.querySelector('.my-sizer-element');
    App.shuffleInstance = new Shuffle(element, {
      itemSelector: '.activity',
      sizer: sizer
    });
  },
  renderCards: function() {
    const cardsMarkup = Utils.getCardMarkup(placeData);
    $("#activity-items").append(cardsMarkup).done( function() {
          App.renderMap();
    });
  },
  toggleView: function(event) {
    //replaced this with the cardShuffle function below
    var element = event.target;
    var navClass = element.className;
    $(".activity").each(function() {
      var hasClass = $(this).hasClass(navClass);
      if (hasClass === false) {
        $(this).css('display', 'none');
      } else
        $(this).css('display', 'inline-block');
    })
  },
  showAllItems: function() {
    $(".activity").each(function() {
      $(this).css('display', 'inline-block');
    })
  },
  cardFlip: function() {
    $('.activity').toggle(
      function() {
          $('.activity .card').addClass('flipped');
      },
      function() { $('.activity .card').removeClass('flipped');
    })
  },
  cardShuffle: function(event) {
    var element = event.currentTarget;
    var navClass = $(element).find("a")[0].className;
    // var navClass = element.className;
    App.shuffleInstance.filter(navClass);
  },
  cardShuffleAll: function() {
    // var element = document.querySelector('#activity-items');
    // var sizer = element.querySelector('#activity-items');
    // // TODO: Change this later
    // var shuffleInstance = new Shuffle(element, {
    //   itemSelector: '.activity',
    //   sizer: sizer
    // });
    App.shuffleInstance.filter(Shuffle.ALL_ITEMS);
  },
  renderMap: function() {
    var placeName = $(".activity-title");
    var map;
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
      });
    }
  }
};

});
