"use strict";

window.addEventListener("DOMContentLoaded", start);

const settings = {};
const beerCount = {};
const bartendersPrev = {};

function start() {
  initSettings();
  initHTML();
  timerFunction();
}

function initSettings() {
  settings.firstBuild = true;
  settings.interval = 2000;
  settings.queue = -1;
  beerCount.prev = [];
  beerCount.initRank = true;
  bartendersPrev.working = [false, false, false];
  bartendersPrev.order = [-1, -1, -1];
}

function initHTML() {
  const root = document.documentElement;
  const svgContainer = document.querySelector(".svg_container");
  let rect = svgContainer.getBoundingClientRect();

  /* console.log("width; ", rect.width); */
  root.style.setProperty("--svg-height", rect.width - 40 + "px");
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
    /* console.log("Return return"); */
    return;
  }

  //Get new orders, and count beers
  let orderDataObject = getOrders(orderData);

  if (orderDataObject.everyNewOrder !== undefined) {
    countBeer(orderDataObject.everyNewOrder);
    /* console.log("We are in!"); */
  }

  // Update UI
  if (orderDataObject.newQueueOrders.length > 0) {
    updateUIQueue(orderDataObject.newQueueOrders);
  }
  const amountRemoveFromQueue = settings.queue - orderData.queue.length + orderDataObject.newQueueOrders.length;
  if (settings.queue === -1) {
    /* console.log("! -1 init val"); */
  } else if (amountRemoveFromQueue > 0) {
    removeFromUIQueue(settings.queue - orderData.queue.length + orderDataObject.newQueueOrders.length);
  }
  updateServing(orderData.bartenders, orderData.serving);

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
    /* console.log("orderDataObject: ", orderDataObject.everyNewOrder); */
  }
  return orderDataObject;
}

function updateOrderData(orderData) {
  let everyNewOrder = [];
  let newQueueOrders = [];
  if (orderData.serving === undefined) {
    return { everyNewOrder, newQueueOrders };
  }
  /* console.log("lastArrayItem: ", beerCount.lastArrayItem); */
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
      /* console.log("item found!", order.id, " ", beerCount.lastArrayItem.id); */
    }
  });
  return subArray2;
}

function initOrderData(orderData) {
  //this line add all orders to the queue, but those who are being served is not needed
  //let everyNewOrder = orderData.serving.concat(orderData.queue);
  let everyNewOrder = orderData.queue;
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
  /* console.log(orderData); */
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
  /* console.log(beerCount); */
  rankBeer();
}

function rankBeer() {
  let beerArray = beerCountObjectToArray();
  //sort the array in order of most sold beers
  beerArray = beerArray.sort(compare);
  let prev;
  //remove dublicates - needed because of risk of one beer on multiple taps blocking out another
  //check for identical neighbors, because two same beers will always have the same amount of sales
  //remove identical
  for (let i = 0; i < beerArray.length; i++) {
    if (beerArray[i][1] === prev) {
      /* console.log("match between: ", beerArray[i][1], prev); */
      prev = beerArray[i - 1][1];

      beerArray.splice(i, 1);
      i--;
    } else {
      //console.log("not a match between: ", beerArray[i][1], prev);
      prev = beerArray[i][1];
    }
  }
  updateUIRank(beerArray);
}

function compare(a, b) {
  if (a[0] > b[0]) return -1;
  if (b[0] > a[0]) return 1;
  else if (a[1] > b[1]) return -1;
  else if (b[1] > a[1]) return 1;
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
      /* console.log("new orders in queue: ", newQueueOrders); */
      newQueueOrders.forEach((order) => {
        createUIOrder(order);
      });
    }
  }
}

function createUIOrder(order) {
  const templatePointer = document.querySelector("#orderTemplate");
  let clone = templatePointer.content.cloneNode(true);

  const list = document.querySelector("#blackboard_list");
  /* console.log(order); */
  order.order.forEach((beer) => {
    let beerImg = document.createElement("img");
    beerImg.src = "./dashboard/img/beericon.png";
    clone.querySelector("article").appendChild(beerImg);
  });

  clone.querySelector("span").textContent = order.id;
  //set animations
  clone.querySelector("article").classList.add("insert");
  clone.querySelector("article").addEventListener("animationend", removeInsertAni);
  //clone.querySelector("article").addEventListener("animationend", removeAni);

  list.appendChild(clone);
}

function removeInsertAni() {
  this.classList.remove("insert");
  this.removeEventListener("animationend", removeInsertAni);
}

function removeFromUIQueue(number) {
  /* console.log("remove from queue: ", number); */
  let orders = document.querySelectorAll("#blackboard article");
  for (let i = 0; i < number; i++) {
    if (orders[i] !== undefined) {
      orders[i].classList.add("remove");
      setTimeout(deleteOrder, 2300);
    } else {
      console.log(orders[i]);
      orders.splice(i, 1);
      i--;
    }
    //deleteOrder();
  }
  setTimeout(function () {
    moveQueueUp(number);
  }, 1795);
}

function deleteOrder() {
  document.querySelector("#blackboard article").remove();
}

function moveQueueUp(number) {
  let queueToMove = document.querySelectorAll("#blackboard article:not([remove])");
  const root = document.documentElement;
  root.style.setProperty("--moveup-number", number);
  queueToMove.forEach((ele, index) => {
    if (index >= number) {
      ele.classList.add("moveup");
    }
  });
  queueToMove[queueToMove.length - 1].addEventListener("animationend", removeMoveUp);
}

function removeMoveUp() {
  let queueToMove = document.querySelectorAll("#blackboard article:not([remove])");
  queueToMove.forEach((ele) => {
    ele.classList.remove("moveup");
    ele.removeEventListener("animationend", removeMoveUp);
  });
}

function updateUIRank(beerArray) {
  /* console.log(beerArray); */
  let currentRanking = [];
  const rankImgs = document.querySelectorAll("#ranking img");
  beerArray.forEach((ele, index) => {
    beerArray[index][1] = beerArray[index][1].toLowerCase();
    let words = beerArray[index][1].split(" ");
    words = words.join("");
    currentRanking.push(words);
    /*     console.log(words);
    if (index < 3) {
      img.src = `./dashboard/img/beerimages/${words}.png`;
    } else if (index > beerArray.length - 3) {
      img.src = `./dashboard/img/beerimages/${words}.png`;
    } */
  });
  if (beerCount.initRank) {
    initUIRankImg(currentRanking);
  } else {
    updateUIRankImg(currentRanking);
  }

  beerCount.prev = currentRanking;
}

function updateUIRankImg(currentRanking) {
  const rankImgs = document.querySelectorAll("#ranking img");
  if (JSON.stringify(currentRanking) === JSON.stringify(beerCount.prev)) {
    /* console.log("No changes in rank this time around"); */
    return;
  } else {
    /* console.log("Time to change ranking"); */
    currentRanking.forEach((ele, index) => {
      if (ele !== beerCount.prev[index] && index < 3) {
        /* console.log("we are in upper if statement: "); */
        setRotateShiftAni(rankImgs[index], `./dashboard/img/beerimages/${ele}.png`);
      } else if (ele !== beerCount.prev[index] && index > currentRanking.length - 3) {
        /* console.log("we are in lower if statement: "); */
        setRotateShiftAni(rankImgs[rankImgs.length - currentRanking.length + index], `./dashboard/img/beerimages/${ele}.png`);
      }
    });
  }
}

function initUIRankImg(currentRanking) {
  const rankImgs = document.querySelectorAll("#ranking img");
  currentRanking.forEach((ele, index) => {
    if (index < 3) {
      rankImgs[index].src = `./dashboard/img/beerimages/${ele}.png`;
    } else if (index > currentRanking.length - 3) {
      rankImgs[rankImgs.length - currentRanking.length + index].src = `./dashboard/img/beerimages/${ele}.png`;
    }
  });
  beerCount.initRank = false;
}

function setRotateShiftAni(img, src) {
  /* console.log("we are in rotateShift: ", img, src); */
  img.classList.add("rotateShift");
  img.addEventListener("animationend", removeRotateShift);
  setTimeout(function () {
    setRankImg(img, src);
  }, 150);
}

function setRankImg(img, src) {
  img.src = src;
}

function removeRotateShift() {
  this.classList.remove("rotateShift");
}

function updateServing(bartenders, serving) {
  bartendersPrev.working.forEach((working, index) => {
    if (bartenders[index].servingCustomer !== null) {
      let curCustomer = bartenders[index].servingCustomer;
      if (!working && curCustomer !== bartendersPrev.order[index]) {
        bartendersPrev.working[index] = true;
        bartendersPrev.order[index] = curCustomer;
        let svg = document.querySelectorAll("svg");
        svg[index].querySelector("[data-name='Layer 1'] > path").classList.add("dash");

        setTimeout(function () {
          beginPourBeer(serving, curCustomer, index);
        }, 2000);
        /*       svg[index].querySelector("[data-name='Layer 1'] > path").addEventListener("animationend", function () {
        beginPourBeer(serving, curCustomer);
      }); */
      }
    }
  });
}

function beginPourBeer(serving, curCustomer, bartender) {
  serving.forEach((order, index) => {
    console.log("order: ", order.id, "current customer; ", curCustomer);
    if (order.id === curCustomer) {
      const orderNum = document.querySelectorAll(".serving_number");
      orderNum[bartender].textContent = order.id;
      console.log("pour ", order.order.length, " beers matey!");
      setPourAnimations(index, order.order.length, bartender);
    }
  });
}

/* function setPourAnimations(index, amount) {
  const mugs = document.querySelectorAll(".mug");

  const root = document.documentElement;
  root.style.setProperty("--pour-ani-count", amount);

  mugs[index].classList.add("beerPour");
  mugs[index].addEventListener("animationend", removePourAnimation);
  removeDraftBeer(index);
} */

function setPourAnimations(index, amount, bartender) {
  let i = 0;
  while (i < amount) {
    setTimeout(function () {
      setPourAnimation(bartender);
    }, 6000 * i);

    i++;
  }

  setTimeout(function () {
    removeDraftBeer(bartender);
  }, 6000 * amount);
}

function setPourAnimation(index) {
  console.log("Is it last already? ");
  const mugs = document.querySelectorAll(".mug");
  mugs[index].classList.add("beerPour");
  mugs[index].addEventListener("animationend", removePourAnimation);
  /*      if (isLast) {
    mugs[index].addEventListener("animationend", function () {
      removeDraftBeer(index);
    }); */
}

/* pourAnimationFinish(){

} */

function removePourAnimation() {
  this.classList.remove("beerPour");
}

function removeDraftBeer(index) {
  console.log("Is it last already? ");
  let svg = document.querySelectorAll("svg");
  svg[index].querySelector("[data-name='Layer 1'] > path").classList.remove("dash");
  svg[index].querySelector("[data-name='Layer 1'] > path").classList.add("unDash");
  setTimeout(function () {
    bartenderOrderDone(index);
  }, 2000);
  /*   svg[index].querySelector("[data-name='Layer 1'] > path").addEventListener("animationend", function () {
    bartenderOrderDone(index);
  }); */
}

function bartenderOrderDone(index) {
  let svg = document.querySelectorAll("svg");
  svg[index].querySelector("[data-name='Layer 1'] > path").classList.remove("unDash");
  bartendersPrev.working[index] = false;
  console.log(bartendersPrev.working[index]);
  console.log("index: ", index);
  const orderNum = document.querySelectorAll(".serving_number");
  //wanted to use textContent instead of innerHTML. InnerHTML is not as secure, but it can create blank spaces that is actually there so the text dont jump.
  orderNum[index].innerHTML = "&nbsp;";
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
}*/
