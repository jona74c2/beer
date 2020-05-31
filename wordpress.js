/* Add your JavaScript code here.

If you are using the jQuery library, then don't forget to wrap your code inside jQuery.ready() as follows:

jQuery(document).ready(function( $ ){
    // Your code in here
});

--

If you want to link a JavaScript file that resides on another server (similar to
<script src="https://example.com/your-js-file.js"></script>), then please use
the "Add HTML Code" page, as this is a HTML code that links a JavaScript file.

End of comment */

window.addEventListener("DOMContentLoaded", start);

let siteUrl = "http://beansprout.dk/kea/3.semester/eksamensprojekt/orderform/wordpress/";
let refreshBool = false;
let beerArray = [];
let cashButtonCreated = false;

function start() {
  document.querySelector(".page-item-38 a").textContent = "Cart";
  //document.querySelector(".page-item-39 a").href = "https://beansprout.dk/kea/3.semester/eksamensprojekt/dist/orderform.html";

  //in the basket
  if (window.location.href === siteUrl + "?page_id=38") {
    basketBuilder();
    //on the frontpage
  } else if (window.location.href === siteUrl) {
    setTextFront();
    setPrice();
  }
  //Beer item pages
  else if (window.location.href !== siteUrl + "?page_id=125" && window.location.href !== siteUrl + "?page_id=89") {
    setTextItem();
    setPrice();
  }
}

function getOrderBasket() {
  beerArray = [];
  const quantityArray = document.querySelectorAll("input[type=number]");

  const beernameArray = document.querySelectorAll(".product-name a");

  console.log("qArray: ", quantityArray);
  console.log("beerArray: ", beernameArray);

  quantityArray.forEach((ele) => {
    console.log(ele.value);
  });

  beernameArray.forEach((ele, index) => {
    console.log(ele.textContent);
    beerArray.push(ele.textContent);
    beerArray.push(quantityArray[index].value);
  });

  console.log(beerArray);
}

function firstNumberArray(array) {
  let firstNumberArray = [];
  array.forEach((ele) => {
    firstNumberArray.push(ele.textContent.trim());
  });
  return firstNumberArray;
}

function trimArray(array) {
  let trimmedArray = [];
  array.forEach((ele) => {
    const words = ele.textContent.trim();
    trimmedArray.push(words[0]);
  });
  return trimmedArray;
}

//all these functions are nescessary to call when a button in the cart is pressed, because of an ui refresh on buttonpress in the wordpress theme
function basketBuilder() {
  setTextBasket();
  getOrderBasket();
  if (!refreshBool) {
    setPrice();
    setRemoveButtons();
    setUpdateButton();
    setRestoreButton();
    setPaymentHref();
  }
  refreshBool = true;
}

function setTextBasket() {
  console.log("Text Basket");

  // text fields
  if (document.querySelector(".product-name") !== null) {
    document.querySelector(".product-name").textContent = "Beer";
    document.querySelector(".product-price").textContent = "Price";
    document.querySelector(".product-quantity").textContent = "Quantity";
    document.querySelector(".product-subtotal").textContent = "Total";

    //buttons
    //remove unwanted. Its done through css as it should
    /*     document.querySelector("input[name='coupon_code']").style.display = "none";
    document.querySelector("button[name='apply_coupon']").style.display = "none"; */

    //Change text
    document.querySelector("button[name='update_cart']").textContent = "Update Cart";

    document.querySelector(".wc-proceed-to-checkout a").textContent = "Proceed To Pay With Card";

    if (!cashButtonCreated) {
      let payCash = document.createElement("a");
      payCash.className = "checkout-button button alt wc-forward";
      payCash.textContent = "Proceed To Pay With Cash";
      document.querySelector(".wc-proceed-to-checkout").appendChild(payCash);
      cashButtonCreated = true;
    }
    document.querySelector(".cart_totals h2").textContent = "Shopping cart total";
  } else {
    document.querySelector("a.wc-backward").textContent = "Return To Store";
    document.querySelector(".cart-empty").textContent = "The basket is empty";
  }
  if (document.querySelector(".restore-item") !== null) {
    document.querySelector("a.restore-item").textContent = "Restore?";
    // cant replace the danish word fortryd with this code, as it takes all of the textcontent
    /* const text = document.querySelector(".woocommerce div[role='alert'].woocommerce-message:not(a)").textContent;
    document.querySelector(".woocommerce div[role='alert'].woocommerce-message:not(a)").textContent = text.substring(0, text.length - 16) + "removed."+ text.substring(text.length - 8, text.length) ; */
  }
  /*   if (document.querySelector("div[role='alert']") !== null) {
    const text = document.querySelector("div[role='alert']").textContent;
    document.querySelector("div[role='alert']").textContent = text.substring(0, text.length - 12) + "removed.";
  } */

  //upon removing a item from the cart, the whole thing updates and eventlisteners needs to be activated again
}

//set beer item text for all beers
function setTextItem() {
  document.querySelector(".wc-forward").textContent = "View Cart";
  document.querySelector(".single_add_to_cart_button").textContent = "Add To Cart";
  document.querySelector(".related > h2").textContent = "Customers who bought this beer also bought";

  //Im having trouble creating english messages when there is also a button.
  //The text is not within a tag, so the textcontent selector overwrites all of the text, even the button. So it is danish or lose functionality
  // should ask about this
  //const addedMsg = document.querySelector(".woocommerce-message").textContent;
  //document.querySelector(".woocommerce-message").textContent = addedMsg.substring(0, addedMsg.length - 32) + "added to your cart";
  //document.querySelector(".woocommerce-message a").textContent = "View Cart";

  document.querySelector("#tab-title-description a").textContent = "Description";
  const text = document.querySelector("#tab-title-reviews a").textContent;
  document.querySelector("#tab-title-reviews a").textContent = "Reviews" + text.substring(18, text.length);

  document.querySelector(".woocommerce-Reviews-title").textContent = "Reviews";

  if (document.querySelector(".woocommerce-noreviews") !== null) {
    document.querySelector(".woocommerce-noreviews").textContent = "Be the first to review this beer";
    let replyTitle = document.querySelector("#reply-title").textContent;
    document.querySelector("#reply-title").textContent = "Currently no reviews for" + replyTitle.substr(29, replyTitle.length);
    let replyTitle2 = document.querySelector("#reply-title").textContent;
    document.querySelector("#reply-title").textContent = replyTitle2.substring(0, replyTitle2.length - 14);
  }

  document.querySelector("label[for='rating']").textContent = "Your evaluation";
  document.querySelector("label[for='comment']").placeholder = "Your review";
  document.querySelector("#comment").placeholder = "Your review";
  document.querySelector("input[name='submit']").value = "Submit your review";
  document.querySelector(".woocommerce-Tabs-panel--description > h2").textContent = "Description";
}

function setTextFront() {
  document.querySelectorAll("button[type='submit']").forEach((button) => {
    button.textContent = "Add To Cart";
  });
}

function setPrice() {
  document.querySelectorAll(".woocommerce-Price-amount").forEach((pricetag) => {
    pricetag.textContent = pricetag.textContent.substring(0, pricetag.textContent.length - 7) + ",-";
  });
  document.querySelectorAll(".woocommerce-Price-currencySymbol").forEach((currency) => {
    currency.style.display = "none";
  });
}

function setRemoveButtons() {
  if (document.querySelector(".product-name") !== null) {
    document.querySelectorAll("a.remove").forEach((button) => {
      console.log("hello");
      button.addEventListener("click", function () {
        refreshBool = false;
        timeoutBasketBuilder();
      });
    });
  }
}

function setUpdateButton() {
  if (document.querySelector(".product-name") !== null) {
    document.querySelector("button[name='update_cart']").addEventListener("click", function () {
      refreshBool = false;
      timeoutBasketBuilder();
    });
  }
}

function setRestoreButton() {
  if (document.querySelector("a.restore-item") !== null) {
    document.querySelector("a.restore-item").addEventListener("click", function () {
      refreshBool = false;
      timeoutBasketBuilder();
    });
  }
}

function setPaymentHref() {
  if (document.querySelector(".product-name") !== null) {
    //document.querySelector("a.wc-forward").href = "http://beansprout.dk/kea/3.semester/eksamensprojekt/dist/orderform.html" + "?" + beerArray.toString();
    document.querySelectorAll("a.wc-forward").forEach((button, index) => {
      if (index === 0) {
        button.href = "http://beansprout.dk/kea/3.semester/eksamensprojekt/dist/orderform.html" + "?" + beerArray.toString();
      } else {
        button.href = "http://beansprout.dk/kea/3.semester/eksamensprojekt/dist/orderform.html" + "?" + beerArray.toString() + "&" + "cash";
      }
    });
  }
}

function paymentButton() {
  /*   let paramsString = `${siteUrl}?${beerArray.toString()}`;
  // let searchParams = 
  new URLSearchParams(paramsString);
  window.open("http://beansprout.dk/kea/3.semester/eksamensprojekt/dist/orderform.html", "_self"); */
}

function timeoutBasketBuilder() {
  cashButtonCreated = false;
  setTimeout(basketBuilder, 1500);
  setTimeout(basketBuilder, 2000);
  setTimeout(basketBuilder, 2500);
}
