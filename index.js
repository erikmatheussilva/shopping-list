import * as uuid from "./node_modules/uuid/dist/index.js";
import { v4 as uuidv4 } from "./node_modules/uuid/dist/index.js";

// ========== SELECTORS ==========
// Atribuindo elementos do DOM a variáveis para facilitar o acesso e manipulação
const addButtonEl = document.querySelector("#addButton"); // Botão para adicionar itens à lista
const emptyListMsg = document.querySelector("#empty-list"); // Container da mensagem que aparece quando a lista está vazia
const inputFieldEl = document.querySelector("#item"); // Input de texto onde o usuário digita o nome do item a ser adicionado
const clearListButton = document.querySelector("#clear-button"); // Botão para limpar toda a lista
const toastContainer = document.querySelector("#toast-container"); // Container para as mensagens de notificação (toasts)
let shoppingListEl = document.querySelector("#items-list"); // A lista de items

// Define uma variável para rastrear se a página está sendo carregada ou recarregada
let isPageReload = false;

// ========== ADD BUTTON CLICK EVENT ==========
// Acontece quando o botão "Adicionar" é clicado
addButtonEl.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent page from reloading
  let inputValue = inputFieldEl.value; // Armazena o valor do input em let inputValue

  // Checa se o input não está vazio antes de adicionar o item
  if (inputValue !== "") {
    addItemToShoppingList(inputValue); // Adiciona o item à lista
    clearInputField(); // Limpa o input após adicionar novo item a lista
  }
});

// ========== LOAD SHOPPING LIST ==========
// Acontece toda vez que a página é carregada ou recarregada
loadShoppingList();

// Pega os itens em localStorage e os exibe na tela, garantindo que a lista persista entre sessões
function loadShoppingList() {
  isPageReload = true; // Previne que apareça a mensagem de notificação
  const shoppingListFromLocalStorage = localStorage.getItem("shoppingList"); // Pega os itens salvos em localStorage (se existirem)
  if (shoppingListFromLocalStorage) {
    let itemsArr = JSON.parse(shoppingListFromLocalStorage); // Converte o JSON do localStorage de volta para um array de objetos
    clearAddToShoppingList(); // Limpa a lista atual para evitar duplicação de itens ao recarregar a página

    // Passa por cada item salvo e o adiciona à lista na tela
    if (itemsArr.length > 0) {
      for (let i = 0; i < itemsArr.length; i++) {
        let currentItem = itemsArr[i].value;
        addItemToShoppingList(currentItem);
      }
    }

    console.log("Lista de compras carregada do localStorage:", itemsArr); // Log para verificar os itens carregados
  }

  isPageReload = false; // Página carregada, notificações podem aparecer normalmente
  clearInputField(); //Executa função que limpa o input após adicionar novo item a lista
  updateEmptyListState(); // Executa função que verifica se a lista está vazia para mostrar a mensagem de "lista vazia"
}

// Limpa a lista e o localStorage
function clearAddToShoppingList() {
  shoppingListEl.innerHTML = ""; // Define o conteúdo da lista como vazio
  updateEmptyListState(); // Executa função que verifica se a lista está vazia para mostrar a mensagem de "lista vazia"
  localStorage.removeItem("shoppingList"); // Remove os itens do localStorage
}

// Limpa o input de adicionar item
function clearInputField() {
  inputFieldEl.value = "";
}

// Adiciona um novo item à lista de compras e ao localStorage
function addItemToShoppingList(itemValue) {
  // Cria um ID único para o item usando a biblioteca uuid
  let itemId = uuidv4();

  // Cria um objeto para representar o item, contendo seu ID e valor (nome do item)
  let item = {
    id: itemId,
    value: itemValue,
  };

  let itemsArr = []; // Array que ira conter os itens

  // "Se existir uma lista de compras salva no navegador, então pegue esse texto salvo, transforme em uma lista de verdade e guarde na variável itemsArr"
  if (localStorage.getItem("shoppingList")) {
    itemsArr = JSON.parse(localStorage.getItem("shoppingList"));
  }

  // Verifica se o item que o usuário está tentando adicionar já existe na lista (comparando o valor do item)
  const existingItem = itemsArr.some(
    (existingItem) => existingItem.value === itemValue,
  );

  // Caso já exista um item com o mesmo valor, mostra uma mensagem de erro e não adiciona o item à lista
  if (existingItem) {
    showToast("Item já está na lista!", true); // true = error message
    return;
  }

  // Adiciona o novo item ao array de itens
  itemsArr.push(item);

  // Salva o novo array de itens no localStorage, convertendo-o para JSON
  localStorage.setItem("shoppingList", JSON.stringify(itemsArr));

  clearInputField(); //Executa função que limpa o input após adicionar novo item a lista

  // Se não houver reload na pagina, mostra uma mensagem de sucesso ao adicionar o item
  if (!isPageReload) {
    showToast("Item adicionado!");
  }

  createItemElement(item); // Executa a função que cria o elemento html, passando para ela como parametro o item que foi adicionado, para que ele possa criar o elemento com as informações corretas
  updateEmptyListState(); // Executa função que atualiza o estado da lista
}

// Cria o elemento html completo do item adicionado, com informações vindas do objeto 'item' que foi passado como parametro na linha 111
function createItemElement(item) {
  // Cria a base do elemento do item
  let itemEl = document.createElement("li");
  itemEl.classList.add("item");
  itemEl.classList.add("checkbox-wrapper");
  itemEl.classList.add("input-wrapper");
  itemEl.classList.add("transition");

  // CHECKBOX ICON
  let checkboxImg = document.createElement("div");
  checkboxImg.classList.add("checkbox-image");

  // CHECKBOX INPUT
  let itemInput = document.createElement("input");
  itemInput.type = "checkbox";
  itemInput.id = item.id;
  // ITEM LABEL
  let itemLabel = document.createElement("label");
  itemLabel.textContent = item.value;
  itemLabel.setAttribute("for", item.id);
  // BUTTONS WRAPPER
  let buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("buttons-wrapper");
  // DELETE BUTTON
  let deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-button");
  deleteBtn.style.background = "none";
  deleteBtn.style.border = "none";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.padding = "0";
  // delete icon
  let deleteIcon = document.createElement("img");
  deleteIcon.src = "./assets/icons/delete.svg";
  deleteBtn.appendChild(deleteIcon);

  // Junta os elementos para formar a estrutura completa do item na lista
  itemEl.appendChild(checkboxImg);
  itemEl.appendChild(itemInput);
  itemEl.appendChild(itemLabel);
  itemEl.appendChild(buttonsWrapper);
  buttonsWrapper.appendChild(deleteBtn);

  // Observa o evento de clique no botão de deletar item
  deleteBtn.addEventListener("click", function (event) {
    // Previne o reload padrão da página
    event.preventDefault();
    // Remove item do localStorage
    removeItemFromShoppingList(item.id);
    // Remove item do html
    itemEl.remove();
    // Mostra mensagem de item removido
    showToast("Item removido!");
    updateEmptyListState(); // Atualiza estado da lista
  });

  // Adiciona o novo item à lista no HTML
  shoppingListEl.append(itemEl);
}

// Função que remove um item da lista de compras, tanto do localStorage quanto do HTML, usando o ID único do item para identificá-lo
function removeItemFromShoppingList(itemId) {
  let itemsArr = []; // Cria um array vazio

  // Se existir itens, são passados para o array itemsArr (transformando o JSON do localStorage(shoppingList) em um array de objetos)
  if (localStorage.getItem("shoppingList")) {
    itemsArr = JSON.parse(localStorage.getItem("shoppingList"));
  }

  // Remove o item com o ID correspondente
  itemsArr = itemsArr.filter((item) => item.id !== itemId);

  // Desta vez salva o itemsArr como o JSON de shoppingList
  localStorage.setItem("shoppingList", JSON.stringify(itemsArr));
  updateEmptyListState();
}

// Função que exibe uma mensagem de notificação
function showToast(message, isError = false) {
  // --Verifica se já existe um toast com a mesma mensagem para evitar mensagens duplicadas

  const existingToast = Array.from(toastContainer.children).find(
    // transforma todos os possiveis toasts em toastContainer em um array, para usar o metódo find,
    (toast) => toast.textContent === message,
    // afim de verificar se já existe um toast com a mesma mensagem, para evitar mensagens duplicadas
  );
  if (existingToast) {
    return; // Se já existir um toast com a mesma mensagem, não cria outro e sai da função
  }

  // Cria elemento html do toast e passa a message como textContent do toast
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? " error" : ""}`; // Adiciona a classe "error" se isError for true
  toast.textContent = message;

  // Adiciona o toast em toastContainer
  toastContainer.appendChild(toast);

  // Adiciona a classe "toastDiv" para aplicar os estilos
  toast.classList.add("toastDiv");

  // Remove o toast após 500ms
  setTimeout(function () {
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 500);
}

// Função que atualiza a lista e verifica se está vazia para mostrar/ocultar a mensagem "lista vazia"
function updateEmptyListState() {
  const shoppingListFromLocalStorage = localStorage.getItem("shoppingList");
  const itemsArr = shoppingListFromLocalStorage
    ? // Se existir uma lista de compras salva no navegador, então pegue esse texto salvo,
      // transforme em uma lista de verdade e guarde na variável itemsArr
      JSON.parse(shoppingListFromLocalStorage) // Parse do JSON para transformar o texto salvo em um array de objetos
    : null; // Se não existir uma lista salva, itemsArr será null

  // Se existir itemsArr e seu comprimento for maior que 0, significa que há itens na lista,
  //  então esconde a mensagem de lista vazia.
  if (itemsArr?.length > 0) {
    emptyListMsg.style.display = "none";
  } else {
    // Caso contrário, mostra a mensagem de lista vazia.
    emptyListMsg.style.display = "block";
  }
}

// ========== CLEAR LIST BUTTON ==========
// Observa o evento de clique no botão de limpar lista
clearListButton.addEventListener("click", function () {
  localStorage.removeItem("shoppingList"); // remove todos os itens da lista e do localStorage,
  clearAddToShoppingList(); // Limpar o localStorage e a lista no HTML
  showToast("Lista limpa com sucesso!"); // mostrar uma mensagem de sucesso
  updateEmptyListState(); // Atualizar o estado da lista para mostrar a mensagem de "lista vazia"
});
