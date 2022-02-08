console.log(firebase);
const auth = firebase.auth();
console.log(auth.currentUser);
const db = firebase.firestore();
// console.log("DATABSE", db);
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");

const userSignedIn = document.getElementById("user-signed-in");
const userSignedOut = document.getElementById("user-signed-out");
const inputText = document.getElementById("todo-input");
const clearCompleted = document.querySelector(".items-clear");
// const todoItems = [];
const provider = new firebase.auth.GoogleAuthProvider();
let todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];

let unsubscribe;

document.getElementById("all").classList.add("active");
document.getElementById("active").classList.remove("active");

function addItem(event) {
  event.preventDefault();
  // console.log(inputText.value);

  const item = createNewItem(inputText.value);
  // addItemToDOM(item);
  // console.log(item);
  todoItems.unshift(item);
  localStorage.setItem("todoItems", JSON.stringify(todoItems));

  if (auth.currentUser !== null) {
    const { serverTimestamp } = firebase.firestore.FieldValue;
    const itemId = auth.currentUser.displayName + item.localId;
    let dbItem = db.collection("todo-items").doc(itemId);
    dbItem.set(
      {
        userId: auth.currentUser.uid,
        createdOn: serverTimestamp(),
        ...item,
      },
      { merge: true }
    );
  }

  renderItems();
  inputText.value = "";
}

function renderItems() {
  let itemToRender;
  if (document.getElementById("active").classList.contains("active")) {
    itemToRender = "activeTodoItems";
  } else if (
    document.getElementById("completed").classList.contains("active")
  ) {
    itemToRender = "completedTodoItems";
  } else {
    itemToRender = "todoItems";
  }
  let items = JSON.parse(localStorage.getItem(itemToRender)) || [];
  // console.log(items);
  const itemDivs = items.map((item) => {
    const itemDiv = createItemDiv(item);
    return itemDiv;
  });
  document.querySelector(".todo-items").replaceChildren(...itemDivs);
  document.querySelector(
    ".items-left"
  ).textContent = `${itemDivs.length} items left`;
}

function createNewItem(value) {
  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  let tempId = todoItems[0]?.localId + 1 || 1;
  console.log(tempId);
  const item = {
    localId: tempId,
    text: value,
    status: "active",
  };

  return item;
}

function addItemToDOM(item) {
  const itemDiv = createItemDiv(item);
  document.querySelector(".todo-items").prepend(itemDiv);
}

function createItemDiv(item) {
  const itemDiv = createNewDOMElement("div", "todo-item");
  // itemDiv.classList.add("todo-item");

  const checkDiv = createNewDOMElement("div", "check");
  // checkDiv.classList.add("check");

  const checkMarkDiv = createNewDOMElement("div", `check-mark ${item.status}`);
  // checkMarkDiv.classList.add("check-mark");
  // checkMarkDiv.classList.add(item.status);
  checkMarkDiv.setAttribute("data-id", item.localId);
  checkMarkDiv.addEventListener("click", function () {
    console.log(checkMarkDiv.dataset.id);
    updateToDoStatus(checkMarkDiv.dataset.id);
    filterActiveItems();
  });

  const checkImg = document.createElement("img");
  checkImg.src = "./assets/icon-check.svg";

  checkMarkDiv.append(checkImg);
  checkDiv.append(checkMarkDiv);

  const textDiv = createNewDOMElement("div", `todo-text ${item.status}`);
  // textDiv.classList.add("todo-text");
  // textDiv.classList.add(item.status);
  textDiv.textContent = item.text;

  itemDiv.append(checkDiv);
  itemDiv.append(textDiv);

  return itemDiv;
}

function createNewDOMElement(elemType = "div", classesList = "") {
  const newDOMElement = document.createElement(elemType);
  // classesList.split(".").forEach((classListElement) => {
  //   newDOMElement.classList.add(classListElement);
  // });
  newDOMElement.className = classesList;
  // console.log(newDOMElement);
  return newDOMElement;
}

function updateToDoStatus(itemId) {
  updateInLocalStorage(itemId);
  renderItems();
}

function updateInLocalStorage(itemId) {
  // console.log("ITEM ID", itemId);

  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  // console.log(todoItems);
  const updatedToDoItems = todoItems.map((item) => {
    // todoItems.forEach((item) => {
    let newItem = {};
    if (item.localId === parseInt(itemId)) {
      if (item.status === "active") {
        newItem = { ...item, status: "completed" };
      } else {
        newItem = { ...item, status: "active" };
      }
      // newItem =
      //   item.status === "active"
      //     ? { ...item, status: "completed" }
      //     : { ...item, status: "active" };
    } else {
      newItem = { ...item };
    }
    return newItem;
  });
  // console.log(updatedToDoItems);
  // console.log(todoItems);
  localStorage.setItem("todoItems", JSON.stringify(updatedToDoItems));
  // renderItems();
}

function filterActiveItems() {
  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  const activeTodoItems = todoItems.filter((item) => item.status === "active");
  localStorage.setItem("activeTodoItems", JSON.stringify(activeTodoItems));
  // document.getElementById("active").classList.add("active");
  // document.getElementById("all").classList.remove("active");
  // document.getElementById("completed").classList.remove("active");

  // console.log(activeTodoItems);
}

function filterCompletedItems() {
  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  const completedTodoItems = todoItems.filter(
    (item) => item.status === "completed"
  );
  localStorage.setItem(
    "completedTodoItems",
    JSON.stringify(completedTodoItems)
  );

  // renderItems();
  // console.log(activeTodoItems);
}

function showAllItems() {
  // todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  document.getElementById("all").classList.add("active");
  document.getElementById("active").classList.remove("active");
  document.getElementById("completed").classList.remove("active");
  renderItems();
}

signInBtn.addEventListener("click", function () {
  auth.signInWithPopup(provider);
});

signOutBtn.addEventListener("click", function () {
  auth.signOut();
});

document.getElementById("active").addEventListener("click", function () {
  filterActiveItems();
  document.getElementById("active").classList.add("active");
  document.getElementById("all").classList.remove("active");
  document.getElementById("completed").classList.remove("active");
  renderItems();
});

document.getElementById("completed").addEventListener("click", function () {
  filterCompletedItems();
  document.getElementById("completed").classList.add("active");
  document.getElementById("all").classList.remove("active");
  document.getElementById("active").classList.remove("active");
  renderItems();
});
document.getElementById("all").addEventListener("click", showAllItems);

clearCompleted.addEventListener("click", function () {
  clearCompletedItems();
  renderItems();
});

auth.onAuthStateChanged((user) => {
  if (user) {
    signInBtn.style.display = "none";
    signOutBtn.style.display = "flex";
    userSignedOut.style.display = "none";
    userSignedIn.textContent = `Signed in as: ${user.displayName}`;
    syncLocalStorageAndDb(user);
  } else {
    signInBtn.style.display = "flex";
    signOutBtn.style.display = "none";
    userSignedOut.textContent = `You are signed out`;
    userSignedIn.style.display = "none";
    // unsubscribe && unsubscribe();
  }
});
renderItems();

// function getItemsFromDatabase(user) {
//   let itemsFromDb = [];
//   db.collection("todo-items")
//     .where("userId", "==", user.uid)
//     .orderBy("createdOn", "desc")
//     .get()
//     .then((snapshot) => {
//       itemsFromDb = snapshot.docs.map((doc) => {
//         console.log(doc.data());
//         return doc.data();
//       });
//     });
//   return itemsFromDb;
// }

function syncLocalStorageAndDb(user) {
  let dbItems = [];
  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];

  db.collection("todo-items")
    .where("userId", "==", user.uid)
    .orderBy("createdOn", "desc")
    .get()
    .then(function (snapshot) {
      snapshot.docs.forEach((doc) => {
        // console.log(doc.data());
        dbItems.push(doc.data());
        // console.log(dbItems);

        let modifiedDbItems = dbItems.map((item) => {
          let { userId, createdOn, ...modifiedItem } = item;
          return modifiedItem;
        });

        // console.log(modifiedDbItems);

        // let mergedItems = [...todoItems, ...modifiedDbItems];
        // console.log(mergedItems);
        // let seen = {};
        // let syncedItems = [];
        // let j = 0;
        // for (let i = 0; i < mergedItems.length; i++) {
        //   let item = mergedItems[i];
        //   if (seen[JSON.stringify(item)] !== 1) {
        //     seen[JSON.stringify(item)] = 1;
        //     syncedItems[j++] = item;
        //   }
        // }
        // let localIdArray = modifiedDbItems.map((item) => item.localId);
        // console.log("local ids", localIdArray);
        // let syncedItems = [...modifiedDbItems];

        let syncedItems = modifiedDbItems.filter((item) => {
          if (todoItems.includes(item)) {
            return false;
          } else {
            return true;
          }
        });

        syncedItems.sort(function (item1, item2) {
          if (item1.localId > item2.localId) {
            return -1;
          } else if (item1.localId < item2.localId) {
            return 1;
          }
        });
        console.log(syncedItems);
        // localStorage.removeItem("todoItems");
        localStorage.clear();
        localStorage.setItem("todoItems", JSON.stringify(syncedItems));
        //Update for specific user to fix error
        syncedItems.forEach((item) => {
          writeToDatabase(item, user);
        });
      });
      renderItems();
    });
}

function writeToDatabase(item) {
  const itemId =
    auth.currentUser.displayName.split(" ").join("_") + "_" + item.localId;
  let dbItem = db.collection("todo-items").doc(itemId);
  const { serverTimestamp } = firebase.firestore.FieldValue;
  dbItem.set(
    { userId: auth.currentUser.uid, createdOn: serverTimestamp(), ...item },
    { merge: true }
  );
  // dbItem
  //   .get()
  //   .then((doc) => {
  //     if (doc.exists) {
  //       dbItem.update({ ...item });
  //     } else {
  //       const { serverTimestamp } = firebase.firestore.FieldValue;
  //       dbItem.set({
  //         userId: auth.currentUser.uid,
  //         createdOn: serverTimestamp(),
  //         ...item,
  //       });
  //     }
  //   })
  //   .catch(console.log(`Unable to write`));
}

window.addEventListener("storage", function (event) {
  console.log(event.target);
});

function clearCompletedItems() {
  console.log("clear completed");
  todoItems = JSON.parse(localStorage.getItem("todoItems")) || [];
  localStorage.removeItem("completedTodoItems");
  const updatedTodoItems = todoItems.filter(
    (item) => item.status !== "completed"
  );
  localStorage.setItem("todoItems", JSON.stringify(updatedTodoItems));
  renderItems();
}

document
  .getElementById("theme-image")
  .addEventListener("click", function (event) {
    console.log(event.target);
    event.target.src = "./assets/icon-moon.svg";
  });
/*

TODO
1. clear completed event listener
2. syncwithdatabase when mark completed and clear cmpleted
3. dark/light theme
4. make syncing user specific
5. on sign-out clear local storage and regenerate from items
*/
