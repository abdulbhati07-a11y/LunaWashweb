/* ========================================
   LÜNA WASH - GSAP Animations & Scroll Triggers
   ======================================== */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ==================== LENIS SMOOTH SCROLL ====================
let lenis;

function initLenis() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Get scroll value
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }
}

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
                y: 25,
                scale: 0.97
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                delay: index * 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
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
                y: 25,
                x: index % 2 === 0 ? -18 : 18
            },
            {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 0.9,
                delay: index * 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: step,
                    start: 'top 88%',
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
                y: 35,
                scale: 0.96
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                delay: index * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 82%',
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
                rotateY: -6,
                x: -25
            },
            {
                opacity: 1,
                rotateY: 0,
                x: 0,
                duration: 0.9,
                delay: index * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
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
                y: -20
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: title,
                    start: 'top 92%',
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
                x: -18
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: index * 0.04,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: group,
                    start: 'top 88%',
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
                y: 25
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                delay: index * 0.09,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 88%',
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
            y: 20
        },
        {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 97%',
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
            y: 80,
            ease: 'none',
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom center',
                scrub: 1.5,
                markers: false
            }
        });

        // Parallax for floating particles
        gsap.utils.toArray('.particle').forEach((particle, index) => {
            const speed = 50 + index * 30;
            gsap.to(particle, {
                y: speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom center',
                    scrub: 1.5
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
                duration: 0.35,
                scale: 1.05,
                y: -1,
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.5), 0 6px 20px rgba(255, 107, 53, 0.25)',
                ease: 'power3.out'
            });
        });

        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.4,
                scale: 1,
                y: 0,
                boxShadow: '0 0 0 rgba(255, 107, 53, 0)',
                ease: 'power3.out'
            });
        });

        button.addEventListener('mousedown', function() {
            gsap.to(this, {
                duration: 0.12,
                scale: 0.96,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseup', function() {
            gsap.to(this, {
                duration: 0.35,
                scale: 1.05,
                ease: 'back.out(1.5)'
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
                duration: 0.4,
                y: -10,
                boxShadow: '0 24px 48px rgba(255, 107, 53, 0.22)',
                ease: 'power3.out'
            });
        });

        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.5,
                y: 0,
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                ease: 'power3.out'
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
                const intensity = card.classList.contains('service-card') ? 5 : 10;
                const rotateX = (y / rect.height) * intensity;
                const rotateY = (x / rect.width) * -intensity;

                gsap.to(card, {
                    duration: 0.35,
                    rotationX: rotateX,
                    rotationY: rotateY,
                    scale: 1.02,
                    transformPerspective: 1000,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.65,
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    ease: 'expo.out',
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
    // Smooth scroll is now handled by Lenis
    if (!lenis && typeof Lenis === 'undefined') {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
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
    initLenis();
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
