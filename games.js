const baseUrl = 'https://games-world.herokuapp.com/games';

function getGames() {
    showLoader();
    fetch(baseUrl, { method: 'GET' })
        .then(handleResponse)
        .then(function (parsedResponse) {
            parsedResponse.forEach(displayGame);
        })
        .catch(displayError)
        .finally(hideLoader);
}

function deleteGame(id) {
    fetch(baseUrl + "/" + id, { method: 'DELETE' })
        .then(handleResponse)
        .then(function (parsedResponse) {
            console.log(parsedResponse);
        });
}

function createGame() {
    // get the data from the form
    var gameData = getFormData();

    // check if the data is valid, each element has value
    if (isFormDataInvalid(gameData)) {
        // if the for data is invalid end this function by returning from it
        return;
    }

    // if the form is not invalid the function execution continues
    var formatedData = new URLSearchParams(gameData);
    console.log("Formated from data", formatedData);

    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formatedData
    }).then(handleResponse)
        .then(displayGame)
        .catch(displayError);
}

function handleResponse(response) {
    if (response.status === 404 || response.status === 400) {
        throw Error("Game not found!");
    } else if (response.status === 500) {
        throw Error("Something went wrong!Plese try again!");
    } else if (response.status === 200) {

        // get the Content-Type header
        var contentType = response.headers.get('Content-Type');
        if (contentType.includes('text/html')) {
            return response.text();
        } else {
            return response.json();
        }
    }
}

function getFormData() {
    var inputsList = document.querySelectorAll("#createGameForm .form-control");

    var formData = {};

    for (input of inputsList) {
        formData[input.name] = input.value;
    }
    console.log("Form data object:", formData);
    return formData;
}

function isFormDataInvalid(data) {
    var inValidInputs = 0;
    // get all the error elements
    var errors = document.querySelectorAll("#createGameForm .error");
    var i = 0;

    for (var key in data) {
        // iterate over each propert of the data and check if it is an empty string
        if (data[key] === '') {
            inValidInputs++;
            // if an input is invalid show the it's error element
            errors[i].style.visibility = 'visible';
        }
        // in each for increment the i
        i++;
    }

    return inValidInputs > 0; // will return true if there are invalid inputs, false is the number of inputs is 0

}

function displayError(message) {
    let container = document.getElementById("gamesContainer");
    container.innerText = message;
}

function displayGame(game) {
    let gameCard = document.createElement("div");
    gameCard.classList.add("game-card");

    let gameImage = document.createElement("img");
    gameImage.src = game.imageUrl;

    let gameInfo = document.createElement("div");
    gameInfo.classList.add("game-info");
    // gameInfo.innerHTML = "<h3>" + game.title + "</h3>" + "<p>" + game.description + "</p>";
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

    gameInfo.innerHTML = `
        <h3>${game.title}</h3>
        <p>${game.description}</p>
    `;

    var deleteButton = document.createElement('button');
    deleteButton.classList.add("far", "fa-trash-alt", "delete-button");

    deleteButton.addEventListener('click', function (event) {
        // delete the game from the server
        deleteGame(game._id);

        // remove the element from the HTML
        event.target.parentElement.remove();
    });
    gameCard.append(gameImage, gameInfo, deleteButton);

    document.getElementById("gamesContainer").prepend(gameCard);

}

// fetches an HTML file and inserts it to a destination elemnet
function includeHTML(destinationElement) {
    const link = destinationElement.dataset.content;

    return fetch(link)
        .then(function (response) {
            return response.text();
        })
        .then(function (html) {
            destinationElement.innerHTML = html;
        });
}

function showLoader() {
    var loader = document.getElementById('appLoader');
    loader.style.display = 'block';
}

function hideLoader() {
    var loader = document.getElementById("appLoader");
    loader.style.display = 'none';
}

function displayModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "block";
}

function hideModal() {
    var modal = document.getElementById("modal");
    modal.style.display = "none";
}

function validateInput(event) {
    // the event object contains information about the event that called back this function
    // event.target is the element on which the event occured
    // check if the event.target.value is truthy, it means is not 0/null/undefined/''/false/NaN, it has an actual value
    if (event.target.value) {
        event.target.parentElement.parentElement.querySelector('.error').style.visibility = 'hidden';
    } else {
        event.target.parentElement.parentElement.querySelector('.error').style.visibility = 'visible';
    }
}

window.addEventListener("load", function () {
    var modalSection = document.getElementById("modal");

    // include the content in the modalSection
    includeHTML(modalSection).then(() => {
        var closeButtons = document.getElementsByClassName("close");

        // add the click functionality to the close buttons
        for (button of closeButtons) {
            button.onclick = hideModal;
        }

        var saveButton = document.getElementById("saveButton");
        // add the click functionality to the save button
        saveButton.onclick = createGame;

        var inputs = document.querySelectorAll("#createGameForm .form-control");
        // add the validation to each input from the modal
        for (input of inputs) {
            // everytime something is written in the input validate it
            input.addEventListener("keyup", validateInput)
        }
        // everytime the date picker is closed validate it
        document.getElementById("gameReleaseDate").onblur = validateInput;
    });

    // add the click functionality to the create button
    var createButton = document.getElementById("createButton");
    createButton.onclick = displayModal;

    // fetch all games
    getGames();
});

