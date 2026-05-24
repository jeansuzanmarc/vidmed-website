// Stories Carousel (WhatsApp Style)
const carousel = {
    currentIndex: 0,
    totalImages: 6,
    interval: null,
    isPaused: false,
    duration: 5000, // 5 secondes par image

    init() {
        this.images = document.querySelectorAll('.carousel-img');
        this.progressBars = document.querySelectorAll('.progress-bar');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        this.pauseBtn = document.querySelector('.carousel-pause');
        this.pauseIcon = document.querySelector('.pause-icon');
        this.playIcon = document.querySelector('.play-icon');

        // Event listeners
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.pauseBtn.addEventListener('click', () => this.togglePause());

        // Touch support pour mobile (swipe)
        this.setupTouch();

        // Démarrer le carousel
        this.start();
    },

    start() {
        this.updateImage();
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                this.next();
            }
        }, this.duration);
    },

    stop() {
        clearInterval(this.interval);
    },

    updateImage() {
        // Cacher toutes les images
        this.images.forEach((img, index) => {
            img.classList.remove('active');
        });

        // Afficher l'image courante
        this.images[this.currentIndex].classList.add('active');

        // Mettre à jour les progress bars
        this.progressBars.forEach((bar, index) => {
            bar.classList.remove('active', 'completed');
            const afterElement = bar.querySelector('::after');

            if (index < this.currentIndex) {
                bar.classList.add('completed');
            } else if (index === this.currentIndex) {
                bar.classList.add('active');
            }
        });
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalImages;
        this.updateImage();
    },

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalImages) % this.totalImages;
        this.updateImage();
    },

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.pauseIcon.style.display = 'none';
            this.playIcon.style.display = 'block';
        } else {
            this.pauseIcon.style.display = 'block';
            this.playIcon.style.display = 'none';
        }
    },

    setupTouch() {
        const carouselElement = document.querySelector('.stories-carousel');
        this.touchStartX = 0;
        this.touchEndX = 0;

        carouselElement.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });

        carouselElement.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // Click gauche/droite sur desktop
        carouselElement.addEventListener('click', (e) => {
            const rect = carouselElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            // Si clic sur la partie gauche (30%), image précédente
            if (x < width * 0.3) {
                this.prev();
            }
            // Si clic sur la partie droite (70%), image suivante
            else if (x > width * 0.3) {
                this.next();
            }
        });
    },

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - image suivante
                this.next();
            } else {
                // Swipe right - image précédente
                this.prev();
            }
        }
    }
};

// Initialiser le carousel quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    carousel.init();
});

// Pause le carousel quand on quitte l'onglet
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        carousel.isPaused = true;
    } else {
        carousel.isPaused = false;
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Smooth Scroll with Offset for Fixed Header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with fade-in-up class
document.querySelectorAll('.fade-in-up').forEach(element => {
    observer.observe(element);
});

// Header Background on Scroll
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Form Submission Handler
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Here you would typically send the data to a server
    // For now, we'll just show a success message
    console.log('Form submitted:', data);

    // Show success message
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');

    // Reset form
    contactForm.reset();
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Responsive Navigation
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});
