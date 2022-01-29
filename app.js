function addItem(event) {
  event.preventDefault();
  const inputText = document.getElementById("todo-input");
  //   console.log(inputText.value);
  db.collection("todo-items").add({
    text: inputText.value,
    status: "active",
  });
  inputText.value = "";
}

function getItems() {
  db.collection("todo-items").onSnapshot((snapshot) => {
    // console.log(snapshot.docs);
    let items = [];
    snapshot.docs.forEach((doc) =>
      items.push({
        id: doc.id,
        ...doc.data(),
      })
    );
    // console.log(items);
    renderItems(items);
  });
}

function renderItems(items) {
  db.collection("todo-items").orderBy("date", "desc");
  let itemsHTML = "";
  items.forEach((item) => {
    // console.log(item);
    itemsHTML += `
        <div class="todo-item">
          <div class="check">
            <div data-id="${item.id}" class="check-mark${
      item.status === "completed" ? " checked" : ""
    }">
              <img src="./assets/icon-check.svg" />
            </div>
          </div>
          <div class="todo-text${
            item.status === "completed" ? " checked" : ""
          }">${item.text}</div>
        </div>
    `;
  });
  document.querySelector(".todo-items").innerHTML = itemsHTML;
  createEventListeners();
}

function createEventListeners() {
  const toDoCheckMarks = document.querySelectorAll(".todo-item .check-mark");
  toDoCheckMarks.forEach((checkMark) => {
    checkMark.addEventListener("click", function (event) {
      //   console.log(event.target.dataset.id);
      markCompleted(event.target.dataset.id);
    });
  });
}

function markCompleted(itemId) {
  //   console.log("mark complted");
  let item = db.collection("todo-items").doc(itemId);
  item.get().then(function (doc) {
    if (doc.exists) {
      let status = doc.data().status;
      if (status === "active") {
        item.update({
          status: "completed",
        });
      } else if (status === "completed") {
        item.update({
          status: "active",
        });
      }
    }
  });
}

getItems();
