"use strict";

window.addEventListener("DOMContentLoaded", start);

const settings = {};
const beerCount = {};

function start() {
  settings.firstBuild = true;
  settings.interval = 2000;
  timerFunction();
}

async function getData() {
  const url = "https://holbech-bestbrewer.herokuapp.com/";
  const response = await fetch(url);
  const jsonData = await response.json();

  console.log(jsonData);
  return jsonData;
}

async function timerFunction() {
  let orderData = await getData();
  if (Object.keys(orderData).length > 0 && orderData.constructor === Object) {
    builder(orderData);
  }

  setTimeout(timerFunction, settings.interval);
}

function builder(orderData) {
  if (orderData === undefined) {
    console.log("Return return");
    return;
  }
  let orderDataArray = [];
  if (settings.firstBuild) {
    initBeerCount(orderData);
    orderDataArray = initOrderData(orderData);
    settings.firstBuild = false;
  } else {
    orderDataArray = updateOrderData(orderData);
    console.log("orderDataArray: ", orderDataArray);
  }
  if (orderDataArray.length > 0) {
    countBeer(orderDataArray);
    console.log("We are in!");
  } else {
    console.log("no updates");
  }
}

function updateOrderData(orderData) {
  let subArray = [];
  if (orderData.serving === undefined) {
    return subArray;
  }

  console.log("lastArrayItem: ", beerCount.lastArrayItem);
  beerCount.foundLastArrayItem = false;

  subArray = addNewOrders(orderData.serving).concat(addNewOrders(orderData.queue));
  /* let temp = addNewOrders(orderData.queue);
  subArray = subArray.concat(temp); */
  if (orderData.serving === undefined) {
    beerCount.lastArrayItem = orderData.serving[orderData.serving.length - 1];
  } else {
    beerCount.lastArrayItem = orderData.queue[orderData.queue.length - 1];
  }

  if (!beerCount.foundLastArrayItem) {
    return orderData.serving.concat(orderData.queue);
  }
  return subArray;
}

function addNewOrders(array) {
  let subArray2 = [];
  array.forEach((order) => {
    console.log("order: ", order);
    if (beerCount.foundLastArrayItem) {
      subArray2.push(order);
      console.log("item pushed pushed");
    } else if (beerCount.lastArrayItem !== undefined && order.id === beerCount.lastArrayItem.id) {
      beerCount.foundLastArrayItem = true;
      console.log("item found!", order.id, " ", beerCount.lastArrayItem.id);
    }
  });
  return subArray2;
}

function initOrderData(orderData) {
  console.log(orderData);
  orderData = orderData.serving.concat(orderData.queue);
  if (orderData.queue !== undefined) {
    beerCount.lastArrayItem = orderData.queue[orderData.queue.length - 1];
  }
  return orderData;
}

function initBeerCount(orderData) {
  orderData.taps.forEach((tap, index) => {
    beerCount["beerTap" + index] = tap.beer;
    beerCount["ordersTap" + index] = 0;
  });
  console.group(beerCount);
}

function countBeer(orderData) {
  console.log(orderData);
  // orderData
  orderData.forEach((order) => {
    order.order.forEach((beer) => {
      for (let i = 0; i < 7; i++) {
        if (beerCount["beerTap" + i] === beer) {
          beerCount["ordersTap" + i]++;
        }
      }
    });
  });
  console.log(beerCount);
}

/* function setLogData() {
  if (logData.length > 4) {
    logData.shift();
    hideDiv();
  }
  logData.push(jsonData);
  console.table(logData);
  createDiv();
}

function createDiv() {
  const templatePointer = document.querySelector("template");
  let bar = templatePointer.content.cloneNode(true);
  console.log(bar);

  const section = document.querySelector("#bar");

  const peopleInQ = logData[logData.length - 1].inQueue;
  bar.querySelector("div").style.height = peopleInQ * 10 + "px";
  bar.querySelector("div").style.marginTop = 250 - peopleInQ * 10 + "px";
  bar.querySelector("span").textContent = peopleInQ;
  bar.querySelector("article").classList.add("insert");
  bar.querySelector("article").addEventListener("animationend", removeAni);

  section.appendChild(bar);
}

function removeAni() {
  console.log(this);
  this.classList.remove("insert");
}

function hideDiv() {
  const firstDiv = document.querySelector("article");
  console.log(firstDiv);
  firstDiv.classList.add("remove");
  firstDiv.addEventListener("animationend", slideDiv);
}

function slideDiv() {
  document.querySelectorAll("article").forEach((element) => {
    console.log(element);
    element.classList.add("slide");
    document.querySelector("article").addEventListener("animationend", removeDiv);
  });
}

function removeDiv() {
  document.querySelectorAll("article").forEach((element) => {
    element.classList.remove("slide");
  });
  console.log("animationend");
  const firstDiv = document.querySelector(".remove");
  firstDiv.remove();
}
 */
