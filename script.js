document.addEventListener('DOMContentLoaded', function() {
    // Enhanced search functionality with debounce
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');

    const performSearch = () => {
        const searchTerm = searchBox.value.trim();
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            showNotification(`Searching for: "${searchTerm}"`);
        } else {
            showNotification('Please enter a search term', 'warning');
        }
    };

    const debounceSearch = debounce(performSearch, 500);
    searchBox.addEventListener('input', debounceSearch);
    searchBox.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
    searchButton?.addEventListener('click', performSearch);

    // Theme toggle functionality with icon and system preference
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.warn("Theme toggle button not found - theme switching disabled");
    } else {
        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const storedTheme = localStorage.getItem('theme');
        let currentTheme = storedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');

        const setTheme = (theme) => {
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                lightIcon.style.display = 'none';
                darkIcon.style.display = 'inline';
            } else {
                document.body.classList.remove('dark-theme');
                lightIcon.style.display = 'inline';
                darkIcon.style.display = 'none';
            }
            localStorage.setItem('theme', theme);
        };

        setTheme(currentTheme);

        themeToggle.addEventListener('click', () => {
            currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            setTheme(currentTheme);
        });

        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Mobile menu toggle with accessibility improvements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const body = document.body;

    if (mobileMenuToggle && nav) {
        const toggleMenu = (isOpening) => {
            nav.classList.toggle('active', isOpening);
            mobileMenuToggle.setAttribute('aria-expanded', isOpening.toString());
            body.style.overflow = isOpening ? 'hidden' : '';
            if (isOpening) {
                const focusableElements = nav.querySelectorAll('a[href], button');
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        };

        mobileMenuToggle.addEventListener('click', function () {
            const isOpening = !nav.classList.contains('active');
            toggleMenu(isOpening);
        });

        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !e.target.closest('nav') && !e.target.closest('.mobile-menu-toggle')) {
                toggleMenu(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                toggleMenu(false);
                mobileMenuToggle.focus();
            }
        });
    }

    // Events slider with dots and swipe support
    const initSlider = () => {
        const slider = document.querySelector('.events-slider');
        if (!slider) return;

        const slides = Array.from(document.querySelectorAll('.event-slide'));
        if (slides.length === 0) return;

        let currentSlide = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let slideInterval;

        if (!document.querySelector('.slider-dots')) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-dots';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'slider-dot';
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            });
            slider.appendChild(dotsContainer);
        }

        const showSlide = (index) => {
            slider.style.setProperty('--current-slide', index);
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
            currentSlide = (index + slides.length) % slides.length;
            showSlide(currentSlide);
            resetInterval();
        };

        const nextSlide = () => goToSlide(currentSlide + 1);
        const prevSlide = () => goToSlide(currentSlide - 1);

        const resetInterval = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        };

        showSlide(0);
        resetInterval();

        slides.forEach((slide, index) => {
            slide.addEventListener('touchstart', (e) => {
                isDragging = true;
                startPos = e.touches[0].clientX;
                currentSlide = index;
                prevTranslate = currentTranslate;
                clearInterval(slideInterval);
            });

            slide.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentTranslate = prevTranslate + e.touches[0].clientX - startPos;
            });

            slide.addEventListener('touchend', () => {
                isDragging = false;
                const movedBy = currentTranslate - prevTranslate;
                if (movedBy < -100) nextSlide();
                else if (movedBy > 100) prevSlide();
                else goToSlide(currentSlide);
                resetInterval();
            });
        });

        document.querySelector('.slider-prev')?.addEventListener('click', prevSlide);
        document.querySelector('.slider-next')?.addEventListener('click', nextSlide);

        document.addEventListener('keydown', (e) => {
            if (document.activeElement.closest('.events-slider')) {
                if (e.key === 'ArrowLeft') prevSlide();
                if (e.key === 'ArrowRight') nextSlide();
            }
        });
    };

    initSlider();

    // Button animation with fake loading
    document.querySelectorAll('button:not(#themeToggle, .slider-prev, .slider-next, .slider-dot, .scroll-to-top)').forEach(button => {
        button.addEventListener('click', async function () {
            const originalHTML = this.innerHTML;
            const originalWidth = this.offsetWidth;
            this.innerHTML = '<span class="spinner"></span>';
            this.style.width = `${originalWidth}px`;
            this.disabled = true;

            try {
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
                this.innerHTML = '✓ ' + originalHTML;
                showNotification(`${this.textContent.replace('✓', '').trim()} completed successfully!`, 'success');
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.width = '';
                    this.disabled = false;
                }, 2000);
            } catch (error) {
                this.innerHTML = '✗ ' + originalHTML;
                showNotification(`Action failed: ${error.message}`, 'error');
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.width = '';
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    // Scroll to top button
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopButton);

    const toggleScrollButton = () => {
        const isVisible = window.scrollY > 300;
        scrollToTopButton.classList.toggle('visible', isVisible);
        scrollToTopButton.setAttribute('aria-hidden', !isVisible);
    };

    window.addEventListener('scroll', throttle(toggleScrollButton, 100));
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollToTopButton.blur();
    });

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function (...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    alert(`An error occurred: ${event.message}`);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
