let siteName = document.getElementById("siteName");
let siteURL = document.getElementById("websiteURL");
let submitButton = document.getElementById("submitButton");
let visitButtons, deleteButtons, editButtons;
let search = document.getElementById("search");
let tableContent = document.getElementById("tableContent");
let formMessage = document.getElementById("formMessage");
let bookmarks = [];

if (localStorage.getItem("bookmarks") != null) {
    bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    displayBookmark();
}

siteName.addEventListener("input", function () {
    if (validateSiteName()) {
        siteName.classList.add("is-valid");
        siteName.classList.remove("is-invalid");
    } else {
        siteName.classList.add("is-invalid");
        siteName.classList.remove("is-valid");
    }
});

siteURL.addEventListener("input", function () {
    if (validateSiteURL()) {
        siteURL.classList.add("is-valid");
        siteURL.classList.remove("is-invalid");
    } else {
        siteURL.classList.add("is-invalid");
        siteURL.classList.remove("is-valid");
    }
});

function showMessage(message, type) {
    formMessage.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    setTimeout(() => {
        formMessage.innerHTML = "";
    }, 3000);
}

function isDuplicateBookmark(newBookmark) {
    for (let i = 0; i < bookmarks.length; i++) {
        let bookmark = bookmarks[i];
        if (bookmark.siteName.toLowerCase() === newBookmark.siteName.toLowerCase() ||
            bookmark.siteURL.toLowerCase() === newBookmark.siteURL.toLowerCase()) {
            return true;
        }
    }
    return false;
}

submitButton.addEventListener("click", function () {
    if (validateSiteName() && validateSiteURL()) {
        let bookmark = {
            siteName: siteName.value,
            siteURL: siteURL.value,
        };
        if (isDuplicateBookmark(bookmark)) {
            showMessage("This bookmark already exists.", "danger");
            return;
        }
        bookmarks.push(bookmark);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        displayBookmark();
        clearInput();
    } else {
        showMessage(`
        <p>Oops! There seems to be an issue with the site details you entered. Please make sure:</p>
        <p class="mb-0">- Site name must contain at least 3 characters</p>
        <p class="mb-0">- Site URL must be a valid one</p>
        `, "danger");
    }
});

function clearInput() {
    siteName.value = "";
    siteURL.value = "";
    siteName.classList.remove("is-valid", "is-invalid");
    siteURL.classList.remove("is-valid", "is-invalid");
}

function displayBookmark() {
    let Container = "";
    for (let i = 0; i < bookmarks.length; i++) {
        Container += `
        <tr>
            <td data-label="Index">${i + 1}</td>
            <td data-label="Website Name">${bookmarks[i].siteName}</td>
            <td data-label="Visit"><button class="btn btn-visit text-white fw-bold"><i class="fa-solid fa-eye"></i> visit</button></td>
            <td data-label="Edit"><button class="btn btn-edit text-white fw-bold"><i class="fa-solid fa-pen"></i> Edit</button></td>
            <td data-label="Delete"><button class="btn btn-delete text-white fw-bold"><i class="fa-solid fa-trash-can"></i> Delete</button></td>
        </tr>`
    }
    tableContent.innerHTML = Container;
    
    deleteButtons = document.querySelectorAll(".btn-delete");
    editButtons = document.querySelectorAll(".btn-edit");
    visitButtons = document.querySelectorAll(".btn-visit");
    
    for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener("click", function () {
            deleteBookmark(i);
        })
    }
    
    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener("click", function () {
            siteName.value = bookmarks[i].siteName;
            siteURL.value = bookmarks[i].siteURL;
            document.getElementById("submitButton").style.display = "none";
            document.getElementById("modifyButton").innerHTML = `<button onclick="editBookmark(${i})" class="btn btn-modify px-5 text-white fw-bold" id="modifyButton">Modify</button>`
        })
    }
    
    for (let i = 0; i < visitButtons.length; i++) {
        visitButtons[i].addEventListener("click", function () {
            visitBookmark(i);
        })
    }
}

function deleteBookmark(index) {
    bookmarks.splice(index, 1);
    displayBookmark();
    search.value = "";
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function visitBookmark(index) {
    open(`${bookmarks[index].siteURL}`)
}

function editBookmark(index) {
    let bookmark = {
        siteName: siteName.value,
        siteURL: siteURL.value,
    };
    bookmarks[index] = bookmark;
    clearInput();
    displayBookmark();
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    document.querySelector(".btn-modify").style.display = "none"
    document.getElementById("submitButton").style.display = "inline";
}

function searchBookmarks(term) {
    let box = "";
    for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].siteName.trim().toLowerCase().includes(term.toLowerCase())) {
            box += `
            <tr>
                <td data-label="Index" >${i + 1}</td>
                <td data-label="Website Name">${bookmarks[i].siteName}</td>
                <td data-label="Visit"><button onclick="visitBookmark(${i})" class="btn btn-visit text-white fw-bold"><i class="fa-solid fa-eye"></i> visit</button></td>
                <td data-label="Edit"><button class="btn btn-edit text-white fw-bold" data-index="${i}"><i class="fa-solid fa-pen"></i> Edit</button></td>
                <td data-label="Delete"><button onclick="deleteBookmark(${i})" class="btn btn-delete text-white fw-bold"><i class="fa-solid fa-trash-can"></i> Delete</button></td>
            </tr>`;
        }
    }
    tableContent.innerHTML = box;
    
    editButtons = document.querySelectorAll(".btn-edit");
    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            siteName.value = bookmarks[index].siteName;
            siteURL.value = bookmarks[index].siteURL;
            document.getElementById("submitButton").style.display = "none";
            document.getElementById("modifyButton").innerHTML = `<button onclick="editBookmark(${index})" class="btn btn-modify px-5 text-white fw-bold" id="modifyButton">Modify</button>`;
            search.value = "";
        });
    }
}

search.addEventListener('input', function () {
    searchBookmarks(this.value);
})

function validateSiteName() {
    let siteNameRegex = /^\w{3,}(\s+\w+)*$/;
    return siteNameRegex.test(siteName.value);
}

function validateSiteURL() {
    let siteURLRegex = /^(https?:\/\/)([\w\-]+\.)+[\w\-]{2,}(\/[^\s]*)?$/;
    return siteURLRegex.test(siteURL.value);
}


