"use strict";

window.addEventListener("DOMContentLoaded", start);

let jsonData;
const settings = {};
const logData = [];

function start() {
  settings.interval = 2000;

  timerFunction();
}

async function getData() {
  const url = "https://holbech-bestbrewer.herokuapp.com/";
  const response = await fetch(url);
  jsonData = await response.json();
  console.table(jsonData);
}

function timerFunction() {
  getData();
  setTimeout(timerFunction, settings.interval);
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
