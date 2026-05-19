
/* Informations dialogruta */
const infoDialog = document.querySelector("#info-dialog");

/* Inlogg reltaterade variabler */
const username = document.getElementById("input-username");
const password = document.getElementById("input-password");
const loginDialog = document.querySelector("#login-dialog");
const loginBtn = document.querySelector("#login-btn");
const escapeBtn = document.querySelector("#escape-btn");

const credentials = btoa(`${username.value}:${password.value}`);


/* Sätt nav-meny utifrån användarroll */

let navGuest = document.querySelector("#guest-menu");
let navUser = document.querySelector("#user-menu");
let navAdmin = document.querySelector("#admin-menu");


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

function checkRole() {
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
checkRole();


/* Informations popup----------------------------------------------------------Informations poup----------------- */
function dialogCloseNClear() {
    infoDialog.close();
    infoDialog.querySelector('p').innerText = '';
}

function updateErrorInfoDialog(error) {
    infoDialog.querySelector('p').innerText = `Tillfälligt fel: ${error.message}`;
    infoDialog.showModal();
    infoDialog.querySelector('button').addEventListener('click', () => { dialogCloseNClear(); })
}

function updateInfoDialog(message) {
    infoDialog.querySelector('p').innerText = `${message}`;
    infoDialog.showModal();
    infoDialog.querySelector('button').addEventListener('click', () => { dialogCloseNClear(); })
}

/* Logga in -----------------------------------------------------------------------------Logga in------------------ */
function showLoginDialog() {
    if (sessionStorage.getItem("principal") !== null) {
        updateInfoDialog("${principal.username}, du är redan inloggad!");
        loginDialog.close();
    } else {
        loginDialog.showModal();
        escapeBtn.addEventListener('click', () => { loginDialog.close(); });
        loginBtn.addEventListener('click', () => { login(); });
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

                throw new Error('Felaktigt inlogg. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            /* Bättre att plocka ur datan och lägga i credentials eller likn? */
            loginDialog.close();
            sessionStorage.setItem("principal", JSON.stringify(data));
            infoDialog.querySelector('p').innerText = `Välkommen ${data.username}! Du är inloggad.`;
            infoDialog.showModal();
            infoDialog.querySelector('button').addEventListener('click', () => { infoDialog.close(); });
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

/* Byt innehåll på main-content */
function changeMainContent(page) {
    let mainContent = document.querySelector(".main-content");

    switch (page) {
        case "cars":
            mainContent.innerHTML = `<section>Våra bilar - syns av alla</section>`;
            break;
        case "user-cars":
            mainContent.innerHTML = `<section>Bilar och bokningsknappar syns av inloggade</section>`;
            break;
        case "user-pages":
            mainContent.innerHTML = `<section>Mina sidor, ser bara din egen information</section>`;
            break;
        case "user-info":
            mainContent.innerHTML = `<section>Användarinformation, ses bara av den inloggade</section>`;
            break;
        case "users-bookings":
            mainContent.innerHTML = `<section>Bokningar,ser bara dina egan bokningar</section>`;
            break;
        case "adm-vehicles":
            mainContent.innerHTML = `<section>ADMIN- alla bilar syns och kan sorteras åt alla håll</section>`;
            break;
        case "adm-bookings":
            mainContent.innerHTML = `<section>ADMIN- alla bokningar syns. sorteras på activa och ej samt mot specifik kund.</section>`;
            break;
        case "adm-users":
            mainContent.innerHTML = `<section>Kunder - alla kunder syns. funktioner för att uppdatera, skapa och radera.</section>`;
            break;
        case "adm-styleguide":
            mainContent.innerHTML = `<section>Styleguide</section>`;
            break;


        default:
            mainContent.innerHTML = "Vad hände nu? Det gick inte att ladda sidan.";
    }
}


/* Menylänkar-----------------------------------------------------------------------------Menylänkar---------------- */
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



/* Hämta alla bilar - behöver ingen auth */

function putCarsInSection() {
    /* const section = document.querySelector("car-section"); */

    let carList = JSON.parse(data);
    carList.forEach(car => {
        const div = document.createElement("div");
        div.innerHTML =
            `<ul>
        <li>${car.name}</li>
        <li>${car.model}</li>
        <li> ${car.price}</li>
        </ul>
        `
        section.appendChild(div);
    })
}

async function fetchCars() {
    const url = 'http://localhost:8080/api/v1/cars';
    try {
        const response = await fetch(url, { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Något gick fel vid hämtning av bilar. Status: ' + response.status);
                }
            })
        const data = await response.json();
        console.log(data);
        putCarsInSection(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog(error);
    }
}




/* Hämta bokningar */


/* Hämta användare */