import $ from 'jquery';
import _ from 'lodash';


// var fs = require('fs');
// var readline = require('readline');
// var google = require('googleapis');
// var googleAuth = require('google-auth-library');

$(document).ready(function(){

var dataItems;
var placeData;

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
        'path': 'https://sheets.googleapis.com/v4/spreadsheets/1PzP1Yqp5RwqsyH7Jn97CD3AO5EM5TeOll7oZQRGnjhc/values/A1:I43',
      })
    }).then(function(response) {
      dataItems = response.result;
      var items = response.result;
      console.log(items);
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
        console.log(markup);
        return markup;
    });
  },
  getCardMarkup: function(place) {
    return `<div class="activity active">
      <span class="activity-text">
        <h1 class="activity-title">${place.Place}</h1>
        <h3 class="activity-label">${place.MealTime}</h3>
     </span>
    </div>`
  }
}

var App = {
  init: function() {
    // console.log(dataItems);
    this.bindEvents();
    this.render();
  },
  bindEvents: function() {
    $('.nav').on('click', "li", App.toggleView.bind(this));
  },
  render: function() {
    var placesArr = dataItems.values;
    var response = placesArr.forEach(function(element, i) {
      if(i > 0) {
        placeData = _.zipObject(dataItems.values[0], dataItems.values[i]);
        App.renderCards();
      }
    });
  },
  renderCards: function() {
    const cardsMarkup = Utils.getCardMarkup(placeData);
    $("#activity-items").append(cardsMarkup);
  },
  toggleView: function(event) {
    var element = event.target;
    console.log(element.className);
    // debugger;
    console.log(this);
    // console.log(placeData);
    // console.log($(this).text());
  }
};



});
