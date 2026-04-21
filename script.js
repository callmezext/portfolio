/* ============================================ */
/*  Main Application Script                      */
/*  - Page Loader                                */
/*  - Scroll Progress Bar                        */
/*  - Back-to-Top Button                         */
/*  - Typing effect                              */
/*  - Scroll animations                          */
/*  - Navigation                                 */
/*  - Counter animation                          */
/*  - Mobile menu                                */
/*  - Custom cursor                              */
/* ============================================ */

(function () {
    'use strict';

    // ---- Page Loader ----
    const pageLoader = document.getElementById('page-loader');
    
    window.addEventListener('load', () => {
        if (pageLoader) {
            setTimeout(() => {
                pageLoader.classList.add('loaded');
                document.body.classList.add('loaded');
                // Remove loader from DOM after animation
                setTimeout(() => {
                    pageLoader.style.display = 'none';
                }, 600);
            }, 1800); // Show loader for 1.8 seconds
        }
    });

    // ---- Initialize AOS (Animate On Scroll) ----
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        delay: 0,
    });

    // ---- Scroll Progress Bar ----
    const scrollProgressBar = document.getElementById('scroll-progress');

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (scrollProgressBar) {
            scrollProgressBar.style.width = scrollPercent + '%';
        }
    }

    // ---- Back-to-Top Button ----
    const backToTop = document.getElementById('back-to-top');

    function updateBackToTop() {
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        });
    }

    // ---- Typing Effect ----
    const typingTexts = [
        'Full Stack Web Developer',
        'Frontend Engineer',
        'Backend Developer',
        'Three.js Explorer',
        'UI/UX Enthusiast',
    ];

    const typingElement = document.getElementById('typing-text');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeEffect() {
        if (!typingElement) return;
        const currentText = typingTexts[textIndex];

        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % typingTexts.length;
            typingSpeed = 300; // Pause before next word
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();

    // ---- Custom Cursor ----
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        document.body.appendChild(dot);

        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        function animateCursor() {
            dotX += (cursorX - dotX) * 0.2;
            dotY += (cursorY - dotY) * 0.2;

            cursor.style.left = cursorX - 10 + 'px';
            cursor.style.top = cursorY - 10 + 'px';
            dot.style.left = dotX - 2.5 + 'px';
            dot.style.top = dotY - 2.5 + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects on interactive elements
        const hoverElements = document.querySelectorAll('a, button, .skill-card, .project-card, .what-i-do-card, .fun-fact-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // ---- Navbar Scroll ----
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Combined scroll handler for performance
    window.addEventListener('scroll', () => {
        // Navbar background
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });

        // Update scroll progress
        updateScrollProgress();
        
        // Update back-to-top visibility
        updateBackToTop();

        // Parallax for home section
        const homeSection = document.getElementById('home');
        if (homeSection) {
            const homeContent = homeSection.querySelector('.max-w-5xl');
            if (homeContent && window.scrollY < 800) {
                homeContent.style.transform = `translateY(${window.scrollY * 0.3}px)`;
                homeContent.style.opacity = 1 - window.scrollY / 600;
            }
        }

        // Show/hide sidebars
        const socialSidebar = document.getElementById('social-sidebar');
        const emailSidebar = document.getElementById('email-sidebar');
        if (socialSidebar) {
            if (window.scrollY > 100) {
                socialSidebar.classList.add('visible');
            } else {
                socialSidebar.classList.remove('visible');
            }
        }
        if (emailSidebar) {
            if (window.scrollY > 100) {
                emailSidebar.classList.add('visible');
            } else {
                emailSidebar.classList.remove('visible');
            }
        }
    });

    // ---- Mobile Menu ----
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ---- Intersection Observer for Animations ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skill bars
                if (entry.target.classList.contains('skill-card')) {
                    const bar = entry.target.querySelector('.skill-bar');
                    if (bar) {
                        const width = bar.getAttribute('data-width');
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 300);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe skill cards
    document.querySelectorAll('.skill-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe project cards
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });

    // ---- Counter Animation ----
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(eased * target);

                counter.textContent = value + '+';

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // Observe the about section for counters
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });
        counterObserver.observe(aboutSection);
    }

    // Also observe fun facts section for counters
    const funFactsSection = document.getElementById('fun-facts');
    if (funFactsSection) {
        const funFactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate fun fact counters independently
                    const counters = funFactsSection.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        if (counter.dataset.animated) return;
                        counter.dataset.animated = 'true';
                        
                        const target = parseInt(counter.getAttribute('data-target'));
                        const duration = 2500;
                        const start = performance.now();

                        function updateFunCounter(currentTime) {
                            const elapsed = currentTime - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const value = Math.round(eased * target);
                            counter.textContent = value + '+';
                            if (progress < 1) {
                                requestAnimationFrame(updateFunCounter);
                            }
                        }
                        requestAnimationFrame(updateFunCounter);
                    });
                }
            });
        }, { threshold: 0.3 });
        funFactObserver.observe(funFactsSection);
    }

    // ---- Smooth Scroll for Nav Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip empty hash links
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth',
                });
            }
        });
    });

    // ---- Contact Form (Demo) ----
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Message Sent!';
                btn.classList.remove('from-primary', 'to-secondary');
                btn.classList.add('from-green-500', 'to-emerald-500');

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    btn.classList.remove('from-green-500', 'to-emerald-500');
                    btn.classList.add('from-primary', 'to-secondary');
                    contactForm.reset();
                }, 2000);
            }, 1500);
        });
    }

    // ---- Tilt Effect on Cards ----
    if (window.innerWidth > 768) {
        const tiltCards = document.querySelectorAll('.project-card > div:last-child, .skill-card > div:last-child');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / centerY * -3;
                const rotateY = (x - centerX) / centerX * 3;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

})();
