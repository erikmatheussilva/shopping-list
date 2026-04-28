//selectors
const addButtonEl = document.querySelector("#addButton");
const emptyListMsg = document.querySelector("#empty-list");
const inputFieldEl = document.querySelector("#item");
const clearListButton = document.querySelector("#clear-button");
const toastContainer = document.querySelector("#toast-container");
let shoppingListEl = document.querySelector("#items-list");

let isPageReload = false;

addButtonEl.addEventListener("click", function (e) {
  e.preventDefault();
  let inputValue = inputFieldEl.value;
  if (inputValue !== "") {
    addItemToShoppingList(inputValue); 
    clearInputField();
  }
});

loadShoppingList();

function loadShoppingList() {
  isPageReload = true;
  const shoppingListFromLocalStorage = localStorage.getItem("shoppingList");
  if (shoppingListFromLocalStorage) {
    let itemsArr = JSON.parse(shoppingListFromLocalStorage);
    clearAddToShoppingList();

    if (itemsArr.length > 0) {
      for (let i = 0; i < itemsArr.length; i++) {
        let currentItem = itemsArr[i].value; 
        addItemToShoppingList(currentItem);
      }
    }
  }

  isPageReload = false;
  clearInputField(); 
  updateEmptyListState();
}

function clearAddToShoppingList() {
  shoppingListEl.innerHTML = "";
  updateEmptyListState();
  localStorage.removeItem("shoppingList");
}

function clearInputField() {
  inputFieldEl.value = "";
}

function addItemToShoppingList(itemValue) {
  let itemId = Date.now().toString();
  let item = {
    id: itemId,
    value: itemValue,
  };

  let itemsArr = [];

  if (localStorage.getItem("shoppingList")) {
    itemsArr = JSON.parse(localStorage.getItem("shoppingList"));
  }

  const existingItem = itemsArr.some(
    (existingItem) => existingItem.value === itemValue,
  );

  if (existingItem) {
    showToast("Item já está na lista!", true); 
    return; 
  }

  itemsArr.push(item);
  localStorage.setItem("shoppingList", JSON.stringify(itemsArr));

  clearInputField(); 

  if (!isPageReload) {
    showToast("Item adicionado!");
  }

  createItemElement(item);
  updateEmptyListState(); 
}

function createItemElement(item) {
  let itemEl = document.createElement("li");
  itemEl.classList.add("item");
  itemEl.classList.add("checkbox-wrapper");
  itemEl.classList.add("input-wrapper");
  itemEl.classList.add("transition"); // Add transition class for smooth effect

  let checkboxImg = document.createElement("div");
  checkboxImg.classList.add("checkbox-image");

  let itemInput = document.createElement("input");
  itemInput.type = "checkbox";
  itemInput.id = item.id;

  let itemLabel = document.createElement("label");
  itemLabel.textContent = item.value;
  itemLabel.setAttribute("for", item.id);

  let buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("buttons-wrapper");

  let deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-button");
  deleteBtn.style.background = "none";
  deleteBtn.style.border = "none";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.padding = "0";

  let deleteIcon = document.createElement("img");
  deleteIcon.src = "./assets/icons/delete.svg";
  deleteBtn.appendChild(deleteIcon);

  itemEl.appendChild(checkboxImg);
  itemEl.appendChild(itemInput);
  itemEl.appendChild(itemLabel);
  itemEl.appendChild(buttonsWrapper);
  buttonsWrapper.appendChild(deleteBtn);

  deleteBtn.addEventListener("click", function (event) {
    event.preventDefault();
    removeItemFromShoppingList(item.id);
    itemEl.remove();
    showToast("Item removido!");
    updateEmptyListState();
  });
  setTimeout(() => {
    itemEl.classList.add("fadeIn");
  }, 0); // Add the fade-in class immediately after creating the element

  shoppingListEl.append(itemEl);
}

function removeItemFromShoppingList(itemId) {
  let itemsArr = [];

  if (localStorage.getItem("shoppingList")) {
    itemsArr = JSON.parse(localStorage.getItem("shoppingList"));
  }

  itemsArr = itemsArr.filter((item) => item.id !== itemId);
  localStorage.setItem("shoppingList", JSON.stringify(itemsArr));
  updateEmptyListState();
}

function showToast(message, isError = false) {
  const existingToast = Array.from(toastContainer.children).find(
    (toast) => toast.textContent === message,
  );
  if (existingToast) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${isError ? " error" : ""}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  toast.classList.add("show");
  toast.classList.add("toastDiv");

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 300); 
  }, 500);
}

function updateEmptyListState() {
  const shoppingListFromLocalStorage = localStorage.getItem("shoppingList");
  const itemsArr = shoppingListFromLocalStorage
    ? JSON.parse(shoppingListFromLocalStorage)
    : null;

  if (itemsArr?.length > 0) {
    emptyListMsg.style.display = "none";
  } else {
    emptyListMsg.style.display = "block";
  }
}

clearListButton.addEventListener("click", function () {
  localStorage.removeItem("shoppingList");
  clearAddToShoppingList();
  showToast("Lista limpa com sucesso!");
  updateEmptyListState();
});
