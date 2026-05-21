document.addEventListener('DOMContentLoaded', () => {
    checkRole();
});

/* Informations dialogruta */
const infoDialog = document.querySelector("#info-dialog");

/* Inlogg reltaterade variabler */
const username = document.getElementById("input-username");
const password = document.getElementById("input-password");
const loginDialog = document.querySelector("#login-dialog");
const loginBtn = document.querySelector("#login-btn");
const escapeBtn = document.querySelector("#escape-btn");
const newUserBtn = document.querySelector("#new-user-btn");


const credentials = btoa(`${username.value}:${password.value}`);




/* Informations popup----------------------------------------------------------Informations poup----------------- */
function dialogCloseNClear() {
    infoDialog.close();
    infoDialog.querySelector('p').innerText = '';
}

function updateErrorInfoDialog(error) {
    infoDialog.querySelector('p').innerText = `Tillfälligt fel: ${error.message}`;
    infoDialog.showModal();
    infoDialog.querySelector('button').addEventListener('click', () => { dialogCloseNClear(); });
}

function updateInfoDialog(message) {
    infoDialog.querySelector('p').innerText = `${message}`;
    infoDialog.showModal();
    infoDialog.querySelector('button').addEventListener('click', () => { dialogCloseNClear(); });
}


/* ------------------------------------ */
/* IN och UTLOGGNINGS FUNKTIONER */
/* ------------------------------------ */
/* Logga in -----------------------------------------------------------------------------Logga in------------------ */
function showLoginDialog() {
    if (sessionStorage.getItem("principal") !== null) {
        updateInfoDialog("${principal.username}, du är redan inloggad!");
        loginDialog.close();
    } else {
        loginDialog.showModal();
        escapeBtn.addEventListener('click', () => { loginDialog.close(); });
        loginBtn.addEventListener('click', () => { login(); });
        newUserBtn.addEventListener('click', () => { changeMainContent("new-user"); loginDialog.close(); });
    }
}

function login() {
    const url = 'http://localhost:8080/api/v1/auth/login';
    fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "username": username.value, "password": password.value })
    })
        .then(response => {
            if (!response.ok) {
                updateInfoDialog(`Felaktigt inlogg. Dubbelkolla dina uppgifter.`);
                throw new Error('Felaktigt inlogg. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            /* Bättre att plocka ur datan och lägga i credentials eller likn? */
            loginDialog.close();
            sessionStorage.setItem("principal", JSON.stringify(data));
            updateInfoDialog(`Välkommen ${data.username}! Du är inloggad.`)
            checkRole();
        })

        .catch(error => console.error('Error:' + error.message));
}
/* Logga ut -----------------------------------------------------------------------------Logga ut------------------ */

function logout() {
    sessionStorage.clear();
    showGuestMenu();
    updateInfoDialog("Du är nu utloggad.");
}

/* ------------------------------------ */
/* BEHÖRGIHETS FUNKTOINER */
/* ------------------------------------ */

/* Sätter nav-meny utifrån användarroll */

document.querySelector("#hamburger-icon").addEventListener('click', () => { mobileMenu(); });
let navGuest = document.querySelector("#guest-menu");
let navUser = document.querySelector("#user-menu");
let navAdmin = document.querySelector("#admin-menu");

function mobileMenu() {
    const menu = document.querySelector(".mobile-menu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

function showGuestMenu() {
    navGuest.style.display = "block";
    navUser.style.display = "none";
    navAdmin.style.display = "none";
}

function showUserMenu() {
    navUser.style.display = "block";
    navGuest.style.display = "none";
    navAdmin.style.display = "none";

}

function showAdminMenu() {
    navAdmin.style.display = "block";
    navGuest.style.display = "none";
    navUser.style.display = "none";
}

function checkRole() {/* Skriv om så att man sparar kanske roll och användare i sessionstorage och plockar därifrån */
    const principal = JSON.parse(sessionStorage.getItem("principal"));
    console.log("från sessionStorage:", principal);
    if (principal === null) {
        showGuestMenu();
    } else if (principal.isAdmin === false) {
        showUserMenu();
    } else if (principal.isAdmin === true) {
        showAdminMenu();
    }

}

/* ------------------------------------ */
/* NAVIGATIONS FUNKTOINER */
/* ------------------------------------ */

/* Menylänkar-----------------------------------------------------------------------------Menylänkar---------------- */
/* Något smidigare sätt att göra detta på? Är det tungt med eventlisteners? */
/* Behörighet ALLA: */
document.querySelector("#cars-link").addEventListener('click', () => { changeMainContent("cars"); });
document.querySelector("#login-link").addEventListener('click', () => { showLoginDialog(); });

/* Behörighet ROLE_USER: */
document.querySelector("#user-cars-link").addEventListener('click', () => { changeMainContent("user-cars"); });
document.querySelector("#userpages-link").addEventListener('click', () => { changeMainContent("user-pages"); });
document.querySelector("#user-info-link").addEventListener('click', () => { changeMainContent("user-info"); });
document.querySelector("#user-bookings-link").addEventListener('click', () => { changeMainContent("user-bookings"); });
document.querySelector("#logout-user-link").addEventListener('click', () => { logout(); });
/* Behörighet ROLE_ADMIN: */
document.querySelector("#adm-vehicles-link").addEventListener('click', () => { changeMainContent("adm-vehicles"); });
document.querySelector("#adm-bookings-link").addEventListener('click', () => { changeMainContent("adm-bookings"); });
document.querySelector("#adm-users-link").addEventListener('click', () => { changeMainContent("adm-users"); });
document.querySelector("#adm-styleguide-link").addEventListener('click', () => { changeMainContent("adm-styleguide"); });
document.querySelector("#logout-user-link").addEventListener('click', () => { logout(); });
document.querySelector("#logout-admin-link").addEventListener('click', () => { logout(); });

let mainContent = document.querySelector(".main-content");

/* Byt innehåll på main-content */
function changeMainContent(page) {

    switch (page) {
        case "cars":
            carsPage();
            break;
        case "new-user":
            newUsersPage();
            document.querySelector("#reg-btn").addEventListener('click', () => { createNewUser(); });
            break;

        case "user-cars":
            userCarsPage();
            break;

        case "user-pages":
            userPagesPage();
            break;

        case "user-info":
            userInfoPage();
            break;

        case "user-bookings":
            userBookingsPage();
            break;

        case "adm-vehicles":
            admVehiclesPage();
            break;

        case "adm-bookings":
            admBookingsPage();
            break;

        case "adm-users":
            admUsersPage();
            break;

        case "adm-styleguide":
            admStyleguidePage();
            break;

        default:
            mainContent.innerHTML = "Vad hände nu? Det gick inte att ladda sidan.";
    }
}

/* InnerHTML-funktioner för pages */

function carsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Våra bilar</h2></section></div>`;
    fetchCars();
}

function newUsersPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Välkommen, registrera dig nedan.</h2></section>
    <div class="panel">            
    <form>
        <label for="fname" class="form-margin">Förnamn: </label><br>
            <input id="fname" class="input-fields form-margin" type="text"></input><br>

        <label for="lname" class="form-margin">Efternamn: </label><br>
            <input id="lname" class="input-fields form-margin" type="text"></input><br>

        <label for="phoneNr" class="form-margin">Telefonnummer: </label><br>
            <input id="phoneNr" type="tel" placeholder="070 123 45 78" class="input-fields form-margin form-text"></input><br>

        <label for="email" class="form-margin">Email (obs! Ditt framtida användarnamn): </label><br>
            <input id="email" type="email" placeholder="namn@mail.com" class="input-fields form-margin form-text"></input><br>

        <label for="password" class="form-margin">Lösenord: </label><br>
            <input id="password" type="password" placeholder="*****" class="input-fields form-margin form-text"></input><br>
    
        <button type="button" class=" form-margin std-btn pos-btn" id="reg-btn"> Registrera </button>
    </form>    
    </div>`;
}

function userCarsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Bilar och bokningsknapp syns av inloggade</section></div>`;
}

function userPagesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"> Mina sidor, ser bara din egen information</section></div>`;
}

function userInfoPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Användarinformation, ses bara av den inloggade</section></div>`;
}

function userBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Bokningar,ser bara dina egna bokningar</section></div>`;
}

function admVehiclesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN- alla bilar syns och kan sorteras åt alla håll</section></div>`;
}

function admBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN- alla bokningar syns. sorteras på activa och ej samt mot specifik kund.</section></div>`;
}

function admUsersPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Kunder - alla kunder syns. funktioner för att uppdatera, skapa och radera.</section></div>`;
}

function admStyleguidePage() {
    mainContent.innerHTML = `<div class="content-page"><section class ="headline-contentpage" >Styleguide</section></div>`;
}
/* ------------------------------------------------ */
/* DISPLAY-FUNKTIONER */
/*------------------------------------------------- */

/* Skapar en wrapper div och returnerar den efter append to content-page. */
function createPanelWrapper() {
    const page = document.querySelector(".content-page");
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("panel-wrapper");
    page.appendChild(wrapperDiv);
    return wrapperDiv;

}
/* Bilar  - Lägger in bilarna i lista omgärdad av wrapper.*/
function displayCars(cars) {
    const wrapper = createPanelWrapper();
    cars.forEach(car => {
        const innerDiv = document.createElement("div");
        innerDiv.innerHTML =
            ` <div class="panel">
            <dl>
        <dd> Märke : ${car.name}</dd>
        <dd> Modell : ${car.model}</dd>
        <dd> Pris : ${car.price} kr/dygn</dd>
        </dl>
        </div> `
        wrapper.appendChild(innerDiv);
    });
}
/* ------------------------------------------------ */
/* HÄMTA -INPUT */
/*------------------------------------------------- */
function getNewUserInfo() {
    const fname = document.querySelector('#fname');
    const lname = document.querySelector(`form #lname`);
    const phoneNr = document.querySelector("form #phoneNr");
    const email = document.querySelector("form #email");
    const password = document.querySelector("form #password");
    const newUser = {
        firstName:fname.value,
        lastName:lname.value,
        username:email.value,
        phone: phoneNr.value,
        email: email.value,
        password: password.value,
    "noOfOrders": 0
}
console.log(newUser);
return newUser;
}

function getNewBookingInfo() { }

function getNewCarInfo() { }




/* ------------------------------------------------ */
/* FETCH-FUNKTIONER */
/*------------------------------------------------- */

/* Hämta bilar */
async function fetchCars() {
    const url = 'http://localhost:8080/api/v1/cars';
    try {
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
            updateInfoDialog(`Något gick fel vid inladdnig av fordon. Prova igen senare.`);
            throw new Error(`Problem vid inladdnings. Status: ${response.status}`);
        }

        const data = await response.json();
        displayCars(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error);
    }
}
async function fetchCarById(id) {
    const url = `http://localhost:8080/api/v1/cars/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET'

        });
        if (!response.ok) {

            throw new Error(`Något gick fel vid inladdning av valt fordon. Status: ${response.status}`);
        }

        const data = await response.json();
        displayDataInDiv(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error);
    }
}

/* Hämta bokningar */


/* Hämta användare */


async function createNewUser() {
    const newUser = getNewUserInfo();
    const url = `http://localhost:8080/api/v1/users`;
    try {
        const responseUser = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });
        if (!responseUser.ok) {
            throw new Error(`Fel vid skapade av ny användare. Status: ${responseUser.status}`);
        }


        updateInfoDialog(`Registrering lyckades!`);
    } catch (error) {
        updateErrorInfoDialog(error);
    }



}