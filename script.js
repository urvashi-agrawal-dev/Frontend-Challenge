document.addEventListener('DOMContentLoaded', function() {
    // Enhanced search functionality
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    const performSearch = () => {
        const searchTerm = searchBox.value.trim();
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            alert(`Searching for: ${searchTerm}`);
        }
    };
    
    searchBox.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
    searchButton?.addEventListener('click', performSearch);

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.error("Theme toggle button not found!");
    } else {
        // Initialize theme
        const prefersDarkScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme') || 
                           (prefersDarkScheme?.matches ? 'dark' : 'light');

        const setTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.setAttribute('aria-pressed', 'true');
                themeToggle.textContent = '☀️';
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.setAttribute('aria-pressed', 'false');
                themeToggle.textContent = '🌙';
            }
            localStorage.setItem('theme', theme);
        };

        setTheme(currentTheme);

        // Toggle on click
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(theme);
        });

        // System theme change listener
        prefersDarkScheme?.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const body = document.body;
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            const isOpening = !nav.classList.contains('active');
            nav.classList.toggle('active');
            this.setAttribute('aria-expanded', isOpening);
            body.style.overflow = isOpening ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !e.target.closest('nav') && 
                !e.target.closest('.mobile-menu-toggle')) {
                nav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }

    // Events slider
    const slider = document.querySelector('.events-slider');
    if (slider) {
        const slides = document.querySelectorAll('.event-slide');
        if (slides.length > 0) {
            let currentSlide = 0;
            let slideInterval;

            const showSlide = (index) => {
                slides.forEach((slide, i) => {
                    slide.style.transform = `translateX(${100 * (i - index)}%)`;
                    slide.setAttribute('aria-hidden', i !== index);
                });
                updateDots();
            };

            const updateDots = () => {
                const dots = document.querySelectorAll('.slider-dot');
                dots?.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                    dot.setAttribute('aria-current', i === currentSlide);
                });
            };

            const goToSlide = (index) => {
                currentSlide = index;
                showSlide(currentSlide);
                resetInterval();
            };

            const resetInterval = () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 5000);
            };

            const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
            const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

            // Initialize
            showSlide(0);
            resetInterval();

            // Navigation
            document.querySelector('.slider-prev')?.addEventListener('click', prevSlide);
            document.querySelector('.slider-next')?.addEventListener('click', nextSlide);

            // Cleanup on page leave
            window.addEventListener('beforeunload', () => clearInterval(slideInterval));
        }
    }

    // Buttons with loading states
    document.querySelectorAll('button:not(#themeToggle, .slider-prev, .slider-next, .slider-dot)').forEach(button => {
        button.addEventListener('click', function() {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<span class="spinner"></span>';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.disabled = false;
                alert(`${this.textContent.trim()} action completed!`);
            }, 1000);
        });
    });

    // Scroll-to-top button
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopButton);

    const toggleScrollButton = () => {
        const isVisible = window.pageYOffset > 300;
        scrollToTopButton.style.opacity = isVisible ? '1' : '0';
        scrollToTopButton.style.visibility = isVisible ? 'visible' : 'hidden';
    };

    window.addEventListener('scroll', toggleScrollButton);
    scrollToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});