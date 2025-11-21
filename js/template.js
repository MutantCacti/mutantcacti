// Shared navigation
function renderNav(currentPage) {
    return `
    <nav class="nav" role="navigation" aria-label="Primary navigation">
        <div class="nav__container">
            <div class="nav__brand-group">
                <a href="/" class="nav__brand">mutantcacti</a>
                <img src="res/three_v4.svg" alt="three logo" class="nav__logo">
            </div>
            <button class="nav__toggle" aria-label="Toggle navigation menu" aria-expanded="false">
                <span class="nav__toggle-icon"></span>
            </button>
            <ul class="nav__list" role="list">
                <li></li>
                <li><a href="/" class="nav__link" ${currentPage === '/' ? 'aria-current="page"' : ''}>Home</a></li>
                <li><a href="/about.html" class="nav__link" ${currentPage === '/about.html' ? 'aria-current="page"' : ''}>About</a></li>
                <li><a href="/O.html" class="nav__link" ${currentPage === '/O.html' ? 'aria-current="page"' : ''}>O/</a></li>
                <li><a href="/journal.html" class="nav__link" ${currentPage === '/journal.html' ? 'aria-current="page"' : ''}>Journal</a></li>
                <li><a href="/contact.html" class="nav__link" ${currentPage === '/contact.html' ? 'aria-current="page"' : ''}>Contact</a></li>
            </ul>
        </div>
    </nav>`;
}

// Shared footer
function renderFooter() {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <p>Contact: mutantcacti@gmail.com</p>
            </div>
        </div>
    </footer>`;
}

// Initialize template
document.addEventListener('DOMContentLoaded', function() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder) {
        navPlaceholder.outerHTML = renderNav(window.location.pathname);
    }
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = renderFooter();
    }

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');

    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('nav__list--open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('nav__list--open');
            }
        });

        // Close menu when clicking a link
        const navLinks = navList.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('nav__list--open');
            });
        });
    }
});
