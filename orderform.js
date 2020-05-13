"use strict";

window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
//const logData = [];
const HTML = {};

function start() {
  document.querySelector("#valcard").addEventListener("click", cardnumberValidate);
  initSettings();
  initHTMLpointers();
  settings.interval = 2000;
  //timerFunction();
  post();
  getDate();
  initDateForm();
}

function initSettings() {
  settings.endpointOrder = "https://holbech-bestbrewer.herokuapp.com/order/";
  settings.endpoint = "https://holbech-bestbrewer.herokuapp.com/";
}

function initHTMLpointers() {
  HTML.form = document.querySelector("form");
}

async function getData() {
  const response = await fetch(settings.endpoint, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  jsonData = await response.json();
  console.log(jsonData);
}

function timerFunction() {
  getData();
  setTimeout(timerFunction, settings.interval);
}

async function post() {
  const order = [{ name: "Hoppily Ever After", amount: 10 }];
  const postData = JSON.stringify(order);
  console.log(postData);
  const response = await fetch(settings.endpointOrder, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      /* "x-apikey": settings.apiKey, */
    },
    body: postData,
  });
  jsonData = await response.json();
  console.log(jsonData);
  /* getJsonData(); */
}

function cardnumberValidate() {
  //API: https://www.npmjs.com/package/card-validator
  let valid = require("card-validator");
  let numberValidation = valid.number(HTML.form.cardnumber.value);
  /*  //This works on active credit cards, and i won't use my own creditcard number online :S
   if (!numberValidation.isValid) {
    console.log("invalid cardnumber");
  } */
  if (!numberValidation.isPotentiallyValid) {
    console.log("invalid cardnumber");
  } else {
    console.log(numberValidation.card.type);
    console.log(numberValidation.card.gaps);
    let maxnumber = 9;
    let minnumber = 1;
    for (let i = 0; i < numberValidation.card.code.size; i++) {
      if (i !== 0) {
        minnumber += "0";
        maxnumber += "9";
      }
    }

    HTML.form.controlnumber.max = maxnumber;
    HTML.form.controlnumber.min = minnumber;
    console.log("kontrol ciffer antal: ", HTML.form.controlnumber.max);
    //HTML.form.cardnumber.pattern = numberValidation.card.gaps;
  }
}

function getDate() {
  // example used to build this function: https://www.geeksforgeeks.org/how-to-convert-milliseconds-to-date-in-javascript/
  let dateInMs = new Date().getTime();
  let date = new Date(dateInMs);
  if (date.getMonth() < 10) {
    settings.month = "0" + (date.getMonth() + 1);
  }
  settings.year = date.getFullYear().toString().substring(2, 4);
}

function initDateForm() {
  HTML.form.cardmonth.value = settings.month;
  HTML.form.cardyear.value = settings.year;
  HTML.form.cardyear.min = settings.year;
}

/* function addCard() {
  HTML.form.title.classList.remove("invalid");
  const formIsValid = HTML.form.checkValidity();
  if (formIsValid) {
    const card = createCardFromInput();
    post(card);
    HTML.form.reset();
  } else {
    HTML.form.title.classList.add("invalid");
  }
}

function createCardFromInput() {
  const card = {
    title: HTML.form.title.value,
    description: HTML.form.description.value,
    estimate: HTML.form.estimate.value,
    deadline: HTML.form.deadline.value,
    creator: HTML.form.creator.value,
    priority: HTML.form.priority.value,
  };
  return card;
} */
