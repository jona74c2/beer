"use strict";
import IMask from "imask";
window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
//const logData = [];
const HTML = {};

function start() {
  //document.querySelector("#order").addEventListener("click", cardnumberValidate);
  getUrlParams();
  initObejcts();
  initForm();

  //timerFunction();
  //post();
}

function getUrlParams() {
  let params = new URL(document.location);
  params = params.toString();
  params = params.substring(params.indexOf("?") + 1, params.length);
  let paramsArray = params.split(",");

  paramsArray = removeUrlSpaces(paramsArray);
  console.log(paramsArray);
  return paramsArray;
}

function removeUrlSpaces(paramsArray) {
  let updatedParamsArray = [];
  paramsArray.forEach((string) => {
    updatedParamsArray.push(string);
    if (string.includes("%20")) {
      const indexOfSpace = string.indexOf("%20");
      //replace %20 from url with a space
      string = string.substring(0, indexOfSpace) + " " + string.substring(indexOfSpace + 3, string.length);
      updatedParamsArray.pop();
      updatedParamsArray.push(string);
    }
  });
  console.log(updatedParamsArray);
  return updatedParamsArray;
}

function initObejcts() {
  initSettings();
  initHTMLpointers();
}

function initForm() {
  initMasks();
  cardnumberValidate();
  getDate();
  initDateForm();

  //cardnumberMask("0000 0000 0000 0000000", [19]);
  HTML.form.cardnumber.addEventListener("input", cardnumberValidate);
}

function initSettings() {
  settings.endpointOrder = "https://holbech-bestbrewer.herokuapp.com/order/";
  settings.endpoint = "https://holbech-bestbrewer.herokuapp.com/";
  settings.interval = 2000;
  settings.cardnumberMaskBool = true;
}

function initHTMLpointers() {
  HTML.form = document.querySelector("form");
}

function initMasks() {
  initCodenumberMask();
  initCardnumberMask();
}

function initCodenumberMask() {
  settings.maskControlnumber = IMask(HTML.form.controlnumber, {
    mask: "000",
  });
}

function initCardnumberMask() {
  settings.maskCardnumber = IMask(HTML.form.cardnumber, {
    mask: "0000 0000 0000 0000000",
  });
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

/* async function post() {
  const order = [{ name: "Hoppily Ever After", amount: 10 }];
  const postData = JSON.stringify(order);
  console.log(postData);
  const response = await fetch(settings.endpointOrder, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: postData,
  });
  jsonData = await response.json();
  console.log(jsonData);
} */

function cardnumberValidate() {
  //API: https://www.npmjs.com/package/card-validator
  console.log("Cardnumber Validation initiated");
  console.log(HTML.form.cardnumber.value.length);
  if (HTML.form.cardnumber.value.length < 4) {
    console.log("Cardnumber Validation terminated");
    return;
  }
  let valid = require("card-validator");
  let numberValidation = valid.number(HTML.form.cardnumber.value);
  /*  //This works on active credit cards, and i won't use my own creditcard number online :S
   if (!numberValidation.isValid) {
    console.log("invalid cardnumber");
  } */
  if (!numberValidation.isPotentiallyValid) {
    console.log("invalid cardnumber");
  } else {
    if (numberValidation.card.type != null) {
      console.log(numberValidation.card.type);

      setCardnumberMask(numberValidation.card.lengths, numberValidation.card.gaps);

      setControlnumberMask(numberValidation.card.code.size);
      console.log("numberValidation.card.code.size: ", numberValidation.card.code.size);
    }
  }
}

function setControlnumberMask(codeSize) {
  HTML.form.querySelector("#controlnumberdigits").textContent = codeSize;
  console.log("kontrol ciffer antal: ", HTML.form.controlnumber.max);
  HTML.form.controlnumber.pattern = `[0-9]{${codeSize}}`;
  const nine = "0";
  settings.maskControlnumber.updateOptions({ mask: nine.repeat(codeSize) });
}

function setCardnumberMask(lengths, gaps) {
  if (JSON.stringify(gaps) !== JSON.stringify(settings.prevGaps)) {
    const patternMask = getCardNumberPattern(lengths, gaps);

    console.log(patternMask);
    cardnumberMask(patternMask, lengths);
    //mask.updateValue();
  } else {
    console.log("no update in gaps");
  }
}

function cardnumberMask(patternMask, lengths) {
  /*  if (settings.cardnumberMaskBool) { */
  const nine = "9";
  const one = "1";
  const zero = "0";
  let max = nine.repeat(lengths[lengths.length - 1]);
  let min = one + zero.repeat(lengths[lengths.length - 1] - 1);

  HTML.form.cardnumber.minLength = lengths[0];

  settings.maskCardnumber.updateOptions({ mask: patternMask, max: max }); /* else {
    settings.mask.updateValue((mask = patternMask));
  } */
  /*  settings.cardnumberMaskBool = false; */
  /* } */
}

function getCardNumberPattern(lengths, gaps) {
  let patternMask = "0";
  let l = 0;
  const cardlength = lengths[lengths.length - 1];
  if (JSON.stringify(gaps) !== JSON.stringify(settings.prevGaps)) {
    for (let i = 0; i < cardlength; i++) {
      if (i === gaps[l] - 1) {
        patternMask += " ";
        l++;
      }
      patternMask += 0;
    }
    settings.prevGaps = gaps;
    console.log("Prev gaps: ", settings.prevGaps, " new gaps: ", gaps);
  }
  return patternMask;
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
  maksDateForm(HTML.form.cardyear);
  maksDateForm(HTML.form.cardmonth);
}

function maksDateForm(dateForm) {
  IMask(dateForm, {
    mask: "00",
  });
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
