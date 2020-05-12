"use strict";

window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
const logData = [];

function start() {
  initSettings();
  settings.interval = 2000;
  timerFunction();
}

function initSettings() {
  settings.endpointOrder = "https://holbech-bestbrewer.herokuapp.com/order/";
  settings.endpoint = "https://holbech-bestbrewer.herokuapp.com/";
  /* settings.apiKey = "6ea32456-cebd-427c-abc2-c0224c9a2bc0"; */
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

async function deleteIt(id) {
  /* const id = jsonData[jsonData.length - 1]._id; */
  const response = await fetch(settings.endpoint + "/" + id, {
    method: "delete",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": settings.apiKey,
      "cache-control": "no-cache",
    },
  });
  /* .then((e) => e.json())
        .then((e) => console.log(e)); */
  jsonData = await response.json();
  console.log(jsonData);
}

async function put(id) {
  /* const id = jsonData[jsonData.length - 1]._id; */
  let data = {
    brand: "Volkswagen",
    serial_number: "vw" + Math.random(),
    model: "Up!",
    engine_size_l: "1.0",
  };
  let postData = JSON.stringify(data);
  const response = await fetch(settings.endpoint + "/" + id, {
    method: "put",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": settings.apiKey,
      "cache-control": "no-cache",
    },
    body: postData,
  });
  /* .then((e) => e.json())
          .then((e) => console.log(e)); */
  const putData = await response.json();
  console.log(putData);
}

function addCard() {
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
}
