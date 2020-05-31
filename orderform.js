"use strict";
import IMask from "imask";
window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
//const logData = [];
const HTML = {};

function start() {
  //document.querySelector("#order").addEventListener("click", cardnumberValidate);

  initObejcts();
  setBeersOrdered();
  initForm();

  //timerFunction();
  //post();
}

function initObejcts() {
  initSettings();
  initHTMLpointers();
}

function initForm() {
  if (!settings.cashPay) {
    initMasks();
    cardnumberValidate();
    getDate();
    initDateForm();
  }
  initEventlisteners();
}

function initSettings() {
  settings.endpointOrder = "https://holbech-bestbrewer.herokuapp.com/order/";
  settings.endpoint = "https://holbech-bestbrewer.herokuapp.com/";
  settings.interval = 2000;
  settings.cardnumberMaskBool = true;
  settings.beerRate = 50;
  settings.cashPay = false;
}

function initHTMLpointers() {
  HTML.form = document.querySelector("form");
}

function setBeersOrdered() {
  const order = getUrlParams();
  if (order !== undefined) {
    let price = 0;
    for (let i = 0; i < order.length; i++) {
      //modolus is added to prevent an i+2 infinite loop
      if (i % 2 === 0) {
        createUIOrder(order[i], order[i + 1]);
        console.log(settings.beerRate);
        price += Number(order[i + 1]) * settings.beerRate;
      }
    }
    document.querySelector("#order_total").textContent = `${price} kr`;
  }
}

function createUIOrder(beer, amount) {
  const templatePointer = document.querySelector("#orderTemplate");
  let clone = templatePointer.content.cloneNode(true);

  const list = document.querySelector("#list");

  clone.querySelector("img").src = "./dashboard/img/beericon.png";

  clone.querySelector(".beer_amount").textContent = amount + " x ";
  clone.querySelector(".beer_name").textContent = beer;

  list.appendChild(clone);
}

function getUrlParams() {
  let params = new URL(document.location);
  params = params.toString();

  if (params.indexOf("?") === -1) {
    return;
  } else if (params.indexOf("&cash") !== -1) {
    params = params.substring(params.indexOf("?") + 1, params.length - 5);
    settings.cashPay = true;
    cashPay();
  } else {
    params = params.substring(params.indexOf("?") + 1, params.length);
  }

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

function cashPay() {
  HTML.form.style.display = "none";
  document.querySelector("#payment").textContent = "Cash Payment";
}

function initMasks() {
  initCodenumberMask();
  initCardnumberMask();
}

function initEventlisteners() {
  if (settings.cashPay) {
    document.querySelector("#order").addEventListener("click", post);
  }
  HTML.form.cardnumber.addEventListener("input", cardnumberValidate);
  document.querySelector("#order").addEventListener("click", paymentCardCheck);
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

function paymentCardCheck() {
  console.log(HTML.form.cardnumber.validity.valid);
  console.log(HTML.form.cardnumber);
  const formArray = [HTML.form.cardnumber, HTML.form.cardmonth, HTML.form.cardyear, HTML.form.controlnumber];
  if (checkCardInput(formArray)) {
    post();
  }
}

function checkCardInput(formArray) {
  let bool = true;
  formArray.forEach((input) => {
    console.log(input);
    if (!input.validity.valid) {
      console.log("input invalid");
      bool = false;
    }
  });
  return bool;
}
/* 
async function getData() {
  const response = await fetch(settings.endpoint, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  jsonData = await response.json();
  console.log(jsonData);
} */

/* function timerFunction() {
  getData();
  setTimeout(timerFunction, settings.interval);
} */

async function post() {
  let order = getUrlParams();
  order = readyParamsForPost(order);
  setLoadIcon();
  //const order = [{ name: "Hoppily Ever After", amount: 10 }];
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
  //stopLoadIcon();
  console.log(jsonData);
  checkPostMessage(jsonData);
}

function readyParamsForPost(paramsArray) {
  let returnArray = [];
  for (let i = 0; i < paramsArray.length; i++) {
    const returnObj = {};
    //modolus is added to prevent an i+2 infinite loop
    if (i % 2 === 0) {
      returnObj.name = paramsArray[i];
      returnObj.amount = paramsArray[i + 1];
      returnArray.push(returnObj);
    }
  }
  return returnArray;
}

function setLoadIcon() {
  document.querySelector("#loading_img").classList.add("rotate_load");
}

function checkPostMessage(jsonData) {
  if (jsonData.message === "added") {
    //set form animation
    document.querySelector("#formsection").classList.add("hide_content");
    document.querySelector("#formsection").addEventListener("animationend", function () {
      document.querySelector("#formsection").style.display = "none";
      showOrderId(jsonData.status);
    });
  } else {
    document.querySelector("#errormsg").textContent = jsonData.message;
    document.querySelector("#order_fail").style.opacity = "1";
    document.querySelector("#formsection img").classList.add("hide_content");
  }
}

function showOrderId(orderNumber) {
  document.querySelector("#order_succes").classList.add("unhide_content");

  document.querySelector("#order_succes h3").textContent = orderNumber;
  if (settings.cashPay) {
    document.querySelector("#paymentDetails").textContent = "Pay when you pickup your order";
  } else {
    document.querySelector("#paymentDetails").textContent = "Your order is payed for";
  }
  /* document.querySelector("#order_succes button").href = orderNumber; */

  document.querySelector("#order_succes").style.opacity = "1";
}

function cardnumberValidate() {
  //API: https://www.npmjs.com/package/card-validator

  const cardNumber = getCardNumber();
  if (cardNumber === undefined) {
    return;
  }
  let valid = require("card-validator");
  let numberValidation = valid.number(cardNumber);

  if (checkValidCard(cardNumber, numberValidation)) {
    /* console.log(numberValidation.card.type); */
    setCardnumberMask(numberValidation.card.lengths, numberValidation.card.gaps);
    setControlnumberMask(numberValidation.card.code.size);
    /* console.log("numberValidation.card.code.size: ", numberValidation.card.code.size); */
  }
}

function getCardNumber() {
  if (HTML.form.cardnumber.value.length < 4) {
    console.log("Cardnumber Validation terminated");
    return;
  } else {
    return HTML.form.cardnumber.value;
  }
}

function checkValidCard(cardNumber, numberValidation) {
  /*   let valid = require("card-validator");
  let numberValidation = valid.number(cardNumber); */

  if (numberValidation.card.type != null && numberValidation.isPotentiallyValid) {
    return true;
  }
  return false;
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
