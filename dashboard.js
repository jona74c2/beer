"use strict";

window.addEventListener("DOMContentLoaded", start);

const settings = {};
const beerCount = {};

function start() {
  settings.firstBuild = true;
  settings.interval = 2000;
  settings.queue = -1;
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
  let orderDataObject = getOrders(orderData);

  if (orderDataObject.everyNewOrder !== undefined) {
    countBeer(orderDataObject.everyNewOrder);
    console.log("We are in!");
  }
  updateUIQueue(orderDataObject.newQueueOrders);
  if (settings.queue === -1) {
    console.log("! -1 init val");
  } else {
    removeFromUIQueue(settings.queue - orderData.queue.length + orderDataObject.newQueueOrders.length);
  }

  settings.queue = orderData.queue.length;
}

function getOrders(orderData) {
  let orderDataObject;
  if (settings.firstBuild) {
    initBeerCount(orderData);
    orderDataObject = initOrderData(orderData);
    settings.firstBuild = false;
  } else {
    orderDataObject = updateOrderData(orderData);
    console.log("orderDataObject: ", orderDataObject.everyNewOrder);
  }
  return orderDataObject;
}

function updateOrderData(orderData) {
  let everyNewOrder = [];
  let newQueueOrders = [];
  if (orderData.serving === undefined) {
    return { everyNewOrder, newQueueOrders };
  }
  console.log("lastArrayItem: ", beerCount.lastArrayItem);
  beerCount.foundLastArrayItem = false;

  newQueueOrders = addNewOrders(orderData.queue);
  everyNewOrder = addNewOrders(orderData.serving).concat(newQueueOrders);
  setLastArrayItem(orderData);

  if (!beerCount.foundLastArrayItem) {
    everyNewOrder = orderData.serving.concat(orderData.queue);
    newQueueOrders = orderData.queue;
    return { newQueueOrders, newQueueOrders };
  }
  return { everyNewOrder, newQueueOrders };
}

function setLastArrayItem(orderData) {
  if (orderData.serving === undefined) {
    beerCount.lastArrayItem = -1;
    beerCount.lastArrayItem.id = -1;
  } else if (orderData.queue === undefined) {
    beerCount.lastArrayItem = orderData.serving[orderData.serving.length - 1];
  } else {
    beerCount.lastArrayItem = orderData.queue[orderData.queue.length - 1];
  }
}
function addNewOrders(array) {
  let subArray2 = [];
  array.forEach((order) => {
    if (beerCount.foundLastArrayItem) {
      subArray2.push(order);
    } else if (beerCount.lastArrayItem !== undefined && order.id === beerCount.lastArrayItem.id) {
      beerCount.foundLastArrayItem = true;
      console.log("item found!", order.id, " ", beerCount.lastArrayItem.id);
    }
  });
  return subArray2;
}

function initOrderData(orderData) {
  let everyNewOrder = orderData.serving.concat(orderData.queue);
  if (orderData.queue !== undefined) {
    beerCount.lastArrayItem = orderData.queue[orderData.queue.length - 1];
  }
  let newQueueOrders = [...everyNewOrder];
  return { everyNewOrder, newQueueOrders };
}

function initBeerCount(orderData) {
  orderData.taps.forEach((tap, index) => {
    beerCount["beerTap" + index] = tap.beer;
    beerCount["ordersTap" + index] = 0;
  });
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
  rankBeer();
}

function rankBeer() {
  let beerArray = beerCountObjectToArray();
  //sort the array in order of most sold beers
  beerArray = beerArray.sort(compare);
  let prev;
  beerArray.forEach((ele, index) => {
    //remove dublicates - needed because of risk of one beer on multiple taps blocking out another
    //check for identical neighbors, because two same beers will always have the same amount of sales
    //remove identical
    if (ele[1] === prev) {
      beerArray.splice(index, 1);
    }
    prev = ele[1];
  });
  updateUIRank(beerArray);
}

function compare(a, b) {
  if (a[0] > b[0]) return -1;
  if (b[0] > a[0]) return 1;
  return 0;
}

function beerCountObjectToArray() {
  let beerArray = [];
  for (let i = 0; i < 7; i++) {
    beerArray[i] = new Array(2);
    beerArray[i][0] = beerCount["ordersTap" + i];
    beerArray[i][1] = beerCount["beerTap" + i];
  }
  return beerArray;
}

function updateUIQueue(newQueueOrders) {
  if (newQueueOrders !== undefined) {
    if (newQueueOrders.length > 0) {
      console.log("new orders in queue: ", newQueueOrders);
    }
  }
}

function removeFromUIQueue(number) {
  console.log("remove from queue: ", number);
}

function updateUIRank(beerArray) {
  console.log(beerArray);
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
