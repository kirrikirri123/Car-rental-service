document.addEventListener('DOMContentLoaded', () => {
    checkRole();
});

/* Informations dialogruta */
const infoDialog = document.querySelector("#info-dialog");

/* Inlogg reltaterade variabler */
const loginDialog = document.querySelector("#login-dialog");
const loginBtn = document.querySelector("#login-btn");
const escapeBtn = document.querySelector("#escape-btn");
const newUserBtn = document.querySelector("#new-user-btn");


/* Informations popup----------------------------------------------------------Informations poup----------------- */
function dialogCloseNClear() {
    infoDialog.close();
    infoDialog.querySelector('p').innerText = '';
}

function updateInfoDialog(message, i) {
    /* Uppdatera här så man kan välja icon eller meddelande. Info behöver ju inte stå i text. Kan vara en alt ellet title text på icon blir det bra tillgänglighet?? */
    infoDialog.querySelector('p').innerHTML = `${message}`;
    infoDialog.querySelector('H2').innerHTML = `${i}`;
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

async function login() {
    const userInfo = getLogInInfo();
    const url = 'http://localhost:8080/api/v1/auth/login';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "username": userInfo.username, "password": userInfo.password })
        })
        if (!response.ok) {
            updateInfoDialog(`Felaktigt inlogg. Dubbelkolla dina uppgifter.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            throw new Error('Felaktigt inlogg. Status: ' + response.status);
            return;
        }
        const data = await response.json();
        loginDialog.close();
        console.log(`${userinfo.username} och ${userinfo.password}`)
        const credentials = btoa(`${userinfo.username}:${userinfo.password}`);
        sessionStorage.setItem(`basicAuth`, `Basic ${credentials}`);
        sessionStorage.setItem("principal", JSON.stringify(data));
        updateInfoDialog(`Välkommen ${data.username}! <br> Du är inloggad.`, `<i class="fa-solid fa-user-check icon-larger"></i>`)
        checkRole();

    } catch (error) { console.error('Error:' + error.message) };
    fetchNSaveUserById();
}

function clearInputFields() {
    /* Ta bort data från inloggningsfälten */
}
/* Logga ut -----------------------------------------------------------------------------Logga ut------------------ */

function logout() {
    sessionStorage.clear();
    showGuestMenu();
    changeMainContent("home");
    updateInfoDialog('Utloggad. Välkommen åter!', `<i class="fa-solid fa-truck-fast icon-swoosh"></i>`);
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
        document.querySelector("#hamburger-icon").innerHTML = `<i class="fa-solid fa-bars"></i>`;
    } else {
        document.querySelector("#hamburger-icon").innerHTML = `<i class="fa-regular fa-circle-xmark"></i>`;
        menu.style.display = "block";
    }
}
function closeMobileMenu() {
    const menu = document.querySelector(".mobile-menu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
        document.querySelector("#hamburger-icon").innerHTML = `<i class="fa-solid fa-bars"></i>`;
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
/* Behörighet ALLA: */
document.querySelector("#cars-link").addEventListener('click', () => {
    changeMainContent("cars");
    closeMobileMenu();
});
document.querySelector("#login-link").addEventListener('click', () => { showLoginDialog(); });

/* Behörighet ROLE_USER: */
document.querySelector("#user-cars-link").addEventListener('click', () => {
    changeMainContent("user-cars");
    closeMobileMenu();
});
document.querySelector("#userpages-link").addEventListener('click', () => {
    changeMainContent("user-pages");
    closeMobileMenu();
});
document.querySelector("#user-info-link").addEventListener('click', () => {
    changeMainContent("user-info");
    closeMobileMenu();
});
document.querySelector("#user-bookings-link").addEventListener('click', () => {
    changeMainContent("user-bookings");
    closeMobileMenu();
});

document.querySelector("#logout-user-link").addEventListener('click', () => { logout(); });

/* Behörighet ROLE_ADMIN: */
document.querySelector("#home-link").addEventListener('click', () => {
    changeMainContent("home");
    closeMobileMenu();
});

document.querySelector("#adm-vehicles-link").addEventListener('click', () => {
    changeMainContent("adm-vehicles");
    closeMobileMenu();
});
document.querySelector("#adm-new-vehicles-link").addEventListener('click', () => {
    changeMainContent("adm-new-vehicles");
    closeMobileMenu();
});
document.querySelector("#adm-cars-link").addEventListener('click', () => {
    changeMainContent("user-cars");
    closeMobileMenu();
});
document.querySelector("#adm-bookings-link").addEventListener('click', () => {
    changeMainContent("adm-bookings");
    closeMobileMenu();
});

document.querySelector("#adm-history-link").addEventListener('click', () => {
    changeMainContent("adm-history");
    closeMobileMenu();
});
document.querySelector("#adm-users-link").addEventListener('click', () => {
    changeMainContent("adm-users");
    closeMobileMenu();
});
document.querySelector("#adm-new-user-link").addEventListener('click', () => {
    changeMainContent("new-user"); /* egen för admin som det går att välja roll på! */
    closeMobileMenu();
});
document.querySelector("#adm-styleguide-link").addEventListener('click', () => {
    changeMainContent("adm-styleguide");
    closeMobileMenu();
});
document.querySelector("#logout-admin-link").addEventListener('click', () => { logout(); });

let mainContent = document.querySelector(".main-content");

/* Byt innehåll på main-content */
function changeMainContent(page) {

    switch (page) {
        case "home":
            homePage();
            break;
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

        case "adm-new-vehicles":
            admChangeVehiclesPage();
            break;

        case "adm-bookings":
            admBookingsPage();
            break;

        case "adm-change-bookings":
            admChangeBookingsPage();
            break;

        case "adm-history":
            admHistoryPage();
            break;

        case "adm-users":
            admUsersPage();
            break;

        case "adm-change-user":
            admChangeUserPage();
            break;

        case "adm-styleguide":
            admStyleguidePage();
            break;

        default:
            mainContent.innerHTML = "Vad hände nu? Det gick inte att ladda sidan.";
    }
}

/* InnerHTML-funktioner för pages */

function homePage() {
    mainContent.innerHTML = `
            <div id="hero">
                <img src="/img/images/corvetteZ06.jpg" alt="Corvette Z06" width="100%">
                <h1>service<br>security<br>speed</h1>
            </div>
            <div class="panel-wrapper">
                <div class="panel"><p>"Wow! Alltid en bra upplevelse." <br>- Kickan K (VD REVENT) </p>
                </div>
                <div class="panel"><p>"Fantastiskt! Fyra tummar upp!"</p>
                </div>
                <div class="panel"><p>"För bra! Överleverar alltid." <br>- Edström Entreprenad </p>
                </div>
    </div>`
}


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
    </div></div>`;
}

function userCarsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Boka våra exklusiva fordon.</h2></section>
    </div>`;
    fetchCars();
    /* activateBooking(); funktion som öppnar bokniningsknappen */
}
function bookingDialog() {
    const dialog = document.querySelector(`#booking-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Boka fordon</h2>
                <p> Bokas från idag och till ditt valda datum. <br>
                Välkommen in och hämta nycklarna - Trevlig körning!
                </p>
            </div>
            <form id="booking-form">
                <label for="input-date">Återlämnings dag:</label><br>
                <input id="input-date" type="date" class="form-margin"><br>               
                <span class="btn-spacer">
                    <button id="book-btn" type="button" class="std-btn pos-btn book-btn">BOKA</button>
                    <button id="exit-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
    dialog.querySelector('#book-btn').addEventListener('click', () => {
        console.log("Tryckt på bokningsknapp i dialogruta");
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}

function userPagesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Hej !
    Här hittar du din historik och din personliga information och dina exklusiva erbjudanden från våra utvalda samarbetspartners.</h2></section></div>`;
}

function userInfoPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Din medlemsinformation </h2> </section></div>`;
    fetchUserById();
}

function userBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Dina bokningar </h2></section></div>`;
    fetchBookingsById();
}

function admVehiclesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> ADMIN - Bilar som visas och sorteras.</h2></section>
    <div class="table-div">
    <table class="adm-table" id="carsTable">
    <thead>
       <tr>
            <th>Redigera bil</th>
            <th>Id</th>
            <th>Tillverkare</th>
            <th>Modell</th>
            <th>Typ</th>
            <th>Finness</th>
            <th>Utrustning</th>
            <th>Tillbehör</th>
            <th>Bokad</th>
            
        </tr>
    </thead>
    <tbody><td> Inga fordon att visa </td></tbody>
    <table>
    </div>
    </div>
    `;
    fetchAdmCars();
    /* Visa bilar, sortera bilar, skapa nya bilar. */
}
function admChangeVehiclesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN - Lägg till bilar. </section>
    <div class="panel">            
    <h3>Addera nytt fordon</h3>
    <form>
        <label for="brand" class="form-margin">Tillverkare: </label><br>
            <input id="brand" class="input-fields form-margin" type="text"></input><br>

        <label for="model" class="form-margin">Modell: </label><br>
            <input id="model" class="input-fields form-margin" type="text"></input><br>

        <label for="price" class="form-margin">Kostnad/dygn: </label><br>
            <input id="price" type="number" placeholder="3500" class="input-fields form-margin form-text"></input><br>
       
        <label for="feature1" class="form-margin">Utrustning ex. 1: </label><br>
            <input id="feature1" type="text" class="input-fields form-margin form-text"></input><br>

        <label for="feature2" class="form-margin">Utrustning ex.2: </label><br>
            <input id="feature2" type="text"  class="input-fields form-margin form-text"></input><br>

        <label for="feature3" class="form-margin">Utrustning ex.3:</label><br>
            <input id="password" class="input-fields form-margin form-text"></input><br>
            
        <label for="type" class="form-margin">Klass: </label><br>
        <select id="type" name="type" class="form-margin input-fields">
        <option value="combi">Komib</option>
        <option value="sedan">Sedan</option>
        <option value="cab">Cab</option>
        <option value="electric">El</option>
        <option value="bus">Familjebuss</option>
        </select><br>
            
        <button type="button" class="std-btn pos-btn" id="reg-btn"> Registrera </button>
    </form>    
    </div>
    </div>`;
}

function admBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN - Bokningar som kan sorteras på aktiva och inte. Samt för specifik kund. Samt AVSLUT.</section>
    <table class="adm-table" id="activeBookingsTable">
    <thead>
       <tr>
            <th>Återlämna</th>
            <th>Boknings-id</th>
            <th>Kund-id</th>
            <th>Bil-id</th>
            <th>Från Datum</th>
            <th>Till Datum</th>
            <th>Redigera bokning</th>
            
        </tr>
    </thead>
    <tbody><td> Inga bokningar att visa</td></tbody>
    <table> 
    </div>   
    `;
    fetchActiveBookings();
}
function admChangeBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN - Bokningar skapas, redigeras och tas bort.</section></div>`;
}

function admHistoryPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">ADMIN - Alla bokningar - All info. </section>
    <table class="adm-table" id="bookingsTable">
    <thead>
       <tr>
            <th>Boknings-id</th>
            <th>Kund-id</th>
            <th>Bil-id</th>
            <th>Från Datum</th>
            <th>Till Datum</th>
            <th>Aktiv uthyrning</th>

        </tr>
    </thead>
    <tbody><td> Ingen bokningshistorik att visa </td></tbody>
    <table>    
    </div>
    `;
    fetchAllBookings();
}

function admUsersPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Kunderinformation - Här finns funktioner att uppdatera och radera.</section>
    <table class="adm-table" id="usersTable">
    <thead>
       <tr>
            <th>Redigera kund</th>
            <th>Kund-id</th>
            <th>Email</th>
            <th>Förnamn</th>
            <th>Efternamn</th>
            <th>Antal hyresordrar</th>
            <th>Telefonnummer</th>
            <th>Roll</th>
            <th>Ev. användarnamn</th>
        </tr>
    </thead>
    <tbody><td> Inga användare att visa</td></tbody>
    <table> 
    </div>   
    `;
    fetchUsers();
}

function admChangeUserPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Kunder - skapa, updatera och radera.</section></div>`;
}

function admStyleguidePage() {
    mainContent.innerHTML = `<div class="content-page"><section class ="headline-contentpage" >Styleguide</section></div>`;
}

function updateUserDialog(user) {
    const dialog = document.querySelector('#update-dialog');
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Uppdatera användare</h2>
                <p></p>
            </div>
            <form id="update-form">
            <label for="fname" class="form-margin">Förnamn: </label><br>
                <input id="fname" class="input-fields form-margin" type="text" value="${user.firstName}"><br>

            <label for="lname" class="form-margin">Efternamn: </label><br>
                <input id="lname" class="input-fields form-margin" type="text" value="${user.lastName}"><br>

            <label for="phoneNr" class="form-margin">Telefonnummer: </label><br>
                <input id="phoneNr" type="tel"  class="input-fields form-margin form-text" value="${user.phone}"><br>

            <label for="email" class="form-margin">Email: </label><br>
                <input id="email" type="email" class="input-fields form-margin form-text" value="${user.email}"><br>
            
            <label for="username" class="form-margin">Användarnamn: </label><br>
                <input id="username" type="text" class="input-fields form-margin form-text" value="${user.username}"><br>

            <label for="password" class="form-margin">Lösenord: </label><br>
                <input id="password" type="password" placeholder="*****" class="input-fields form-margin form-text" value="${user.password}"><br>
            <span class="btn-spacer">
                <button type="button" class="std-btn pos-btn book-btn" id="update-btn">Uppdatera</button>
                <button type="button" class="std-btn neg-btn" id="exit-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
    dialog.querySelector('#update-btn').addEventListener('click', () => {
        updateUser(`${user}`);
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}

/* UPDATERINGS FUNKTIONER ____________________________________________________________________________________________________________*/
function updateCarDialog() {
    const dialog = document.querySelector(`#update-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Uppdatera fordon</h2>
                <p></p>
            </div>
     <form id="update-form">
        <label for="brand" class="form-margin">Tillverkare: </label><br>
            <input id="brand" class="input-fields form-margin" type="text"></input><br>

        <label for="model" class="form-margin">Modell: </label><br>
            <input id="model" class="input-fields form-margin" type="text"></input><br>

        <label for="price" class="form-margin">Kostnad/dygn: </label><br>
            <input id="price" type="number" placeholder="3500" class="input-fields form-margin form-text"></input><br>
       
        <label for="feature1" class="form-margin">Utrustning ex. 1: </label><br>
            <input id="feature1" type="text" class="input-fields form-margin form-text"></input><br>

        <label for="feature2" class="form-margin">Utrustning ex.2: </label><br>
            <input id="feature2" type="text"  class="input-fields form-margin form-text"></input><br>

        <label for="feature3" class="form-margin">Utrustning ex.3:</label><br>
            <input id="password" class="input-fields form-margin form-text"></input><br>
            
        <label for="type" class="form-margin">Klass: </label><br>
        <select id="type" name="type" class="form-margin input-fields">
        <option value="combi">Komib</option>
        <option value="sedan">Sedan</option>
        <option value="cab">Cab</option>
        <option value="electric">El</option>
        <option value="bus">Familjebuss</option>
        </select><br>
                <span class="btn-spacer">
                    <button type="button" class="std-btn pos-btn book-btn" id="update-car-btn">Uppdatera</button>
                    <button id="escape-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
}
function updateBookingDialog() {
    const dialog = document.querySelector(`#update-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Uppdatera bokning</h2>
                <p></p>
            </div>
            <form id="update-form">
                <label for="input-date">Återlämnings dag:</label><br>
                <input id="input-date" type="date" class="form-margin"><br>               
                <span class="btn-spacer">
                    <button type="button" class="std-btn pos-btn book-btn">Uppdatera</button>
                    <button id="escape-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
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
        const imgSrc = `/img/images/cars/${car.model}.jpg`;
        const defaultSrc = `/img/images/cars/default.png`;
        innerDiv.innerHTML =
            ` <div class="panel panel-car">
            <div id="car-img"><img src= ${imgSrc} onerror ="this.onerror=null; this.src='${defaultSrc}'" alt="Exempel bild av hyrbil" class="img-car"><div>
            <dl>
        <dd><b>Märke:</b> ${car.name}</dd>
        <dd><b>Modell:</b> ${car.model}</dd>
        <dd><b>Pris:</b> ${car.price} kr/dygn</dd>
        <dd> <i class="fa-solid fa-road"></i> ${car.type} </dd>
        </dl>
        <div class="btn-spacer">
        <button onclick="fetchCarById(${car.id})" class="std-btn pos-btn car-info-btn"> Se mer </button> 
        </div></div> `
        wrapper.appendChild(innerDiv);
    });
}

function displayACar(car) {
    const page = document.querySelector(".content-page");
    page.innerHTML = "";
    const wrapper = createPanelWrapper();
    const imgSrc = `/img/images/cars/${car.model}.jpg`;
    const defaultSrc = `/img/images/cars/default.png`;

    const innerDiv = document.createElement("div");
    innerDiv.innerHTML =
        ` <div class="panel panel-car">
            <h2> ${car.name} - ${car.model}</h2>
            <div id="car-img"><img src= ${imgSrc} onerror ="this.onerror=null; this.src='${defaultSrc}'" alt="Exempel bild av hyrbil" class="img-car"></div>
            <button onclick= 'bookingDialog()' class="std-btn pos-btn book-btn" id="book-btn pos-btn"> Boka nu </button> 
            <dl>
        <dt><b>Märke:</b></dt><dd>${car.name}</dd>
        <dt><b>Modell:</b></dt> <dd>${car.model}</dd>
        <dt><b>Pris:</b></dt> <dd> ${car.price} kr/dygn <i class="fa-regular fa-credit-card"></i></dd>
        <dt><b>Utrustning:</b><br></dt>
        <dd>-${car.feature1}</dd>
        <dd>-${car.feature2}</dd>
        <dd>-${car.feature3}</dd>
        </dl>
        <div class="btn-left">
        <button onclick= 'changeMainContent("user-cars")' class="std-btn neg-btn return-btn"> Fler bilar </button> 
        </div></div> `
    wrapper.appendChild(innerDiv);
}

function displayCarsTable(cars) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#carsTable')
    const tbody = document.querySelector('#carsTable tbody');
    tbody.innerHTML = "";
    cars.forEach(car => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
      <td>
      <button onclick="fetchCarById(${car.id})"class="std-btn neg-btn" alt="Knapp för att redigera eller radera bil" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
      </td>
      <td>${car.id}</td>
      <td>${car.name}</td>
      <td>${car.model}</td>
      <td>${car.type}</td>
      <td>${car.feature1}</td>
      <td>${car.feature2}</td>
      <td>${car.feature3}</td>
      <td>${car.booked}</td>
        `
        tbody.appendChild(tr);
    });
    wrapper.appendChild(table);
};

/* Användare  */
function displayUser(user) {
    const wrapper = createPanelWrapper();
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML =
        ` <div class="panel panel-important">
            <dl>
        <dd><b>Medlemsnr:</b> ${user.id}</dd>
        <dd><b> Namn :</b> ${user.firstName} ${user.lastName}</dd>
        <dd><b> Telefonnr :</b> ${user.phone} </dd>
        <dd><b> Email / Användarnamn :</b> ${user.email} </dd>
        </dl>
        </div> `
    wrapper.appendChild(innerDiv);
}

function displayUpdateUser(user) {
    const wrapper = createPanelWrapper();
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML =
        ` 
        <div class="panel-wrapper">
        <div class="panel panel-important">
            <dl>
        <dd><b>Medlemsnr:</b> ${user.id}</dd>
        <dd><b> Förnamn :</b> ${user.firstName}</dd>
        <dd><b> Efternamn :</b>${user.lastName}</dd>
        <dd><b> Telefonnr :</b> ${user.phone} </dd>
        <dd><b> Email:</b> ${user.email} </dd>
        <dd><b> Användarnamn:</b> ${user.username} </dd>
        <dd><b> Roll:</b>${user.role}</dd>
        </dl>
        </div> 
        <div class="btn-spacer">      
        <button id="update-btn" class="std-btn" alt="Knapp för att redigera kund" title="Uppdatera"> <i class="fa-solid fa-wrench"></i> </button>
        <button id="delete-btn" class="std-btn neg-btn" alt="Knapp för att radera kund" title="Radera"><i class="fa-regular fa-trash-can"></i></button>/* DELETA MED BEKRÄFTELSE I DIALOG */
        </div>
        </div>`
    wrapper.appendChild(innerDiv);

    innerDiv.querySelector('#update-btn').addEventListener('click', () => { updateUserDialog(`${user}`); });  
    innerDiv.querySelector('#delete-btn').addEventListener('click', () => { deleteUserDialog(`${user}`); });
    }


function displayAllUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            `
        <td>
        <button onclick='fetchUserForUpdateView(${user.id})' class="std-btn neg-btn" alt="Knapp för att redigera eller radera kund" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
        </td>
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.noOfOrders}</td>
        <td>${user.phone}</td>
        <td>${user.role}</td>
        <td>${user.username} </td>

        `
        tbody.appendChild(tr);
    });
}
function displayActiveBookingsTable(bookings) {
    const tbody = document.querySelector('#activeBookingsTable tbody');
    tbody.innerHTML = "";
    bookings.forEach(booking => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
       <td>
     <button onclick="returnCar(${booking.id})" class="std-btn"> Återlämna fordon </button>
      </td>
      <td>${booking.id}</td>
      <td>${booking.userId}</td>
      <td>${booking.carId}</td>
      <td>${booking.fromDate}</td>
      <td>${booking.toDate}</td> 
      <td>
      <button onclick='fetchBookingById(${booking.id})' class="std-btn neg-btn" alt="Knapp för att redigera eller radera bokning" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
      </td>  `
        tbody.appendChild(tr);
    });
}

function displayBookingsTable(bookings) {

    const tbody = document.querySelector('#bookingsTable tbody');
    tbody.innerHTML = "";
    bookings.forEach(booking => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
      <td>${booking.id}</td>
      <td>${booking.userId}</td>
      <td>${booking.carId}</td>
      
      <td>${booking.fromDate}</td>
      <td>${booking.toDate} </td>     
      <td>${booking.active}</td>
        `
        tbody.appendChild(tr);
    });
}
/* ------------------------------------------------ */
/* HÄMTA -INPUT */
/*------------------------------------------------- */
function getLogInInfo() {
    const usern = document.getElementById("input-username");
    const pswrd = document.getElementById("input-password");
    const userInfo = {
        username: usern.value,
        password: pswrd.value
    }
    return userInfo;
}

function getNewUserInfo() {
    const fname = document.querySelector('#fname');
    const lname = document.querySelector(`form #lname`);
    const phoneNr = document.querySelector("form #phoneNr");
    const email = document.querySelector("form #email");
    const password = document.querySelector("form #password");
    const newUser = {
        firstName: fname.value,
        lastName: lname.value,
        username: email.value,
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

function getUpdatedUser() {
    const dialog = document.querySelector('#update-dialog');
    const fname = dialog.querySelector('form #fname');
    const lname = dialog.querySelector(`form #lname`);
    const email = dialog.querySelector("form #email");
    const phoneNr = dialog.querySelector("form #phoneNr");
    const username = dialog.querySelector("form #username");
    const password = dialog.querySelector("form #password");
    const updatedUser = {
        firstName: fname.value,
        lastName: lname.value,
        username: username.value,
        phone: phoneNr.value,
        email: email.value,
        password: password.value
    }
    return updatedUser;
}


/* ------------------------------------------------ */
/* FETCH-FUNKTIONER */
/*------------------------------------------------- */

/* Hämta bilar */
async function fetchCars() {
    const url = 'http://localhost:8080/api/v1/cars';
    try {
        const response = await fetch(url, { method: 'GET' })

        if (!response.ok) {
            throw new Error(`Något gick fel vid inladdnig av fordon. Prova igen senare. Status: ${response.status}`);
        }

        const data = await response.json();
        displayCars(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

async function fetchCarById(id) {
    const url = `http://localhost:8080/api/v1/cars/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }
        })
        if (!response.ok) {
            if (`${response.status}` === '401') { throw new Error(`Logga in för att boka och se mer info kring våra fordon.`); }
            throw new Error(`Något gick fel vid inladdning av valt fordon. Status: ${response.status}`);
        }

        const data = await response.json();
        displayACar(data);

    } catch (error) {
        console.error(`Fel vid inladdning av specifikt fordon. Error: ${error.message}`);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst"></i>`);
    }
}
/* Hämta bilar för admin -view! */
async function fetchAdmCars() {
    const url = 'http://localhost:8080/api/v1/cars';
    try {
        const response = await fetch(url,
            {
                method: 'GET'
            })
        if (!response.ok) {
            updateInfoDialog(`Något gick fel vid inladdnig av fordon. Prova igen senare eller kontakta ansvarig för databasen.`);
            throw new Error(`Problem vid inladdning. Status: ${response.status}`);
        }

        const data = await response.json();
        displayCarsTable(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error);
    }
}
async function fetchNUpdateCar(id) {
}

async function updateNSaveUser() { }
async function updateNSaveCar() { }
async function updateNSaveBooking() { }

async function fetchNUpdateBooking(id) {
}

/* Radera bil */
async function deleteCar(id) {

}

/* Skapa bil */
async function createNewCar() {/* KOlla upp hur backenden ser ut!!!!!! */
    const newCar = getNewCarInfo();
    const url = `http://localhost:8080/api/v1/cars`;
    try {
        const responseCar = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCar)
        });
        if (!responseCar.ok) {
            throw new Error(`Fel vid skapade av nytt fordon. Status: ${responseCar.status}`);
        }
        updateInfoDialog(`Registrering av fordon lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
    } catch (error) {
        updateErrorInfoDialog(error);
    }

}

/* Hämta bokningar */
async function fetchActiveBookings() {
    const url = 'http://localhost:8080/api/v1/bookings/active';
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    "Authorization": `${credentials}`
                }
            })
        if (!response.ok) {
            updateInfoDialog(`Något gick fel vid inladdnig av bokningar. Prova igen senare eller kontakta ansvarig för databasen.`);
            throw new Error(`Problem vid inladdning. Status: ${response.status}`);
        }

        const data = await response.json();
        displayActiveBookingsTable(data);

    } catch (error) {
        console.error('Error:' + error.message, ` `);
        updateInfoDialog("Fel uppstod: " + error);
    }
}

async function fetchAllBookings() {
    const url = 'http://localhost:8080/api/v1/bookings';
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    "Authorization": `${credentials}`
                }
            })
        if (!response.ok) {
            updateInfoDialog(`Något gick fel vid inladdnig av bokningar. Prova igen senare eller kontakta ansvarig för databasen.`);
            throw new Error(`Problem vid inladdning. Status: ${response.status}`);
        }
        const data = await response.json();
        displayBookingsTable(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst"></i>`);
    }
}

/* Skapa ny bokning */
async function createNewBooking() {/* KOlla upp hur backenden ser ut!!!!!! */
    const newBooking = getNewBookingInfo();
    const url = `http://localhost:8080/api/v1/bookings`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newBooking)
        });
        if (!response.ok) {
            throw new Error(`Fel vid skapade av uthyrning. Status: ${response.status}`);
        }
        updateInfoDialog(`Uthyrning lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
    } catch (error) {
        updateErrorInfoDialog(error);
    }
}

/* Hämta användare */
async function fetchUsers() {
    const url = 'http://localhost:8080/api/v1/users';
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    "Authorization": `${credentials}`
                }
            });

        if (!response.ok) {
            updateInfoDialog(`Något gick fel vid inladdnig av kunder. Prova igen senare.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            throw new Error(`Problem vid inladdnings. Status: ${response.status}`);
        }

        const data = await response.json();
        displayAllUsers(data);

    } catch (error) {
        console.error('Error:' + error.message);
    }
}

/* Hämtar bara den som är inloggad! */
async function fetchUserById() {
    const principal = JSON.parse(sessionStorage.getItem("principal"));
    const id = principal.userId;
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/users/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }

        });
        if (!response.ok) {
            throw new Error(`Något gick fel vid verifiering av användare. Status: ${response.status}`);
            if (response.status === 403) {
                updateInfoDialog(`Tyvärr, din behörighet når inte hit.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
        }

        const data = await response.json();
        displayUser(data);


    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

async function fetchNSaveUserById() {
    const principal = JSON.parse(sessionStorage.getItem("principal"));
    const id = principal.userId;
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/users/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.ok) {
            throw new Error(`Något gick fel vid verifiering av användare. Status: ${response.status}`);
        }

        const data = await response.json();
        sessionStorage.setItem("user_principal", JSON.stringify(data));


    } catch (error) {
        console.error('Fel vid laddning och sparande av specifik användare:' + error.message);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Hämta spoecifik user för updatering vy. */

async function fetchUserForUpdateView(id) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/users/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }

        });
        if (!response.ok) {
            throw new Error(`Något gick fel vid verifiering av användare. Status: ${response.status}`);
            if (response.status === 403) {
                updateInfoDialog(`Tyvärr, din behörighet når inte hit.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
        }
        const data = await response.json();
        displayUpdateUser(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

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
        updateInfoDialog(`Registrering lyckades!`, `<i class="fa-solid fa-user-check"></i>`);

    } catch (error) {
        updatInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Radera användare */
async function deleteUser(id) {

}

/* Updatera användare */

async function updateUser(id) {
    const updatedUser = getUpdatedUser();
    const url = `http://localhost:8080/api/v1/users/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const responseUser = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${credentials}`
            },
            body: JSON.stringify(updatedUser)
        });
        if (!responseUser.ok) {
            throw new Error(`Fel vid updatering av ny användare. Status: ${responseUser.status}`);
        }
        updateInfoDialog(`Uppdatering lyckades!`, `<i class="fa-solid fa-user-check"></i>`);

    } catch (error) {
        updatInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}