console.log(firebase);
const auth = firebase.auth();
console.log(auth.currentUser);
const db = firebase.firestore();
// console.log("DATABSE", db);
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const provider = new firebase.auth.GoogleAuthProvider();
const userDetails = document.getElementById("user-details");
const inputText = document.getElementById("todo-input");

// console.log(provider);

let thingsRef;
let unsubscribe;
let orderedThings;

/*
step 1. sign in..
step 2. render items from firebase if signed in. display "you have no todos yet" for new User
step 3. render items from localStorage if not signed in. display "Sign in to sync your ToDos" for new User
step 4. add item to firebase if signed in
step 5. add item to localstorage if not signed in
step 6. sign out
 */

signInBtn.addEventListener("click", function () {
  auth.signInWithPopup(provider);
});

signOutBtn.addEventListener("click", function () {
  auth.signOut();
});

function addItemToLocalStorage() {}

function addItemToDatabse(user) {
  const { serverTimestamp } = firebase.firestore.FieldValue;
  db.collection("todo-items").add({
    userId: user.uid,
    text: inputText.value,
    status: "active",
    createdOn: serverTimestamp(),
  });
  inputText.value = "";
}

function addItem(event) {
  event.preventDefault();
  addItemToLocalStorage(event);
  inputText.value = "";
}

function getAndSortItems(user) {
  unsubscribe = db
    .collection("todo-items")
    .where("userId", "==", user.uid)
    .orderBy("createdOn", "desc")
    .onSnapshot((snapshot) => {
      const items = [];
      items = snapshot.docs.map((doc) => {
        const newItem = {
          docId: doc.id,
          ...doc.data(),
        };
        return newItem;
      });
      renderItems(items);
    });
}

function renderItems(items) {
  const itemsDiv = items.map((item) => createItemDiv(item));
  document.querySelector(".todo-items").replaceChildren(...itemsDiv);
}

function createItemDiv(item) {
  const itemDiv = createNewDOMElement("div", "todo-item");
  // itemDiv.classList.add("todo-item");

  const checkDiv = createNewDOMElement("div", "check");
  // checkDiv.classList.add("check");

  const checkMarkDiv = createNewDOMElement("div", `check-mark.${item.status}`);
  // checkMarkDiv.classList.add("check-mark");
  // checkMarkDiv.classList.add(item.status);
  checkMarkDiv.setAttribute("data-id", item.id);
  checkMarkDiv.addEventListener("click", function (event) {
    //   console.log(event.target.dataset.id);
    markCompleted(event.target.dataset.id);
  });

  const checkImg = document.createElement("img");
  checkImg.src = "./assets/icon-check.svg";

  checkMarkDiv.append(checkImg);
  checkDiv.append(checkMarkDiv);

  const textDiv = createNewDOMElement("div", `todo-text.${item.status}`);
  // textDiv.classList.add("todo-text");
  // textDiv.classList.add(item.status);
  textDiv.textContent = item.text;

  itemDiv.append(checkDiv);
  itemDiv.append(textDiv);

  return itemDiv;
}

//---- Generic function to create new DOM element with specified classes
//---- TODO: Add options for attributes and textcontent

function createNewDOMElement(elemType = "div", classesList = "") {
  const newDOMElement = document.createElement(elemType);
  classesList.split(".").forEach((classListElement) => {
    newDOMElement.classList.add(classListElement);
  });
  return newDOMElement;
}

//---- Mark to do as completed

function markCompleted(itemId) {
  //   console.log("mark complted");
  let currentItem = db.collection("todo-items").doc(itemId);
  currentItem.get().then(function (doc) {
    if (doc.exists) {
      let status = doc.data().status;
      if (status === "active") {
        currentItem.update({
          status: "completed",
        });
      } else if (status === "completed") {
        currentItem.update({
          status: "active",
        });
      }
    }
  });
}

// getItems();

auth.onAuthStateChanged(function (user) {
  if (user) {
    userDetails.innerText = `${user.displayName}`;
    signInBtn.style.display = "none";
    signOutBtn.style.display = "flex";
    getAndSortItems(user);
    addItemToDatabse(user);
    // sortAndRenderItems();
    // UPDATE DONE
  } else {
    signInBtn.style.display = "flex";
    signOutBtn.style.display = "none";
    unsubscribe && unsubscribe();
  }
});
