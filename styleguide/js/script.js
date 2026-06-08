
document.querySelector("#hamburger-icon").addEventListener('click', () => { mobileMenu(); });
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('up-btn')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

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