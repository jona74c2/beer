"use strict";

window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
const logData = [];
const HTML = {};

function start() {
  document.querySelector("#valcard").addEventListener("click", cardnumberValidate);
  initSettings();
  initHTMLpointers();
  settings.interval = 2000;
  timerFunction();
  post();
}

function initSettings() {
  settings.endpointOrder = "https://holbech-bestbrewer.herokuapp.com/order/";
  settings.endpoint = "https://holbech-bestbrewer.herokuapp.com/";
  /* settings.apiKey = "6ea32456-cebd-427c-abc2-c0224c9a2bc0"; */
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
  let valid = require("card-validator");
  console.log(HTML.form.cardnumber.value);
  let numberValidation = valid.number(HTML.form.cardnumber.value);
  /*  //This works on active credit cards, and i won't use my own creditcard number online :S
   if (!numberValidation.isValid) {
    console.log("invalid cardnumber");
  } */
  if (!numberValidation.isPotentiallyValid) {
    console.log("invalid cardnumber");
  } else {
    console.log("Card number is correct");
    console.log(numberValidation.card.type);
    console.log(numberValidation.card.gaps);
    console.log("antal kontrolcifre", numberValidation.card.code.size);
    HTML.form.cardnumber.pattern = numberValidation.card.gaps;
  }
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
