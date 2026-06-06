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

const mql = window.matchMedia("(min-width: 768px)");
/* mql.addEventListener("change", () => displayData()); */

/* Spara valet om lediga bilar? */
/* const userSortChoices = {
    cars: []
} */

/* ------------------------------------ */
/* SORTERINGS FUNKTIONER OCH VARIABLER */
/* ------------------------------------ */
/* Sortera -----------------------------------------------------------------------------Sortera------------------ */

/*Listan som ska sorteras*/
const dataStore = {
    cars: [],
    users: [],
    myActiveBookings: [],
    bookings: [],
    bookingsActive: []
}

/* Listor med riktningar för sortering, hämtas med rätt nyckel. */
let carSortState = {
    id: { direction: "asc" },
    name: { direction: "asc" },
    model: { direction: "asc" },
    type: { direction: "asc" }
}
let userSortState = {
    id: { direction: "asc" },
    email: { direction: "asc" },
    noOfOrders: { direction: "asc" },
    firstName: { direction: "asc" },
    lastName: { direction: "asc" },
    phone: { direction: "asc" },
    role: { direction: "asc" },
    username: { direction: "asc" }
}
let bookingSortState = {
    id: { direction: "asc" },
    userId: { direction: "asc" },
    carId: { direction: "asc" },
    fromDate: { direction: "asc" },
    toDate: { direction: "asc" }
};
/* Nycklar för sortering sortKeys*/
const sortKeys = {
    cars: carSortState,
    users: userSortState,
    bookings: bookingSortState,
    bookingsActive: bookingSortState
}
/* Tar nuvarande sorteringshåll och byter håll inför nästa klick. */
function saveDir(listName, sortValue) {
    const currentDir = sortKeys[listName][sortValue].direction;
    sortKeys[listName][sortValue].direction = currentDir === "asc" ? "desc" : "asc";
}

/* Returnerar tillgängliga bilar*/
function availableCars() {
    return dataStore.cars.filter(car => { return car.booked === false });
}
/* Returnerar aktiva boknignar */
function activeBookings() {
    return dataStore.bookings.filter(booking => { return booking.active === true });
}
/* Returnerar -användarens- aktiva boknignar */
function myActiveBookings() {
    return dataStore.myActiveBookings.filter(booking => { return booking.active === true });
}

/* Rullistor : Sorterar och displayar fordon */
function sortByBrand(brand) {
    const sortedCars = dataStore.cars.filter(car => car.name.toLowerCase() === brand.toLowerCase());
    displayCars(sortedCars);
}
/*Rulllistor: Sorterar och displayar fordon*/
function sortByType(type) {
    const sortedCars = dataStore.cars.filter(car => car.type.toLowerCase() === type.toLowerCase());
    displayCars(sortedCars);
}
/* Allmänn sorterare */
function sortTableList(datalist, listName, sortValue) {
    const sortState = sortKeys[listName]; /* Hämtar rätt sortering ur rätt lista */
    const valueDirection = sortState[sortValue].direction;/* Vilket håll ska datan sorteras. */
    const sortedList = [...datalist].sort((a, b) => {
        const dir = valueDirection === "asc" ? 1 : -1;  /* Om valueDirection är  asc blir dir 1 annars -1 . -1 sorterar åt andra hållet från slutet. */

        const valueA = a[sortValue];
        const valueB = b[sortValue];

        if (typeof valueA === "number" && typeof valueB === "number") {
            return (valueA - valueB) * dir; /* För nummervärden, skillnaden gångrat med dir ger rätt sorteringsordning. */
        }
        else {
            return valueA.localeCompare(valueB, "sv") * dir;
        }
    });
    saveDir(listName, sortValue);
    changeDirectionIcon(valueDirection, sortValue);
    return sortedList;
}

function changeDirectionIcon(valueDirection, sortValue) {
    const icon = document.querySelector(`#${sortValue}-sortbtn span`);
    icon.innerHTML = "";
    dir = valueDirection === "asc" ? "desc" : "asc";
    if (dir === "asc") { icon.innerHTML = `<i class="fa-solid fa-arrow-down-short-wide " title="Stigande / A-Ö"></i>`; }
    if (dir === "desc") { icon.innerHTML = `<i class="fa-solid fa-arrow-down-wide-short " title="Fallande / Ö-A"></i>`; }
}



function carType(carType) {
    switch (carType.toLowerCase()) {
        case "combi": return "Kombi";
        case "sedan": return "Sedan";
        case "cab": return "Cab";
        case "electric": return "El";
        case "bus": return "Minibuss";
        case "sport": return "Sport";
        default: return "Okänd";
    }
}


/* Informations popup-------------------------------------------------------------------Informations poup--------------------- */
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
        updateInfoDialog("Hmmm.. du verkar redan vara redan inloggad! Stäng appen och prova igen.");
        loginDialog.close();
    } else {
        loginDialog.showModal();
        escapeBtn.addEventListener('click', () => { loginDialog.close(); });
        loginBtn.addEventListener('click', () => { login(); });
        newUserBtn.addEventListener('click', () => { changeMainContent("new-user"); loginDialog.close(); });
    }
}

async function login() {
    const url = 'http://localhost:8080/api/v1/auth/login';
    try {
        const userInfo = getLogInInfo();
        const response = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "username": userInfo.username, "password": userInfo.password })
        })
        if (!response.ok) {
            console.error('Error in credetials:' + response.status);
            throw new Error('Felaktiga inloggningsuppgifter, dubbelkolla din info.');
        }
        const data = await response.json();
        loginDialog.close();
        const credentials = btoa(`${userInfo.username}:${userInfo.password}`);
        sessionStorage.setItem(`basicAuth`, `Basic ${credentials}`);
        sessionStorage.setItem("principal", JSON.stringify(data));
        updateInfoDialog(`Välkommen ${data.username}! <br> Du är inloggad.`, `<i class="fa-solid fa-user-check icon-larger"></i>`)
        checkRole();
        fetchNSaveUserById();

    } catch (error) {
        if (error instanceof ValidationError) {
            updateInfoDialog(error.message, error.icon);
        }
        console.log(error+ "i login");
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
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


function checkRole() {
    const principal = JSON.parse(sessionStorage.getItem("principal"));
    if (principal === null) {
        showGuestMenu();
    } else if (principal.isAdmin === false) {
        showUserMenu();
    } else if (principal.isAdmin === true) {
        showAdminMenu();

    }
}
/* returnerar true om man är admin */
function isAdmin() {
    const principal = JSON.parse(sessionStorage.getItem("user_principal"));
    if (principal.role === "ROLE_ADMIN") { return true; }
    else if (!principal.role === "ROLE_ADMIN") {
        return false;
    }
}

/* ------------------------------------ */
/* NAVIGATIONS FUNKTOINER */
/* ------------------------------------ */

/* Menylänkar--------------------------------------------------------------------------------------------Menylänkar---------------- */

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
    changeMainContent("adm-all-bookings");
    closeMobileMenu();
});
document.querySelector("#adm-users-link").addEventListener('click', () => {
    changeMainContent("adm-users");
    closeMobileMenu();
});
document.querySelector("#adm-new-user-link").addEventListener('click', () => {
    changeMainContent("adm-new-user");
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

        case "adm-all-bookings":
            admAllBookingsPage();
            break;

        case "adm-users":
            admUsersPage();
            break;

        case "adm-new-user":
            newUsersPage();
            const selectRole = mainContent.querySelector('#selectRole');
            const principal = JSON.parse(sessionStorage.getItem('principal'));
            if (principal.isAdmin) { selectRole.classList.remove('user'); }
            break;

        case "adm-styleguide":
            admStyleguidePage();
            break;

        default:
            page404();
    }
}

/* InnerHTML-funktioner för pages */

function page404() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Sidan hittades inte !</h2></section>
<div><i class="fa-solid fa-slash loading-icon"></i><i class="fa-solid fa-slash loading-icon" id="icon-accent"></i></div>
    </div>`
}

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
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Våra bilar</h2></section>
    <div class="panel-sort btn-spacer "> 
    <button type="button" class=" form-margin std-btn pos-btn" id="availableCars-sortbtn"> Visa lediga bilar</button>  
    <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    </div>
    <div class="car-container"></div></div>`;

    fetchCars();
    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("cars"); });
    document.querySelector("#availableCars-sortbtn").addEventListener('click', () => {
        const sortedCars = availableCars();
        displayCars(sortedCars);
    });
}

function newUsersPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Registrera ny kund</h2></section>
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

        <div id="selectRole" class="user"><label for="role" class="form-margin"> Nivå: </label><br>
            <select id="role" class="input-fields form-margin">
            <option value="">Välj användarroll</option>
            <option value="ROLE_USER">Kund</option>
            <option value="ROLE_ADMIN">Administratör</option>
            </select></div><br>
    
        <button type="button" class="form-margin std-btn pos-btn" id="reg-user-btn"> Registrera </button>
    </form>    
    </div></div>`;
    document.querySelector("#reg-user-btn").addEventListener('click', () => { createNewUser(); });
}

function userCarsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Boka våra utvalda fordon.</h2></section>
    <div class="panel-sort btn-spacer "> 
    <button type="button" class=" form-margin std-btn pos-btn" id="availableCars-sortbtn">Visa lediga bilar</button>  
    <div>
    <label for="sort-brand" class="info-headline">Tillverkare</label>
    <select name="sort-brand" id="sort-brand" class="form-margin input-fields" onchange="sortByBrand(this.value)">
    <option value="">Välj</option>
    <option value="corvette">Corvette</option>
    <option value="kalles">Kalles</option>
    <option value="skoda">Skoda</option>
    <option value="Volkswagen">Volkswagen</option>
    <option value="ford">Ford</option>
    <option value="porsche">Porsche</option>
    <option value="volvo">Volvo</option>
    <option value="farsans">Farsans</option>
    <option value="okänd">Okänd</option>
    </select>
    </div>
    <div>
    <label for="sort-type" class="info-headline">Välj bil-typ</label>
    <select name="sort-type" id="sort-type" class="form-margin input-fields" onchange="sortByType(this.value)">
    <option value="">Välj</option>
    <option value="sport">Sport</option>
    <option value="combi">Kombi</option>
    <option value="cab">Cab</option>
    <option value="bus">Minibuss</option> 
    <option value="el">El</option>    
    <option value="sedan">Sedan</option>
    </select>
    </div>
    <button type="button" class="form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    </div>
    <div class="car-container"></div>
    </div>`;
    fetchCars();
    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("user-cars"); });
    document.querySelector("#availableCars-sortbtn").addEventListener('click', () => {
        const sortedCars = availableCars();
        displayCars(sortedCars);
    });
}

function userPagesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Hej !</h2><p>
    Här hittar du din historik och din personliga information och dina exklusiva erbjudanden från våra utvalda samarbetspartners.</p></section>
    <form>
    <!-- ON of på Revent, slipsuthyrnings, resebyrån, event, cinema, idrotts-coachning-->
    <form>
    </div>`;
}

function userInfoPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Din medlemsinformation </h2> </section>
    <div id="user-container">
    </div>
    </div>`;
    fetchUserByIdDisplay();
}

function userBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2> Dina bokningar </h2></section>
    <div class="panel-sort btn-spacer">
    <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    <button type="button" class=" form-margin std-btn pos-btn" id="activeBookings-sortbtn">Visa aktiva bokningar</button>
    </div>
    <div class="bookings-container"></div>
    </div>`;
    fetchMyBookings();

    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("user-bookings"); });
    document.querySelector("#activeBookings-sortbtn").addEventListener('click', () => {
        const sortedBookings = myActiveBookings();
        displayMyBookings(sortedBookings);
    });

}

function admVehiclesPage() {
    /* mql.addEventListener("change", () => displayData()); kör displayData i fetch metoden */

    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Fordon - sortera och uppdatera</h2></section>
    <div class="panel-sort btn-spacer"> 
    <button type="button" class=" form-margin std-btn pos-btn" id="availableCars-sortbtn">Visa lediga fordon</button>
    <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    </div>
    <div id="car-gallery-container"></div>
    <div class="table-div">
    <table class="adm-table" id="cars-table">
    <thead>
       <tr>
            <th>Redigera bil</th>
            <th id="id-sortbtn"> Id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="name-sortbtn"> Tillverkare <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande / A-Ö"></i></span> </th>
            <th id="model-sortbtn"> Modell <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande / A-Ö"></i></span></th>
            <th id="type-sortbtn"> Bil-typ <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande / A-Ö"></i></span></th>
            <th>Utrustning </th>
            <th>Bokad ? </th>
            
        </tr>
    </thead>
    <tbody><td> Inga fordon att visa </td></tbody>
    <table>
    </div>
    </div>
    `;
    fetchAdmCars();

    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("adm-vehicles"); });
    document.querySelector("#availableCars-sortbtn").addEventListener('click', () => {
        const sortedCars = availableCars();
        displayCarData(sortedCars);
    });
    const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "id");
    /* Sorterings knapparna i tabell */
    document.querySelector("#id-sortbtn").addEventListener('click', () => {
        const sortedCars = sortTableList(dataStore.cars, "cars", "id");
        displayCarData(sortedCars);

    });
    document.querySelector("#name-sortbtn").addEventListener('click', () => {
        const sortedCars = sortTableList(dataStore.cars, "cars", "name");
        displayCarData(sortedCars);
    });

    document.querySelector("#model-sortbtn").addEventListener('click', () => {
        const sortedCars = sortTableList(dataStore.cars, "cars", "model");
        displayCarData(sortedCars);
    });
    document.querySelector("#type-sortbtn").addEventListener('click', () => {
        const sortedCars = sortTableList(dataStore.cars, "cars", "type");
        displayCarData(sortedCars);
    });
}



function admChangeVehiclesPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2></h2></section>
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
            <input id="feature3" class="input-fields form-margin form-text"></input><br>
            
        <label for="carType" class="form-margin">Bil-typ: </label><br>
        <select id="carType" name="carType" class="form-margin input-fields">
        <option value="combi">Kombi</option>
        <option value="sedan">Sedan</option>
        <option value="cab">Cab</option>
        <option value="electric">El</option>
        <option value="bus">Familjebuss</option>
        <option value="sport">Sport</option>
        
        </select><br>
            
        <button type="button" class="std-btn pos-btn" id="reg-car-btn"> Registrera </button>
    </form>    
    </div>
    </div>`;
    document.querySelector("#reg-car-btn").addEventListener('click', () => {
        createNewCar();
    });
}

function admBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"> Aktivabokningar - filtrera och avsluta bokningar.</section>
        <div class="panel-sort btn-spacer">
        <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button>
         </div>
         <div id="active-bookings-gallery-container"></div>
    <table class="adm-table" id="active-bookings-table">
    <thead>
       <tr>
       
            <th>Återlämna</th>
            <th id="id-sortbtn">Boknings-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande / A-Ö"></i></span> </th>
            <th id="userId-sortbtn">Kund-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="carId-sortbtn">Bil-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="fromDate-sortbtn">Från Datum <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="toDate-sortbtn">Till Datum <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th>Redigera bokning</th>
            
        </tr>
    </thead>
    <tbody><tr><td> Inga bokningar att visa</td></tr></tbody>
    </table> 
    </div>   
    `;
    fetchActiveBookings();

    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("adm-bookings"); });

    /* Sorterings knapparna i tabell */
    document.querySelector("#id-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "id");
        displayActiveBookingsTable(sortedBookings);

    });
    document.querySelector("#userId-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "userId");
        displayActiveBookingsTable(sortedBookings);
    });

    document.querySelector("#carId-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "carId");
        displayActiveBookingsTable(sortedBookings);
    });
    document.querySelector("#fromDate-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "fromDate");
        displayActiveBookingsTable(sortedBookings);
    });
    document.querySelector("#toDate-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookingsActive, "bookingsActive", "toDate");
        displayActiveBookingsTable(sortedBookings);
    });

}


function admAllBookingsPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><H2> Alla nuvarande och tidigare bokningar - All info. </H2></section>
    <div class="panel-sort btn-spacer">
    <button type="button" class=" form-margin std-btn pos-btn"id="activeBookings-sortbtn" >Visa aktiva bokningar</button>
    <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    </div>
    <div id="bookings-gallery-container"></div>
    <table class="adm-table" id="bookings-table">
    <thead>
       <tr>
            <th id="id-sortbtn">Boknings-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande / A-Ö"></i></span> </th>
            <th id="userId-sortbtn">Kund-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="carId-sortbtn">Bil-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="fromDate-sortbtn">Från Datum <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="toDate-sortbtn">Till Datum <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th>Aktiv uthyrning</th>

        </tr>
    </thead>
    <tbody><tr><td> Ingen bokningshistorik att visa </td></tr></tbody>
    </table>    
    </div>
    `;
    fetchAllBookings();
    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("adm-all-bookings"); });
    document.querySelector("#activeBookings-sortbtn").addEventListener('click', () => {
        const sortedBookings = activeBookings();
        displayBookingsData(sortedBookings);
    });
    /* Sorterings knapparna i tabell */
    document.querySelector("#id-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookings, "bookings", "id");
        displayBookingsTable(sortedBookings);

    });
    document.querySelector("#userId-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookings, "bookings", "userId");
        displayBookingsTable(sortedBookings);
    });

    document.querySelector("#carId-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookings, "bookings", "carId");
        displayBookingsTable(sortedBookings);
    });
    document.querySelector("#fromDate-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookings, "bookings", "fromDate");
        displayBookingsTable(sortedBookings);
    });
    document.querySelector("#toDate-sortbtn").addEventListener('click', () => {
        const sortedBookings = sortTableList(dataStore.bookings, "bookings", "toDate");
        displayBookingsTable(sortedBookings);
    });


}

function admUsersPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage"><h2>Kundinformation - Funktioner att uppdatera och radera.</h2></section>
    <div class="panel-sort btn-spacer">
    <button type="button" class=" form-margin std-btn pos-btn" id="reset-sortbtn"> Återställ <i class="fa-solid fa-filter-circle-xmark"></i> </button> 
    </div>
    <div id="user-gallery-container"></div>
    <table class="adm-table" id="users-table">
    <thead>
       <tr>
            <th>Redigera kund</th>
            <th id="id-sortbtn">Kund-id <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="email-sortbtn">Email <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="firstName-sortbtn" >Förnamn <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="lastName-sortbtn">Efternamn <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="noOfOrders-sortbtn">Antal hyresordrar <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="phone-sortbtn">Telefonnummer <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="role-sortbtn">Roll <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
            <th id="username-sortbtn">Användarnamn <span><i class="fa-solid fa-arrow-down-short-wide" title="Stigande"></i></span> </th>
        </tr>
    </thead>
    <tbody><tr><td> Inga användare att visa</td></tr></tbody>
    </table> 
    <div id="userBookingsView"></div>
    </div>   
    `;
    fetchUsers();
    document.querySelector("#reset-sortbtn").addEventListener('click', () => { changeMainContent("adm-users"); });

    /* Sorterings knapparna i tabell */
    document.querySelector("#id-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "id");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#email-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "email");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#firstName-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "firstName");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#lastName-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "lastName");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#noOfOrders-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "noOfOrders");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#phone-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "phone");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#role-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "role");
        displayUsersData(sortedUsers);
    });
    document.querySelector("#username-sortbtn").addEventListener('click', () => {
        const sortedUsers = sortTableList(dataStore.users, "users", "username");
        displayUsersData(sortedUsers);
    });

}

function admChangeUserPage() {
    mainContent.innerHTML = `<div class="content-page"><section class="headline-contentpage">Kunder - skapa, updatera och radera.</section></div>`;
}

function admStyleguidePage() {
    mainContent.innerHTML = `<div class="content-page"><section class ="headline-contentpage" >Styleguide</section></div>`;
}

/* UPDATERINGS FUNKTIONER */


function deleteUserDialog(user) {
    const dialog = document.querySelector('#update-dialog');
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Radera användare</h2>
                <p>Är du säker du vill radera användare med medlemsnr. ${user.id} ?</p>
            </div>
             <span class="btn-spacer">
                <button type="button" class="std-btn" id="delete-btn">Ja, Radera</button>
                <button type="button" class="std-btn neg-btn" id="exit-btn">Nej, Avbryt</button></span>
            `
    dialog.showModal();
    dialog.querySelector('#delete-btn').addEventListener('click', () => {
        deleteUser(user.id);
        fetchUsers();
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
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
        updateUser(user.id);
        fetchUsers();
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}


function updateCarDialog(car) {
    const dialog = document.querySelector(`#update-dialog`);
    let booked = car.booked === true ? "Bokad" : "Obokad";
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Uppdatera fordon</h2>
            </div>
     <form id="update-form">
        <label for="brand" class="form-margin">Tillverkare: </label><br>
            <input id="brand" class="input-fields form-margin" type="text" value="${car.name}"><br>

        <label for="model" class="form-margin">Modell: </label><br>
            <input id="model" class="input-fields form-margin" type="text"value="${car.model}"><br>

        <label for="price" class="form-margin">Kostnad/dygn: </label><br>
            <input id="price" type="number" placeholder="3500" class="input-fields form-margin form-text" value="${car.price}"><br>
       
        <label for="feature1" class="form-margin">Utrustning ex. 1: </label><br>
            <input id="feature1" type="text" class="input-fields form-margin form-text" value="${car.feature1}"><br>

        <label for="feature2" class="form-margin">Utrustning ex.2: </label><br>
            <input id="feature2" type="text"  class="input-fields form-margin form-text" value="${car.feature2}"><br>

        <label for="feature3" class="form-margin">Utrustning ex.3:</label><br>
            <input id="feature3" class="input-fields form-margin form-text" value="${car.feature3}"><br>
        
        <label for="booked" class="form-margin">Bokad?<br><i>Går ej uppdatera</i>:</label><br>
            <p id="booked" class="input-fields form-margin form-text">${booked}</p><br>
            
        <label for="carType" class="form-margin">Klass: </label><br>
        <select id="carType" name="carType" class="form-margin input-fields">
        <option value="combi">Kombi</option>
        <option value="sedan">Sedan</option>
        <option value="cab">Cab</option>
        <option value="electric">El</option>
        <option value="bus">Minibuss</option>
        <option value="sport">Sport</option>
        </select><br>
                <span class="btn-spacer">
                    <button type="button" class="std-btn pos-btn book-btn" id="update-btn">Uppdatera</button>
                    <button  type="button" class="std-btn neg-btn"id="exit-btn" >Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
    dialog.querySelector('#update-btn').addEventListener('click', () => {
        updateCar(car.id);
        /* document.querySelector('#showCarDetails').innerHTML =""; */
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => {
        /* document.querySelector('#showCarDetails').innerHTML =""; */
        dialog.close();
    });
}
function deleteCarDialog(car) {
    const dialog = document.querySelector('#update-dialog');
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="dialog-header">
                <h2>Radera fordon</h2>
                <p>Är du säker du vill radera fordon med bil-id. ${car.id} ?</p>
            </div>
             <span class="btn-spacer">
                <button type="button" class="std-btn" id="delete-btn">Ja, Radera</button>
                <button type="button" class="std-btn neg-btn" id="exit-btn">Nej, Avbryt</button></span>
            `
    dialog.showModal();
    dialog.querySelector('#delete-btn').addEventListener('click', () => {
        deleteCar(car.id);
        /* document.querySelector('#showCarDetails').innerHTML =""; */
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => {
        /* document.querySelector('#showCarDetails').innerHTML =""; */
        dialog.close();
    });
}


function bookingDialog(car) {
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
                <label for="to-date">Återlämningsdatum:</label><br>
                <input id="to-date" type="date" class="form-margin"><br>               
                <span class="btn-spacer">
                    <button id="book-btn" type="button" class="std-btn pos-btn book-btn">BOKA</button>
                    <button id="exit-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
    dialog.querySelector('#book-btn').addEventListener('click', () => {
        createNewBooking(car);
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}

async function admBookingDialog(car) {
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
                <label for="choose-user">Kund:</label><br>
                 <select name="choose-user" id="choose-user" class="form-margin input-fields"><br>        
                 <option value="">Välj kund</option>
                 </select>
                <label for="to-date">Återlämningsdatum:</label><br>
                <input id="to-date" type="date" class="form-margin"><br>               
                <span class="btn-spacer">
                    <button id="book-btn" type="button" class="std-btn pos-btn book-btn">BOKA</button>
                    <button id="exit-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`
    const principal = JSON.parse(sessionStorage.getItem('principal'));
    const select = dialog.querySelector('#choose-user');
    if (principal.isAdmin === true) {
        const users = await fetchUsersForList();
        const optionsOfUsers = users.map(user =>
            `<option value="${user.id}">${user.firstName} ${user.lastName} </option>`
        ).join('');

        select.innerHTML = `<option value="">Välj kund</option>${optionsOfUsers}`;


    } if (principal.isAdmin === false) {
        const user = JSON.parse(sessionStorage.getItem('user_principal'));
        select.innerHTML = `<option value="">Välj kund</option>
        <option value="${user.id}">${user.firstName} ${user.lastName} </option>`;

    }
    dialog.showModal();
    dialog.querySelector('#book-btn').addEventListener('click', () => {
        createNewBooking(car);
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}

function updateBookingDialog(booking) {
    const dialog = document.querySelector(`#update-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Uppdatera bokning</h2>
                <p>Välj ett nytt återlämningsdatum!<br>
                Det nuvarande återlämning är planerad ${booking.toDate}.</p>
            </div>
            <form id="update-form">
                <label for="input-date">Återlämningsdatum:</label><br>
                <input id="input-date" type="date" class="form-margin"><br>               
                
                <span class="btn-spacer">
                    <button type="button" class="std-btn pos-btn update-btn">Uppdatera</button>
                    <button id="exit-btn" type="button" class="std-btn neg-btn">Avbryt</button></span>
            </form>
        </div>`

    dialog.showModal();
    dialog.querySelector('.update-btn').addEventListener('click', () => {
        const updated = getUpdatedBooking(booking);
        updateBooking(booking.id, updated);
        dialog.close();
    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });

}

function returnCarDialog(booking) {
    const dialog = document.querySelector('#update-dialog');
    dialog.innerHTML =
        `<div class="dialog-content">
            <div>
                <h2>Återlämna bil</h2>
                <h4>Dubbelkolla återlämning.</h4><br><p>
                Är det kund med medlemsnr ${booking.userId} som återlämnar ?<br>
                Stämmer fordons-id ${booking.carId}?<br>
                
                Planerat återlämningsdatum var ${booking.toDate}. <br>
                 <i>Vid överträdelse. Informera kund om förseningsränta på 3% dygnet.</i>
                </p>
            </div>
             <span class="btn-spacer">
                <button type="button" class="std-btn" id="delete-btn">Avsluta uthyrning</button>
                <button type="button" class="std-btn neg-btn" id="exit-btn">Nej, Avbryt</button></span>
            `
    dialog.showModal();
    dialog.querySelector('#delete-btn').addEventListener('click', () => {
        const updated = updateReturningBooking(booking)
        updateAndReturn(booking.id, updated);
        dialog.close();

    });
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}
async function displayUpdateBookingDialog(booking) {
    const car = await fetchCarById(booking.carId);
    const user = await fetchUserById(booking.userId);
    let returnerd = booking.active === true ? "OBS! Aktiv uthyrning" : "Återlämnad";
    const dialog = document.querySelector(`#view-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Bokningsinformation</h2>
                Gällande bokningsnr <b>${booking.id}</b>.<br></div>
                <div><p>
                Hyrd av <b>${user.firstName} ${user.lastName}</b>. <br>
                Medlemsnummer ${user.id}.
                </p>
            </div>
            <div>
        <p>
        <b>Tillverkare:</b><br> ${car.name}<br>
        <b>Modell:</b><br> ${car.model}<br>
        <b>Pris ber dygn:</b><br> ${car.price} SEK <br>
        <b>Hyrestid:</b><br> ${booking.fromDate} - ${booking.toDate}<br>
        <b>Status:</b><br> ${returnerd}.<br>
        </p></div>
                <div class="btn-spacer">
                    <button type="button" class="std-btn pos-btn"id="exit-btn"> Stäng info </button>
                    <button type="button" class="std-btn hide" id="update-booking-btn"disabled> Uppdatera </button>
                    <button type="button" class="std-btn neg-btn hide"id="delete-booking-btn" disabled> Radera DIREKT </button>
                    
        </div>`;
    dialog.showModal();
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
    const updateBtn = dialog.querySelector('#update-booking-btn');
    updateBtn.addEventListener('click', () => {
        updateBookingDialog(booking);
        dialog.close();
    });
    const deleteBtn = dialog.querySelector('#delete-booking-btn');
    deleteBtn.addEventListener('click', () => {
        deleteBooking(booking.id);
        dialog.close();
    });

    if (booking.active === false) {
        updateBtn.disabled = true;
        deleteBtn.disabled = true;
    } else if (booking.active === true) {
        updateBtn.disabled = false;
        deleteBtn.disabled = false;
    }

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
/* ------------------------------------------------ */
/* BILAR */
/*------------------------------------------------- */

/* Bilar  - Lägger in bilarna i lista omgärdad av wrapper.-----------------------------------------Bilar----------*/
function displayCars(cars) {
    const wrapper = createPanelWrapper();
    const carDiv = document.querySelector(".car-container");
    carDiv.innerHTML = "";
    if (cars.length === 0) {
        carDiv.innerHTML = `<div class="panel"><h3> Tyvärr fanns inga fordon att visa. </h3></div>`;
        return;
    }
    cars.forEach(car => {
        const innerDiv = document.createElement("div");
        const imgSrc = `/img/images/cars/${car.model}.jpg`;
        const defaultSrc = `/img/images/cars/default.png`;
        const type = carType(car.type);
        innerDiv.innerHTML =
            ` <div class="panel panel-car">
            <div id="car-img"><img src= ${imgSrc} onerror ="this.onerror=null; this.src='${defaultSrc}'" alt="Exempel bild av hyrbil" class="img-car"><div>
            <dl>
        <dd><b>Tillverkare:</b> ${car.name}</dd>
        <dd><b>Modell:</b> ${car.model}</dd>
        <dd><b>Pris:</b> ${car.price} kr/dygn</dd>
        <dd><b>Bil-typ:</b> ${type} </dd>
        </dl>
        <div class="btn-spacer">
        <button onclick="fetchCarByIdDisplay(${car.id})" class="std-btn pos-btn car-info-btn"> Se mer </button> 
        </div>
        <div id="icon-holder" class="icon-larger"></div>
        </div> `
        if (car.booked) {
            innerDiv.querySelector('div .panel-car').classList.add('car-booked');
            innerDiv.querySelector('#icon-holder').innerHTML =
                `<i class="fa-solid fa-road-lock" alt="Symbol av väg med ett lås. Fordon låst för bokning. Ej tillgänglig." title="Bil ej tillgänglig"></i>`;
        }
        wrapper.appendChild(innerDiv);
        carDiv.appendChild(wrapper);
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
            <button class="std-btn pos-btn book-btn" id="book-car-btn"> Boka nu </button> 
            <dl>
        <dt><b>Tillverkare:</b></dt><dd>${car.name}</dd>
        <dt><b>Modell:</b></dt> <dd>${car.model}</dd>
        <dt><b>Pris:</b></dt> <dd> ${car.price} kr/dygn </dd>
        <dt><b>Utrustning:</b><br></dt>
        <dd><br>
        <li>${car.feature1}</li>
        <li>${car.feature2}</li>
        <li>${car.feature3}</li></dd>
        </dl>
        <div class="btn-left">
        <button onclick= 'changeMainContent("user-cars")' class="std-btn neg-btn return-btn"> Fler bilar </button> 
        </div></div> `

    let bookBtn = innerDiv.querySelector('#book-car-btn');
    updateBookingBtn(bookBtn, car);
    bookBtn.addEventListener('click', () => {
        admBookingDialog(car);
    });
    wrapper.appendChild(innerDiv);

}
function updateBookingBtn(bookBtn, car) {
    if (car.booked) {
        bookBtn.disabled = true;
        bookBtn.innerText = `Ej tillgänglig`
    }
}
function displayCarData(cars) {
    if (mql.matches) {
        displayCarsTable(cars);   // Data
    } else {
        displayCarsGallery(cars);   // Mindre skärm
    }
}

function displayCarsTable(cars) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#cars-table')
    const tbody = document.querySelector('#cars-table tbody');
    tbody.innerHTML = "";
    cars.forEach(car => {
        let booked = car.booked === true ? "Bokad" : "Obokad";
        const type = carType(car.type);
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
      <td>
      <button onclick="fetchCarForUpdateView(${car.id})"class="std-btn neg-btn" alt="Knapp för att redigera eller radera bil" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
      </td>
      <td>${car.id}</td>
      <td>${car.name}</td>
      <td>${car.model}</td>
      <td>${type}</td>
      <td><ul>
      <li>${car.feature1}</li>
      <li>${car.feature2}</li>
      <li>${car.feature3}</li></ul></td>
      <td>${booked}</td>
        `
        tbody.appendChild(tr);
    });
    wrapper.appendChild(table);
};


function displayCarsGallery(cars) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#cars-table')
    table.innerHTML = "";
    const galleryDiv = document.querySelector("#car-gallery-container");
    galleryDiv.innerHTML = "";

    if (cars.length === 0) {
        carDiv.innerHTML = `<div class="panel"><h3> Tyvärr fanns inga fordon att visa. </h3></div>`;
        return;
    }
    cars.forEach(car => {
        let booked = car.booked === true ? "Bokad" : "Obokad";
        const innerDiv = document.createElement("div");
        const type = carType(car.type);
        innerDiv.innerHTML =
            ` <div class="panel panel-car ">
        <div id="icon-holder" class="icon-larger"></div>    
        <ol>
        <p><b>Tillverkare:</b><br> ${car.name}<br>
        <b>Modell:</b><br> ${car.model}<br>
        <b>Pris:</b><br>${car.price} kr/dygn<br>
        <b>Bil-typ:</b><br> ${type}<br>
        <b>Tillgänglig:</b><br>${booked}<br></p>
        <ul>
      <li>${car.feature1}</li>
      <li>${car.feature2}</li>
      <li>${car.feature3}</li></ul></dd>
        </ol>
        <button class="std-btn neg-btn car-update-btn" alt="Knapp för att redigera fordon" title="Uppdatera"><i class="fa-solid fa-wrench"></i></button>
        <button class="std-btn neg-btn car-delete-btn" alt="Knapp för att radera fordon" title="Radera"><i class="fa-regular fa-trash-can"></i></button>
        </div> `
        if (car.booked) {
            innerDiv.querySelector('div .panel-car').classList.add('car-booked');
            innerDiv.querySelector('#icon-holder').innerHTML =
                `<i class="fa-solid fa-road-lock" alt="Symbol av väg med ett lås. Fordon låst för bokning. Ej tillgänglig." title="Bil ej tillgänglig"></i>`;
        }

        wrapper.appendChild(innerDiv);
        innerDiv.querySelector('.car-update-btn').addEventListener('click', () => {
            updateCarDialog(car);
        });
        innerDiv.querySelector('.car-delete-btn').addEventListener('click', () => {
            deleteCarDialog(car);
        });
    });
    galleryDiv.appendChild(wrapper);
}

function displayUpdateCar(car) {
    const wrapper = createPanelWrapper();
    const innerDiv = document.createElement("div");
    let booked = car.booked === true ? "Bokad" : "Obokad";
    innerDiv.innerHTML =
        ` 
        <div class="panel-wrapper">
        <div class="panel panel-important">
            <dl>
  <div>
    <dt><b> Id:</b></dt>
    <dd>${car.id}</dd>
  </div>
  <div>
    <dt><b> Tillverkare :</b></dt>
    <dd>${car.name}</dd>
  </div>
  <div>
    <dt><b> Model :</b></dt>
    <dd>${car.model}</dd>
  </div>
  <div>
    <dt><b> Bil-typ :</b></dt>
    <dd>${car.type}</dd>
  </div>
  <div>
    <dt><b> Utrustning :</b></dt>
    <dd><br>
    <li>${car.feature1}</li>
        <li>${car.feature2}</li>
        <li>${car.feature3}</li></dd>
  </div>
  <div>
    <dt><b> Bokad? :</b></dt>
    <dd> ${booked}</dd>
  </div>
</dl>
    </div> 
        <div class="btn-spacer">      
        <button id="update-btn" class="std-btn" alt="Knapp för att redigera fordons-info" title="Uppdatera"> <i class="fa-solid fa-wrench"></i> </button>
        <button id="delete-btn" class="std-btn neg-btn" alt="Knapp för att radera fordon" title="Radera"><i class="fa-regular fa-trash-can"></i></button>
        </div>
        </div>`;
    wrapper.appendChild(innerDiv);
    innerDiv.scrollIntoView({ behavior: "smooth", block: "center" });

    innerDiv.querySelector('#update-btn').addEventListener('click', () => { updateCarDialog(car); });
    innerDiv.querySelector('#delete-btn').addEventListener('click', () => { deleteCarDialog(car); });
}

/* ------------------------------------------------ */
/* ANVÄNDARE */
/*------------------------------------------------- */

/*/* Användare ---- -----------------------------------------------------------------------------Användare----------*/

function displayUser(user) {
    const wrapper = createPanelWrapper();
    const section = document.querySelector("#user-container");
    const innerDiv = document.createElement("div");
    const emailfirst = user.email.split('@')[0];
    const emailslast = user.email.split('@')[1];

    innerDiv.innerHTML =
        `
        <div id="user-info-wrapper">
    <section class="panel panel-important">
    <dl>
  <div>
    <dt><b>Medlemsnr:</b></dt>
    <dd>${user.id}</dd>
  </div>
  <div>
    <dt><b> Namn :</b></dt>
    <dd>${user.firstName} ${user.lastName}</dd>
  </div>
  <div>
    <dt><b> Telefonnr :</b></dt>
    <dd>${user.phone}</dd>
  </div>
  <div>
    <dt><b> Email :</b></dt>
    <dd>${emailfirst}<br>@${emailslast}</dd>
  </div>
  <div>
    <dt><b> Användarnamn:</b></dt>
    <dd>${user.username}</dd>
  </div>
    </dl>
    </section>
    <article id="update-desc">
        <h4 id="update-headline">Uppdatera din personliga information genom att klicka på knappen nedan märkt Uppdatera.</h4><br>
        <p>
        <ul><li>Alla fält förrutom lösenord är förifyllt. Lösenord måste alltid anges vid uppdatering.</li>
        <li>Vill du uppdatera <br> - Skriv in nya infon i det fältet.</li>
        <li>Lämna dem andra fälten.</li>
        <li>Fyll i ditt lösenord.</li>
        <li>Vill du byta lösenord?<br> - Skriv in det nya lösenordet istället.</li>
        </ul></p>  
        </article>
        <div class="btn-spacer">      
        <button aria-labelledby="update-headline" aria-describedby="update-desc" id="update-btn" class="std-btn" alt="Knapp för att redigera din information" title="Uppdatera"> Uppdatera <i aria-hidden="true" class="fa-solid fa-wrench"></i> </button>
        </div>    
        </div>
        `
    wrapper.appendChild(innerDiv);
    section.appendChild(wrapper);

    innerDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    innerDiv.querySelector('#update-btn').addEventListener('click', () => { updateUserDialog(user); });

}

function displayUpdateUser(user) {
    const wrapper = createPanelWrapper();
    const innerDiv = document.createElement("div");
    let role;
    if (user.role === "ROLE_USER") { role = "Kund" } else { role = "Administratör" };
    innerDiv.innerHTML =
        ` 
        <div class="panel-wrapper"><!--Dubbel wrappas för att hålla responsiviteten på mobil-->
        <div class="panel panel-important">

      <dl>
  <div>
    <dt><b>Medlemsnr:</b></dt>
    <dd>${user.id}</dd>
  </div>
  <div>
    <dt><b> Förnamn :</b></dt>
    <dd>${user.firstName}</dd>
  </div>
  <div>
    <dt><b> Efternamn :</b></dt>
    <dd>${user.lastName}</dd>
  </div>
  <div>
    <dt><b> Telefonnr :</b></dt>
    <dd>${user.phone}</dd>
  </div>
  <div>
    <dt><b> Email :</b></dt>
    <dd>${user.email}</dd>
  </div>
  <div>
    <dt><b> Användarnamn:</b></dt>
    <dd>${user.username}</dd>
  </div>
  <div>
    <dt><b>Roll:</b></dt>
    <dd>${role}</dd>
  </div>
   </dl>
   </div>
            <div class="btn-spacer">      
        <button id="update-btn" class="std-btn" alt="Knapp för att redigera kundinfo" title="Uppdatera"> <i class="fa-solid fa-wrench"></i> </button>
        <button id="delete-btn" class="std-btn neg-btn" alt="Knapp för att radera kund" title="Radera"><i class="fa-regular fa-trash-can"></i></button>
        </div>
        
    </div> `
    wrapper.appendChild(innerDiv);
    innerDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    innerDiv.querySelector('#update-btn').addEventListener('click', () => { updateUserDialog(user); });
    innerDiv.querySelector('#delete-btn').addEventListener('click', () => { deleteUserDialog(user); });
}


function displayUsersData(users) {
    if (mql.matches) {
        displayUsersTable(users);   // Data
    } else {
        displayUsersGallery(users);   // Mindre skärm
    }
}


function displayUsersGallery(users) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#users-table')
    table.innerHTML = "";
    const galleryDiv = document.querySelector("#user-gallery-container");
    galleryDiv.innerHTML = "";
    if (users.length === 0) {
        galleryDiv.innerHTML = `<div class="panel"><h3> Tyvärr fanns inga användare att visa. </h3></div>`;
        return;
    }
    users.forEach(user => {
        let role = user.role === "ROLE_USER" ? "Kund" : "Administratör";
        const innerDiv = document.createElement("div");
        innerDiv.innerHTML =
            ` <div class="panel panel-car adm-info">
        <ol>      
        <p><b>Kund-nr:</b><br> ${user.id}<br>
        <b>Email:</b><br> ${user.email}<br>
        <b>Namn:</b><br>${user.firstName} ${user.lastName}<br>
        <b> Antal bokningar:</b><br><span class="show-book-btn table-link-btn" title="Klicka för att se bokningar.">${user.noOfOrders} </span><br>
        <b>Telefon:</b><br> ${user.phone}<br>
        <b>Roll:</b><br>${role}<br>
        <b>Användarnamn:</b><br> ${user.username} <br>
        </p>
        </ol>
        <button class="std-btn neg-btn user-update-btn" alt="Knapp för att redigera kund" title="Uppdatera"><i class="fa-solid fa-wrench"></i></button>
        <button class="std-btn neg-btn user-delete-btn" alt="Knapp för att radera kund" title="Radera"><i class="fa-regular fa-trash-can"></i></button>
        </div> `
        innerDiv.querySelector('.show-book-btn').addEventListener('click', () => {
            displayBookingsByUserId(user.id);
        });
        wrapper.appendChild(innerDiv);
        innerDiv.querySelector('.user-update-btn').addEventListener('click', () => {
            updateUserDialog(user);
        });
        innerDiv.querySelector('.user-delete-btn').addEventListener('click', () => {
            deleteUserDialog(user);
        });
    });
    galleryDiv.appendChild(wrapper);
}



function displayUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = "";

    users.forEach(user => {
        let role = user.role === "ROLE_USER" ? "Kund" : "Administratör";
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
        <td class="show-book-btn table-link-btn" title="Klicka för att se bokningar.">${user.noOfOrders}</td>
        <td>${user.phone}</td>
        <td>${role}</td>
        <td>${user.username} </td>

        `
        tr.querySelector('.show-book-btn').addEventListener('click', () => {
            displayBookingsByUserId(user.id);
        });
        tbody.appendChild(tr);
    });
}

/* ------------------------------------------------ */
/* BOKNINGAR */
/*------------------------------------------------- */

/*Bokningar --------------------------------------------------------------------------------Bokningar----------*/

function displayActiveBookingsData(bookings) {
    if (mql.matches) {
        displayActiveBookingsTable(bookings);   // Data
    } else {
        displayActiveBookingsGallery(bookings);   // Mindre skärm
    }
}

function displayActiveBookingsGallery(bookings) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#active-bookings-table')
    table.innerHTML = "";
    const galleryDiv = document.querySelector("#active-bookings-gallery-container");
    galleryDiv.innerHTML = "";
    if (bookings.length === 0) {
        galleryDiv.innerHTML = `<div class="panel"><h3> Tyvärr fanns inga bokningar att visa. </h3></div>`;
        return;
    }
    bookings.forEach(booking => {
        const innerDiv = document.createElement("div");
        innerDiv.innerHTML =
            ` <div class="panel panel-car adm-info">
        <ol>      
        <p><b>Boknings-nr:</b><br> ${booking.id}<br>
        <b>Kund-nr:</b><br> ${booking.userId}<br>
        <b>Bil-nr:</b><br>${booking.carId}<br>
        <b>Hyrd från:</b><br> ${booking.fromDate}<br>
        <b>Hyrd till:</b><br> ${booking.toDate}<br>
        </p>
        </ol>
        <button class="std-btn neg-btn view-booking-btn" alt="Knapp för att redigera bokning" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
        <button class="std-btn return-car-btn btn-spacer">Återlämna fordon</button>
        </div> `
        wrapper.appendChild(innerDiv);

        innerDiv.querySelector('.view-booking-btn').addEventListener('click', () => {
            displayUpdateBookingDialog(booking);
        });
        innerDiv.querySelector('.return-car-btn').addEventListener('click', () => {
            returnCarDialog(booking);
        });
    });
    galleryDiv.appendChild(wrapper);
}


function displayActiveBookingsTable(bookings) {
    const tbody = document.querySelector('#activeBookingsTable tbody');
    tbody.innerHTML = "";

    bookings.forEach(booking => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
       <td>
     <button class="std-btn return-car-btn btn-spacer">Återlämna fordon</button>
      </td>
      <td>${booking.id}</td>
      <td>${booking.userId}</td>
      <td>${booking.carId}</td>
      <td>${booking.fromDate}</td>
      <td>${booking.toDate}</td> 
      <td>
      <button class="view-booking-btn std-btn neg-btn" alt="Knapp för att redigera eller radera bokning" title="Uppdatera / Radera"><i class="fa-solid fa-wrench"></i></button>
      </td>  `
        tr.querySelector('.return-car-btn').addEventListener('click', () => {
            returnCarDialog(booking);
        });

        tr.querySelector('.view-booking-btn').addEventListener('click', () => {
            displayUpdateBookingDialog(booking);
        });
        tbody.appendChild(tr);
    });
}

function displayBookingsData(bookings) {
    if (mql.matches) {
        displayBookingsTable(bookings);   // Data
    } else {
        displayBookingsGallery(bookings);   // Mindre skärm
    }
}

function displayBookingsTable(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    tbody.innerHTML = "";
    bookings.forEach(booking => {
        let returnerd = booking.active === true ? "Aktiv" : "Återlämnad";
        const tr = document.createElement("tr");
        tr.innerHTML =
            ` 
      <td>${booking.id}</td>
      <td>${booking.userId}</td>
      <td>${booking.carId}</td>
      <td>${booking.fromDate}</td>
      <td>${booking.toDate} </td>     
      <td>${returnerd}</td>
        `
        tbody.appendChild(tr);
    });
}

function displayBookingsGallery(bookings) {
    const wrapper = createPanelWrapper();
    const table = document.querySelector('#bookings-table')
    table.innerHTML = "";
    const galleryDiv = document.querySelector("#bookings-gallery-container");
    galleryDiv.innerHTML = "";
    if (bookings.length === 0) {
        galleryDiv.innerHTML = `<div class="panel"><h3> Tyvärr fanns inga bokningar att visa. </h3></div>`;
        return;
    }
    bookings.forEach(booking => {
        let returnerd = booking.active === true ? "Aktiv" : "Återlämnad";
        const innerDiv = document.createElement("div");
        innerDiv.innerHTML =
            ` <div class="panel panel-car adm-info">
        <ol>      
        <p><b>Boknings-nr:</b><br> ${booking.id}<br>
        <b>Kund-nr:</b><br> ${booking.userId}<br>
        <b>Bil-nr:</b><br>${booking.carId}<br>
        <b>Hyrd från:</b><br> ${booking.fromDate}<br>
        <b>Hyrd till:</b><br> ${booking.toDate}<br>
        <b>Hyrd till:</b><br> ${returnerd}<br>
        </p>
        </ol>
        </div> `
        wrapper.appendChild(innerDiv);
    });
    galleryDiv.appendChild(wrapper);
}

async function displayMyBookings(bookings) {
    const wrapper = createPanelWrapper();
    const bookDiv = document.querySelector(".bookings-container");
    bookDiv.innerHTML = "";
    if (bookings.length === 0) {
        carDiv.innerHTML = `<div class="panel"><h3> Inga aktiva bokningar idag! </h3></div>`;
        return;
    }
    for (const booking of bookings) {
        const car = await fetchCarById(booking.carId);
        const innerDiv = document.createElement("div");
        const imgSrc = `/img/images/cars/${car.model}.jpg`;
        const defaultSrc = `/img/images/cars/default.png`;
        let returnerd = booking.active === true ? "OBS! Aktiv uthyrning" : "Återlämnad";
        innerDiv.innerHTML =
            ` <div class="panel panel-car">
            <h3>${car.name} - ${car.model}</h3>
            <div id="car-img"><img src= ${imgSrc} onerror ="this.onerror=null; this.src='${defaultSrc}'" alt="Exempel bild av hyrbil" class="img-car"><div>
            <p class="panel-font"><h4>Hyrestid:</h4> ${booking.fromDate} -${booking.toDate}<br>
            <h4>Status :</h4> ${returnerd}.
            </p>
        <div class="btn-spacer">
        <button class="std-btn pos-btn view-booking-btn"> Se bokning </button> 
        </div></div> `
        innerDiv.querySelector('.view-booking-btn').addEventListener('click', () => {
            displayABookingDialog(booking);
        });
        wrapper.appendChild(innerDiv);
        bookDiv.appendChild(wrapper);
    };
}

async function displayBookingsByUserId(id) {
    const bookings = await fetchBookingByUserId(id);
    const bookingsView = document.querySelector('#usersBookingView');
    const wrapper = createPanelWrapper();
    for (const booking of bookings) {
        const car = await fetchCarById(booking.carId);
        const innerDiv = document.createElement("div");
        const imgSrc = `/img/images/cars/${car.model}.jpg`;
        const defaultSrc = `/img/images/cars/default.png`;
        const book = booking;
        let returnerd = booking.active === true ? "OBS! Aktiv uthyrning" : "Återlämnad";
        innerDiv.innerHTML =
            ` <div class="panel panel-car">
            <h3>${car.name} - ${car.model}</h3>
            <div id="car-img"><img src= ${imgSrc} onerror ="this.onerror=null; this.src='${defaultSrc}'" alt="Exempel bild av hyrbil" class="img-car"><div>
            <p class="panel-font"><h4>Hyrestid:</h4> ${booking.fromDate} -${booking.toDate}<br>
            <h4>Status :</h4> ${returnerd}.
            </p>
        <div class="btn-spacer">
        <button class="std-btn pos-btn view-booking-btn"> Se bokning </button> 
        </div></div> `
        innerDiv.querySelector('.view-booking-btn').addEventListener('click', () => {
            displayUpdateBookingDialog(booking);
        });
        wrapper.appendChild(innerDiv);
        innerDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    bookingsView.appendChild(wrapper);
}


async function displayABookingDialog(booking) {
    const car = await fetchCarById(booking.carId);
    const user = await fetchUserById(booking.userId);
    let returnerd = booking.active === true ? "OBS! Aktiv uthyrning" : "Återlämnad";
    const dialog = document.querySelector(`#view-dialog`);
    dialog.innerHTML =
        `<div class="dialog-content">
            <div id="booking-header">
                <h2>Bokningsinformation</h2>
                Gällande bokningsnr <b>${booking.id}</b>.<br></div>
                <div><p>
                Hyrd av <b>${user.firstName} ${user.lastName}</b>. <br>
                Medlemsnummer ${user.id}.
                </p>
            </div>
            <div>
        <p>
        <b>Tillverkare:</b><br> ${car.name}<br>
        <b>Modell:</b><br> ${car.model}<br>
        <b>Pris ber dygn:</b><br> ${car.price} SEK<br>
        <b>Hyrestid:</b><br> ${booking.fromDate} - ${booking.toDate}<br>
        <b>Status:</b><br> ${returnerd}.<br>
        </p></div>
                <div class="btn-spacer">
                    <button type="button" class="std-btn pos-btn"id="exit-btn"> OK </button>                   
        </div>`;

    dialog.showModal();
    dialog.querySelector('#exit-btn').addEventListener('click', () => { dialog.close(); });
}

/* ------------------------------------------------ */
/* HÄMTA -INPUT */
/*------------------------------------------------- */
function getLogInInfo() {
    const usern = document.getElementById("input-username");
    const pswrd = document.getElementById("input-password");

    if (!pswrd.value && !usern.value) {
        throw new ValidationError(`Hoppsan! <br> Ange inloggningsinformation för att loggas in.`);
        return;
    }
    if (!usern.value) {
        throw new ValidationError(`Glömde du användarnamnet? Tips! Testa din mailadress.`);
        return;
    }
    if (!pswrd.value) {
        throw new ValidationError(`Lösenordsfält lämnades tomt. Prova igen.`);
        return;
    }

    const userInfo = {
        username: usern.value,
        password: pswrd.value
    }
    return userInfo;
}

function getNewUserInfo() {
    const principal = JSON.parse(sessionStorage.getItem('principal'));
    const fname = document.querySelector('#fname');
    const lname = document.querySelector(`form #lname`);
    const phoneNr = document.querySelector("form #phoneNr");
    const email = document.querySelector("form #email");
    const password = document.querySelector("form #password");
    if (principal === null) {
        const role = "ROLE_USER";
    } else if (principal.isAdmin) {
        const role = document.querySelector("form #role");
        if (role === null) { role = "ROLE_USER" };

        const newUser = {
            firstName: fname.value,
            lastName: lname.value,
            username: email.value,
            phone: phoneNr.value,
            email: email.value,
            password: password.value,
            "noOfOrders": 0,
            role: role
        }
        return newUser;
    }
}

function getNewBookingInfo(car) {
    const dialog = document.querySelector('#booking-dialog');
    const toDate = dialog.querySelector('form #to-date').value;
    const toDay = new Date();

    const newBooking = {
        "fromDate": toDay.toISOString().split("T")[0],
        "toDate": toDate,
        "carId": car.id
    }
    return newBooking;
}

function getNewCarInfo() {
    const brand = document.querySelector(`form #brand`);
    const model = document.querySelector(`form #model`);
    const price = document.querySelector("form #price");
    const f1 = document.querySelector("form #feature1");
    const f2 = document.querySelector("form #feature2");
    const f3 = document.querySelector("form #feature3");
    const type = document.querySelector("#carType").value;
    const newCar = {
        "name": brand.value,
        "model": model.value,
        "feature1": f1.value,
        "feature2": f2.value,
        "feature3": f3.value,
        "type": type,
        "price": price.value,
        "booked": false,
    }
    const formData = new FormData()
    formData.append("name", newCar.name);
    formData.append("model", newCar.model);
    formData.append("feature1", newCar.feature1);
    formData.append("feature2", newCar.feature2);
    formData.append("feature3", newCar.feature3);
    formData.append("type", newCar.type);
    formData.append("price", newCar.price);
    formData.append("booked", newCar.booked);

    return formData;
}

function getUpdatedCar() {
    const dialog = document.querySelector('#update-dialog');
    const brand = dialog.querySelector(`form #brand`);
    const model = dialog.querySelector(`form #model`);
    const price = dialog.querySelector("form #price");
    const f1 = dialog.querySelector("form #feature1");
    const f2 = dialog.querySelector("form #feature2");
    const f3 = dialog.querySelector("form #feature3");
    const type = dialog.querySelector("#carType").value;
    const updatedCar = {
        "name": brand.value,
        "model": model.value,
        "feature1": f1.value,
        "feature2": f2.value,
        "feature3": f3.value,
        "type": type,
        "price": price.value
    }
    return updatedCar;
}

function getUpdatedBooking(booking) {
    const dialog = document.querySelector('#update-dialog');
    const toDate = dialog.querySelector('form #input-date').value;
    if (toDate === null) { throw new Error(`Ingen datum i fyllt`); }
    const updatedBooking = {
        "fromDate": booking.fromDate,
        "toDate": toDate,
        "carId": booking.carId,
        "active": true
    }
    return updatedBooking;
}

/* Uppdaterar till dagens datum vid återlämning. */
function updateReturningBooking(booking) {
    const toDay = new Date();
    const updatedBooking = {
        "fromDate": booking.fromDate,
        "toDate": toDay.toISOString().split("T")[0],
        "carId": booking.carId,
        "active": true
    }
    return updatedBooking;

}

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
/* ERROR SUBKLASSER för att hantera fel  */
/*------------------------------------------------- */

class ValidationError extends Error {
    constructor(message, icon = '<i class="fa-solid fa-exclamation" alt="!" title="Info"></i>') {
        super(message);
        this.name = "ValidationError"; /* Vad erroret heter */
        this.icon = icon;
    }
}

/* ------------------------------------------------ */
/* FETCH-FUNKTIONER - */
/*------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* BILAR ----------------- */
/* ----------------------------------------------------------------------------------------------------------------BILAR-------------------------------- */
async function fetchCars() {
    const url = 'http://localhost:8080/api/v1/cars';
    try {
        const response = await fetch(url, { method: 'GET' })

        if (!response.ok) {
            if (response.status === 404) { throw new Error(`Inga fordon finns inne för tillfället. Välkommen till vår fysiska uthyrning för exklusiva erbjudanden.`); }
            throw new Error(`Något gick fel vid inladdnig av fordon. Prova igen senare. Status: ${response.status}`);
        }

        const data = await response.json();
        dataStore.cars = data;
        displayCars(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

async function fetchCarByIdDisplay(id) {
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
            if (response.status === 401) { throw new Error(`Logga in för att boka och se mer om kring våra fordon.`); }
            throw new Error(`Något gick fel vid inladdning av valt fordon. Status: ${response.status}`);
        }

        const data = await response.json();
        displayACar(data);

    } catch (error) {
        console.error(`Fel vid inladdning av specifikt fordon. Error: ${error.message}`);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}
/* Test attt bara returnera datan som hämtas och lägga den i valfri metod sen. */
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
            console.error(`Error when fetching specific vehicle. Status: ${response.status}`);
            throw new Error(`Något gick fel vid inladdning av valt fordon. `);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
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
            console.log(`Error Loading Cars : ${response.status}`);
            throw new Error(`Något gick fel vid inladdnig av fordon. Prova igen senare eller kontakta ansvarig för databasen.`);
        }

        const data = await response.json();
        dataStore.cars = data;
        displayCarData(data);
        /* displayCarsTable(data); */

    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}


/* Skapa bil */
async function createNewCar() {
    const formData = getNewCarInfo();
    const url = `http://localhost:8080/api/v1/cars`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const responseCar = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `${credentials}` },
            body: formData
        });
        if (!responseCar.ok) {
            throw new Error(`Fel vid skapade av nytt fordon. Status: ${responseCar.status}`);
        }
        updateInfoDialog(`Registrering av fordon lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
        changeMainContent("adm-vehicles");

    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Hämta bil för uppdaterings-vy */
async function fetchCarForUpdateView(id) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/cars/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }

        });
        if (!response.ok) {
            console.error(`Error i updateCar view:${response.status}`)
            if (response.status === 403) {
                throw new Error(`Tyvärr, din behörighet når inte hit.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
            if (response.status === 404) {
                throw new Error(`'Fordonet' hittades inte.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
            throw new Error(`Något gick fel vid hämtnig av specifikt fordon.`);
        }
        const data = await response.json();
        displayUpdateCar(data);

    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}
async function updateCar(id) {
    const updatedCar = getUpdatedCar();
    const url = `http://localhost:8080/api/v1/cars/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${credentials}`
            },
            body: JSON.stringify(updatedCar)
        });
        if (!response.ok) {
            throw new Error(`Fel vid updatering av fordon. Status: ${response.status}`);
        }
        updateInfoDialog(`Uppdatering lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
        changeMainContent("adm-vehicles");

    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}
/* Radera bil */
async function deleteCar(id) {
    const url = `http://localhost:8080/api/v1/cars/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Authorization": `${credentials}` }
        });
        if (!response.ok) {
            throw new Error(`Fel vid borttagning av fordon. Status: ${response.status}`);
        }
        updateInfoDialog(`Fordon borttagen!`, `<i class="fa-solid fa-circle-minus"></i>`);
        changeMainContent("adm-vehicles");
    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }

}

/* ---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* BOKNINGAR ----------------- */
/* ----------------------------------------------------------------------------------------------------------------BOKNINGAR-------------------------------- */
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
        dataStore.bookingsActive = data;
        displayActiveBookingsData(data);

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
            console.error('Error while fetching all bookings:' + response.status)
            throw new Error(`Något gick fel vid inladdnig av bokningar. Prova igen senare eller kontakta ansvarig för databasen.`);
        }
        const data = await response.json();
        dataStore.bookings = data;
        displayBookingsData(data);

    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Skapa ny bokning */
async function createNewBooking(car) {
    const newBooking = getNewBookingInfo(car);
    const url = `http://localhost:8080/api/v1/bookings`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${credentials}`
            },
            body: JSON.stringify(newBooking)
        });
        if (!response.ok) {
            console.log(`Error when creating booking: ${response.status}`);
            if (response.status === 403) {
                throw new Error(`Tyvärr, endast uthyrning via kundkonto.<br> Logga in på ditt privatakonto och utnyttja personalrabatten.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
        }

        updateInfoDialog(`Uthyrning lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
        changeMainContent("user-bookings");
    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

async function fetchMyBookings() {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/bookings/me`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Inga bokningar!`);
            }
            if (response.status === 403) {
                throw new Error(`Tyvärr, din behörighet når inte hit.`);
            }
            throw new Error(`Något gick fel vid hämtning av dina bokningar. Status: ${response.status}`);
        }

        const data = await response.json();
        dataStore.myActiveBookings = data;/* Krockar om flera användare? */
        displayMyBookings(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }

}
/* Hämta specifik bokning. */

async function fetchBookingById(id) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/bookings/${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(`Tyvärr, din behörighet når inte hit.`);
            }
            throw new Error(`Något gick fel vid hämtning av speciell bokning. Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* hHämta en specifik användares bokningar */

async function fetchBookingByUserId(userId) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/bookings/user/${userId}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(`Tyvärr, din behörighet når inte hit.`);
            }
            if (response.status === 404) {
                throw new Error(`Inga bokningar finns på kunden.`)
            }
            throw new Error(`Något gick fel vid hämtning av speciell bokning. Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Uppdatera bokning */
async function updateBooking(id, updatedInfo) {
    const url = `http://localhost:8080/api/v1/bookings/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${credentials}`
            },
            body: JSON.stringify(updatedInfo)
        });
        if (!response.ok) {
            throw new Error(`Fel vid updatering av bokning. Status: ${response.status}`);
        }
        updateInfoDialog(`Uppdatering lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
        changeMainContent("adm-bookings");

    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }

}
/* Uppdatera bokning */
async function updateAndReturn(id, updatedInfo) {
    const url = `http://localhost:8080/api/v1/bookings/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${credentials}`
            },
            body: JSON.stringify(updatedInfo)
        });
        if (!response.ok) {
            throw new Error(`Fel vid updatering av bokning. Status: ${response.status}`);
        }
        const data = await response.json();
        returnBooking(data.id);
    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }

}

/* Återlämna bokninhg */
async function returnBooking(id) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/bookings/return/${id}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                updateInfoDialog(`Bokningen hittades ej.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
            throw new Error(`Något gick fel vid återlämning. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.active === false) {
            updateInfoDialog(`Återlämning lyckades!`, `<i class="fa-regular fa-circle-check"></i>`);
            changeMainContent("adm-bookings");
        }
    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }

}

/* Radera bokning */
async function deleteBooking(id) {
    const credentials = sessionStorage.getItem("basicAuth");
    const url = `http://localhost:8080/api/v1/bookings/${id}`;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                "Authorization": `${credentials}`
            }
        });
        if (!response.status === 204) {
            throw new Error(`Något gick fel vid hämtning av speciell bokning. Status: ${response.status}`);
        }
        updateInfoDialog(`Bokning raderad!`, `<i aria-hidden="true" class="fa-solid fa-circle-minus" title="Deleted"></i>`);
        changeMainContent("adm-bookings");

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i aria-hidden="true" class="fa-solid fa-car-burst icon-car"></i>`);
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
            throw new Error(`Problem vid inladdning. Status: ${response.status}`);
        }

        const data = await response.json();
        dataStore.users = data;
        displayUsersData(data);

    } catch (error) {
        console.error('Error:' + error.message);
    }
}

async function fetchUsersForList() {
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
            throw new Error(`Problem vid inladdning. Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:' + error.message);
    }
}


/* Hämtar bara den som är inloggad! */
async function fetchUserByIdDisplay() {
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
            console.error('Error when fetching user by id:' + response.status);
            if (response.status === 403) {
                throw new Error(`Tyvärr, din behörighet når inte hit.`);
            }
            throw new Error(`Något gick fel vid verifiering av användare. Status: ${response.status}`);

        }

        const data = await response.json();
        displayUser(data);

    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
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
            console.error(`Error verifying and saving user after login: ${response.status}`);
            throw new Error(`Något gick fel vid verifiering av användare.`);
        }

        const data = await response.json();
        sessionStorage.setItem("user_principal", JSON.stringify(data));


    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
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
            if (response.status === 403) {
                updateInfoDialog(`Tyvärr, din behörighet når inte hit.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }
            throw new Error(`Något gick fel vid hämtning av specifik användare. Status: ${response.status}`);

        }
        const data = await response.json();
        displayUpdateUser(data);

    } catch (error) {
        console.error('Error:' + error.message);
        updateInfoDialog("Fel uppstod: " + error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}


/* Hämtar bara användar info ingen displau!!TEST */
async function fetchUserById(id) {
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
            if (response.status === 403) {
                console.error("User-related error: " + response.status);
                throw new Error(`Tyvärr, din behörighet når inte hit.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            } if (response.status === 404) {
                console.error("User-related error:" + response.status);
                throw new Error(`Användare är borttagen.<br> Se bokningsliggare för anonyma medlemmar.`, `<i class="fa-solid fa-car-burst icon-car"></i>`);
            }

        }

        const data = await response.json();
        return data;


    } catch (error) {
        updateInfoDialog(error.message, `<i class="fa-solid fa-car-burst icon-car"></i>`);
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
        updateInfoDialog(`Registrering lyckades!`, `<i class="fa-solid fa-user-plus"></i>`);

    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}

/* Radera användare */
async function deleteUser(id) {
    const url = `http://localhost:8080/api/v1/users/${id}`;
    const credentials = sessionStorage.getItem("basicAuth");
    try {
        const responseUser = await fetch(url, {
            method: "DELETE",
            headers: { "Authorization": `${credentials}` }
        });
        if (!responseUser.status === 204) {
            throw new Error(`Fel vid borttagning av ny användare. Status: ${responseUser.status}`);
        }
        updateInfoDialog(`Användare raderad!`, `<i class="fa-solid fa-user-minus"></i>`);

    } catch (error) {
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
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
        updateInfoDialog(error, `<i class="fa-solid fa-car-burst icon-car"></i>`);
    }
}