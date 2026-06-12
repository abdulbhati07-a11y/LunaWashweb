/* ========================================
   LÜNA WASH - GSAP Animations & Scroll Triggers
   ======================================== */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ==================== SCROLL ANIMATIONS SETUP ====================

/**
 * Initialize all scroll-triggered animations
 */
function initScrollAnimations() {
    // Service Cards Animation
    gsap.utils.toArray('.service-card:not(.no-animations)').forEach((card, index) => {
        gsap.fromTo(
            card,
            {
                opacity: 0,
                y: 20,
                scale: 0.98
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 15%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Process Steps Animation
    gsap.utils.toArray('.process-step:not(.no-animations)').forEach((step, index) => {
        gsap.fromTo(
            step,
            {
                opacity: 0,
                y: 20,
                x: index % 2 === 0 ? -15 : 15
            },
            {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: step,
                    start: 'top 85%',
                    end: 'top 15%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Pricing Cards Animation
    gsap.utils.toArray('.pricing-card:not(.no-animations)').forEach((card, index) => {
        gsap.fromTo(
            card,
            {
                opacity: 0,
                y: 30,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Testimonial Cards Animation
    gsap.utils.toArray('.testimonial-card:not(.no-animations)').forEach((card, index) => {
        gsap.fromTo(
            card,
            {
                opacity: 0,
                rotateY: -5,
                x: -20
            },
            {
                opacity: 1,
                rotateY: 0,
                x: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 15%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Section Titles Animation
    gsap.utils.toArray('.section-title:not(.no-animations)').forEach((title) => {
        gsap.fromTo(
            title,
            {
                opacity: 0,
                y: -15
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: title,
                    start: 'top 90%',
                    end: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Form Groups Animation
    gsap.utils.toArray('.form-group:not(.no-animations)').forEach((group, index) => {
        gsap.fromTo(
            group,
            {
                opacity: 0,
                x: -15
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.7,
                delay: index * 0.05,
                scrollTrigger: {
                    trigger: group,
                    start: 'top 85%',
                    end: 'top 15%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Contact Info Animation
    gsap.utils.toArray('.info-item:not(.no-animations)').forEach((item, index) => {
        gsap.fromTo(
            item,
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    end: 'top 15%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Footer Animation
    const footer = document.querySelector('.footer');
    if (footer && !footer.classList.contains('no-animations')) {
        gsap.fromTo(
            '.footer',
        {
            opacity: 0,
            y: 15
        },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 95%',
                end: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        }
    );
}
}

// ==================== PARALLAX EFFECTS ====================

/**
 * Setup parallax background effect for hero
 */
function setupParallax() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        gsap.to(heroSection, {
            y: 100,
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom center',
                scrub: 1,
                markers: false
            }
        });

        // Parallax for floating particles
        gsap.utils.toArray('.particle').forEach((particle, index) => {
            const speed = 50 + index * 30;
            gsap.to(particle, {
                y: speed,
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom center',
                    scrub: 1
                }
            });
        });
    }
}

// ==================== BUTTON HOVER EFFECTS ====================

/**
 * Setup button hover animations
 */
function setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1.05,
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1,
                boxShadow: '0 0 0 rgba(255, 107, 53, 0)',
                ease: 'power2.out'
            });
        });

        button.addEventListener('mousedown', function() {
            gsap.to(this, {
                duration: 0.1,
                scale: 0.95,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseup', function() {
            gsap.to(this, {
                duration: 0.2,
                scale: 1.05,
                ease: 'back.out'
            });
        });
    });
}

// ==================== CARD HOVER ANIMATIONS ====================

/**
 * Setup glass card hover effects
 */
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        const originalTransform = card.style.transform;

        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.3,
                y: -8,
                boxShadow: '0 20px 40px rgba(255, 107, 53, 0.2)',
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.3,
                y: 0,
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                ease: 'power2.out'
            });
        });
    });
}

// ==================== SECTION SCROLL REVEAL ====================

/**
 * Reveal elements as they scroll into view
 */
function setupSectionReveal() {
    const revealElements = document.querySelectorAll(
        '.services:not(.no-animations) .service-card, ' +
        '.process:not(.no-animations) .process-step, ' +
        '.pricing:not(.no-animations) .pricing-card, ' +
        '.testimonials:not(.no-animations) .testimonial-card, ' +
        '.contact:not(.no-animations) .info-item'
    );

    revealElements.forEach((element) => {
        element.style.opacity = '0';

        gsap.to(element, {
            opacity: 1,
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}

// ==================== COUNTER ANIMATION ====================

/**
 * Animate numbers on scroll
 */
function animateCounter(element, target, duration = 1) {
    gsap.to(
        { value: 0 },
        {
            value: target,
            duration: duration,
            onUpdate: function() {
                element.textContent = Math.floor(this.targets()[0].value);
            },
            ease: 'power2.out'
        }
    );
}

// ==================== NAVBAR SCROLL EFFECT ====================

/**
 * Navbar scroll effect
 */
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;

    let lastScrollTop = 0;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 100) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }

            lastScrollTop = scrollTop;
            isScrolling = false;
        }
    });
}

// ==================== CURSOR FOLLOW EFFECT ====================

/**
 * Setup cursor follow effect for cards
 */
function setupCursorFollow() {
    const cards = document.querySelectorAll('.glass-card');

    if (window.innerWidth > 768) {
        cards.forEach(card => {
            // Skip cards inside no-animations sections
            if (card.closest('.no-animations')) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Use different intensity for service cards vs others
                const intensity = card.classList.contains('service-card') ? 6 : 12;
                const rotateX = (y / rect.height) * intensity;
                const rotateY = (x / rect.width) * -intensity;
                const brightness = 1 + (y / rect.height) * 0.1;

                gsap.to(card, {
                    duration: 0.2,
                    rotationX: rotateX,
                    rotationY: rotateY,
                    scale: 1.02,
                    transformPerspective: 1000,
                    overwrite: 'auto'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.5,
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });
        });
    }
}

// ==================== PULSE ANIMATION LOOP ====================

/**
 * Continuous pulse animation for accent elements
 */
function setupPulseAnimations() {
    const pulseElements = document.querySelectorAll('.floating-circle');

    pulseElements.forEach((element) => {
        gsap.to(element, {
            boxShadow: [
                '0 0 0 0 rgba(255, 107, 53, 0.7)',
                '0 0 0 20px rgba(255, 107, 53, 0)'
            ],
            repeat: -1,
            duration: 1.5,
            ease: 'none'
        });
    });
}

// ==================== STAGGERED TEXT REVEAL ====================

/**
 * Reveal text character by character
 */
function revealTextCharByChar(element, duration = 1) {
    const text = element.textContent;
    element.textContent = '';

    gsap.to(element, {
        duration: duration,
        text: text,
        ease: 'none'
    });
}

// ==================== SMOOTH SCROLL BEHAVIOR ====================

/**
 * Ensure smooth scroll works across all browsers
 */
function ensureSmoothScroll() {
    // Smooth scroll already set in CSS, but we can enhance it
    document.documentElement.style.scrollBehavior = 'smooth';
}

// ==================== ANIMATION PERFORMANCE OPTIMIZATION ====================

/**
 * Disable animations on reduced-motion preference
 */
function respectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(0.01); // Essentially disable animations
        document.documentElement.style.scrollBehavior = 'auto';
    }
}

// ==================== INITIALIZE ANIMATIONS ====================

/**
 * Initialize all GSAP animations
 */
function initializeAnimations() {
    initScrollAnimations();
    setupParallax();
    setupButtonEffects();
    setupCardHoverEffects();
    setupSectionReveal();
    setupNavbarScroll();
    setupCursorFollow();
    setupPulseAnimations();
    ensureSmoothScroll();
    respectReducedMotion();
}

/**
 * Wait for DOM to be ready, then initialize
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
    initializeAnimations();
}

// ==================== HANDLE WINDOW RESIZE ====================

/**
 * Refresh ScrollTrigger on window resize
 */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});

// ==================== EXPORT FOR TESTING ====================

// Make functions available globally for debugging
window.gsapAnimations = {
    initScrollAnimations,
    setupParallax,
    setupButtonEffects,
    setupCardHoverEffects,
    setupSectionReveal,
    animateCounter,
    revealTextCharByChar
};
