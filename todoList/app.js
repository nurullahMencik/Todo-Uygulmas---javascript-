// tüm elementleri seçmek

const form1 = document.querySelector("#todoAddForm");
const addInput = document.querySelector("#todoName");
const todoList = document.querySelector(".list-group");
const clearButton = document.querySelector("#clearTodos");
const todoSearch = document.querySelector("#todoSearch");

let todos = [];
runEvents();

function runEvents() {
  form1.addEventListener("submit", addTodo); // Yeni todo ekleme
  document.addEventListener("DOMContentLoaded", pageLoaded); // Sayfa yüklendiğinde verileri çekme
  todoList.addEventListener("click", removeAndEditTodoUI); // Silme ve düzenleme işlemleri
  clearButton.addEventListener("click", clearAllTodos); // Tüm todoları temizleme
  todoSearch.addEventListener("keyup", search); // Arama işlemi
}

//Kullanıcı, arama çubuğuna bir metin girdiğinde, todolar bu metinle eşleşiyorsa görünür olur, aksi halde gizlenir.
function search(e) {
  const searchValue = e.target.value.toLowerCase().trim();
  const todoListesi = document.querySelectorAll(".list-group-item");
  todoListesi.forEach(function (todo) {
    if (todo.textContent.includes(searchValue)) {
      todo.setAttribute("style", "display : block");
    } else {
      todo.setAttribute("style", "display : none !important");
    }
  });
}

//Tüm todo öğeleri silinir.
function clearAllTodos() {
  const todoListesi = document.querySelectorAll(".list-group-item");
  if (todoListesi.length > 0) {
    todoListesi.forEach(function (todo) {
      todo.remove();
      localStorage.clear(); // LocalStorage'daki tüm veriler temizlenir.
      showAlert("success", "tüm todolar silindi");
    });
  } else {
    showAlert("warning", "silinecek todo yok");
  }
}

//Todo Silme ve Düzenleme
function removeAndEditTodoUI(e) {
  if (e.target.className === "fa fa-remove") {
    //Silme işlemi başlatılır.
    const todo = e.target.parentElement.parentElement.parentElement;
    const todoText = todo.textContent.trim();
    todo.remove();
    showAlert("success", "todo başarıyla silindi");
    removeTodoFromStorage(todoText);
  } else if (e.target.className === "fa fa-edit") {
    //Düzenleme işlemi başlatılır.
    const todo = e.target.parentElement.parentElement.parentElement;
    const todoText = todo.textContent.trim();
    editTodoUI(todo, todoText);
  }
}

//Todo Düzenleme
function editTodoUI(todo, todoText) {
  // Mevcut todo'nun metnini değiştirmeden, sadece düzenleme için input alanı ekliyoruz
  const newInput = document.createElement("input");
  newInput.className = "edit-input";
  newInput.value = todoText;

  // Eski todo'yu kaldırıyoruz
  todo.innerHTML = "";

  // Yeni input'u li elemanına ekliyoruz
  todo.appendChild(newInput);

  // Input'a odaklanıyoruz (kullanıcı hemen yazmaya başlasın diye)
  newInput.focus();

  // Enter tuşuna basıldığında düzenlemeyi kaydet
  newInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const updatedText = newInput.value.trim();
      if (updatedText === "") {
        showAlert("danger", "Todo boş olamaz");
      } else {
        updateTodoInStorage(todoText, updatedText); // LocalStorage'da güncelleme
        addTodoUI(updatedText, todo); // Düzenlenmiş todo'yu yeniden ekliyoruz
        showAlert("success", "Todo başarıyla güncellendi");
      }
    }
  });

  // Input'a blur olayı ekliyoruz (input alanı dışına çıkıldığında kaydetmek için)
  newInput.addEventListener("blur", function () {
    const updatedText = newInput.value.trim();
    if (updatedText === "") {
      showAlert("danger", "Todo boş olamaz");
    } else {
      updateTodoInStorage(todoText, updatedText); // LocalStorage'da güncelleme
      addTodoUI(updatedText, todo); // Düzenlenmiş todo'yu yeniden ekliyoruz
      showAlert("success", "Todo başarıyla güncellendi");
    }
  });
}

//LocalStorage'da Güncelleme
function updateTodoInStorage(oldText, newText) {
  checkTodosFromStorage(); // LocalStorage'daki todos dizisini al
  todos = todos.map(function (todo) {
    if (todo === oldText) {
      return newText; // Eski metni yeni metinle değiştir
    }
    return todo; // Diğerlerini olduğu gibi bırak
  });
  localStorage.setItem("todos", JSON.stringify(todos)); // Güncellenmiş diziyi kaydet
}

//Sayfa yüklendiğinde, LocalStorage'daki todolar addTodoUI ile görüntülenir.
function removeTodoFromStorage(todoText) {
  checkTodosFromStorage(); // LocalStorage'daki todos dizisini al
  todos = todos.filter(function (todo) {
    return todo !== todoText; // Silinen todo'yu diziden çıkar
  });
  localStorage.setItem("todos", JSON.stringify(todos)); // Güncellenmiş diziyi kaydet
}

//Sayfa yüklendiğinde, LocalStorage'daki todolar addTodoUI ile görüntülenir.
function pageLoaded() {
  checkTodosFromStorage();
  todos.forEach(function (todo) {
    addTodoUI(todo);
  });
}

//Yeni Todo Ekleme
function addTodo(e) {
  const inputText = addInput.value.trim();
  if (inputText == null || inputText == "") {
    showAlert("danger", "todo ismi giriniz");
  } else {
    addTodoUI(inputText);
    addTodoStorage(inputText);
    showAlert("success", "todo eklendi");
  }
  //arayze ekleme
  //storageye ekleme
  e.preventDefault();
}

//Todo Arayüzüne Ekleme
function addTodoUI(newTodo, todoElement) {
  // Eğer todoElement varsa, bu durumda bir düzenleme işlemi yapıyoruz, yoksa yeni bir todo ekliyoruz
  const li = todoElement || document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between ";
  li.textContent = newTodo;

  // Silme ikonu ekleme
  const deleteA = document.createElement("a");
  deleteA.className = "delete-item";
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa fa-remove"; // Silme ikonu
  deleteA.appendChild(deleteIcon); // i'yi a'nın içine ekleme
  deleteA.style.marginRight = "10px";
  deleteA.style.cursor = "pointer"; // Fare simgesini parmak işareti yap

  // Düzenleme ikonu ekleme
  const editA = document.createElement("a");
  editA.className = "edit-item"; //
  const editIcon = document.createElement("i");
  editIcon.className = "fa fa-edit"; // edit ikonu
  editA.appendChild(editIcon); // i'yi a'nın içine ekleme
  editA.style.cursor = "pointer"; // Fare simgesini parmak işareti yap

  const iconsContainer = document.createElement("div");
  iconsContainer.appendChild(deleteA);
  iconsContainer.appendChild(editA);

  li.appendChild(iconsContainer); // li'ye ikonları ekleme

  if (!todoElement) {
    todoList.appendChild(li); // Eğer yeni todo ekliyorsak, todoList'e ekliyoruz
  }

  // Yeni input alanını temizliyoruz
  addInput.value = "";
}

function addTodoStorage(newTodo) {
  checkTodosFromStorage();
  todos.push(newTodo);
  localStorage.setItem("todos", JSON.stringify(todos));
}

//LocalStorage Kontrolü
function checkTodosFromStorage() {
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
}

//Bildirim Gösterme
function showAlert(type, message) {
  let div = document.createElement("div");
  div.className = "alert mt-3 alert-" + type;
  div.textContent = message;
  clearButton.parentElement.appendChild(div); // bir üst etiketin en altına ekleme
  setTimeout(function () {
    div.remove();
  }, 1000);
}
