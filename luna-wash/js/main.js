/* ========================================
   LÜNA WASH - Main JavaScript
   ======================================== */

// ==================== DOM ELEMENTS ====================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const pricingToggle = document.getElementById('pricingToggle');
const testimonialsCarousel = document.getElementById('testimonialsCarousel');
const carouselDots = document.getElementById('carouselDots');
const signInBtn = document.getElementById('signInBtn');
const registerBtn = document.getElementById('registerBtn');
const signInModal = document.getElementById('signInModal');
const registerModal = document.getElementById('registerModal');
const signInForm = document.getElementById('signInForm');
const registerForm = document.getElementById('registerForm');

// ==================== STATE ====================
let isMenuOpen = false;
let currentTestimonialIndex = 0;

// ==================== NAVBAR FUNCTIONALITY ====================

/**
 * Toggle hamburger menu
 */
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    hamburger.classList.toggle('active', isMenuOpen);
    navMenu.classList.toggle('active', isMenuOpen);
}

/**
 * Close menu
 */
function closeMenu() {
    isMenuOpen = false;
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

/**
 * Handle hamburger click
 */
hamburger?.addEventListener('click', toggleMenu);

/**
 * Close menu when a link is clicked
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

/**
 * Close menu when clicking outside
 */
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        closeMenu();
    }
});

/**
 * Update active navbar link on scroll
 */
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
        }
    });
});

/**
 * Smooth scroll to section
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        closeMenu();
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Global scroll function
 */
window.scrollToSection = scrollToSection;

// ==================== MODAL FUNCTIONALITY ====================

/**
 * Open Sign In modal
 */
function openSignInModal() {
    signInModal.classList.add('active');
    registerModal.classList.remove('active');
}

/**
 * Open Register modal
 */
function openRegisterModal() {
    registerModal.classList.add('active');
    signInModal.classList.remove('active');
}

/**
 * Close all modals
 */
function closeAllModals() {
    signInModal.classList.remove('active');
    registerModal.classList.remove('active');
}

/**
 * Sign In modal events
 */
signInBtn?.addEventListener('click', openSignInModal);
document.getElementById('signInClose')?.addEventListener('click', closeAllModals);
document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    openRegisterModal();
});

/**
 * Register modal events
 */
registerBtn?.addEventListener('click', openRegisterModal);
document.getElementById('registerClose')?.addEventListener('click', closeAllModals);
document.getElementById('switchToSignIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openSignInModal();
});

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', (e) => {
    if (e.target === signInModal) closeAllModals();
    if (e.target === registerModal) closeAllModals();
});

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

/**
 * Handle Sign In submission
 */
signInForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value.trim();
    
    let isValid = true;
    
    // Validate email
    if (!email || !validateEmail(email)) {
        document.getElementById('signInEmailError').textContent = 'Please enter a valid email';
        isValid = false;
    } else {
        document.getElementById('signInEmailError').textContent = '';
    }
    
    // Validate password
    if (!password || password.length < 6) {
        document.getElementById('signInPasswordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    } else {
        document.getElementById('signInPasswordError').textContent = '';
    }
    
    if (isValid) {
        showToast('Welcome back! You have been signed in successfully.', 'success');
        closeAllModals();
        signInForm.reset();
        
        // Store user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: email,
            signedInAt: new Date().toLocaleString()
        }));
        
        // Update button text
        setTimeout(() => {
            signInBtn.textContent = 'Signed In ✓';
            signInBtn.style.backgroundColor = 'var(--color-accent-active)';
        }, 500);
    }
});

/**
 * Handle Register submission
 */
registerForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    let isValid = true;
    
    // Validate name
    if (!name || name.length < 2) {
        document.getElementById('registerNameError').textContent = 'Name must be at least 2 characters';
        isValid = false;
    } else {
        document.getElementById('registerNameError').textContent = '';
    }
    
    // Validate email
    if (!email || !validateEmail(email)) {
        document.getElementById('registerEmailError').textContent = 'Please enter a valid email';
        isValid = false;
    } else {
        document.getElementById('registerEmailError').textContent = '';
    }
    
    // Validate password
    if (!password || password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    } else {
        document.getElementById('registerPasswordError').textContent = '';
    }
    
    // Validate password match
    if (password !== confirm) {
        document.getElementById('registerConfirmError').textContent = 'Passwords do not match';
        isValid = false;
    } else {
        document.getElementById('registerConfirmError').textContent = '';
    }
    
    if (isValid) {
        showToast('Account created successfully! You are now signed in.', 'success');
        closeAllModals();
        registerForm.reset();
        
        // Store user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            name: name,
            email: email,
            createdAt: new Date().toLocaleString()
        }));
        
        // Update button text
        setTimeout(() => {
            signInBtn.textContent = 'Signed In ✓';
            signInBtn.style.backgroundColor = 'var(--color-accent-active)';
        }, 500);
    }
});

// ==================== PRICING TOGGLE ====================

pricingToggle?.addEventListener('change', function() {
    const priceCards = document.querySelectorAll('.pricing-card');
    
    priceCards.forEach(card => {
        const monthlyPrice = card.querySelector('.monthly-price');
        const annualPrice = card.querySelector('.annual-price');
        const period = card.querySelector('.period');
        
        if (this.checked) {
            monthlyPrice.style.display = 'none';
            annualPrice.style.display = 'inline';
            period.textContent = '/year';
        } else {
            monthlyPrice.style.display = 'inline';
            annualPrice.style.display = 'none';
            period.textContent = '/month';
        }
    });
});

// ==================== FORM VALIDATION & SUBMISSION ====================

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$|^[\d\s]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Show error for form field
 */
function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);
    
    field.parentElement.classList.add('error');
    errorElement.textContent = message;
}

/**
 * Clear error for form field
 */
function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);
    
    field.parentElement.classList.remove('error');
    errorElement.textContent = '';
}

/**
 * Validate form
 */
function validateForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const dateInput = document.getElementById('date');
    
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
        showFieldError('name', 'nameError', 'Name is required');
        isValid = false;
    } else if (nameInput.value.trim().length < 2) {
        showFieldError('name', 'nameError', 'Name must be at least 2 characters');
        isValid = false;
    } else {
        clearFieldError('name', 'nameError');
    }

    // Validate Email
    if (!emailInput.value.trim()) {
        showFieldError('email', 'emailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showFieldError('email', 'emailError', 'Please enter a valid email');
        isValid = false;
    } else {
        clearFieldError('email', 'emailError');
    }

    // Validate Phone
    if (!phoneInput.value.trim()) {
        showFieldError('phone', 'phoneError', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showFieldError('phone', 'phoneError', 'Please enter a valid phone number');
        isValid = false;
    } else {
        clearFieldError('phone', 'phoneError');
    }

    // Validate Service
    if (!serviceInput.value) {
        showFieldError('service', 'serviceError', 'Please select a service');
        isValid = false;
    } else {
        clearFieldError('service', 'serviceError');
    }

    // Validate Date
    if (!dateInput.value) {
        showFieldError('date', 'dateError', 'Please select a date');
        isValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError('date', 'dateError', 'Please select a future date');
            isValid = false;
        } else {
            clearFieldError('date', 'dateError');
        }
    }

    return isValid;
}

/**
 * Handle form submission
 */
contactForm?.addEventListener('submit', function(e) {
    e.preventDefault();

    if (validateForm()) {
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            message: document.getElementById('message').value
        };

        // Log form data (in production, this would be sent to a server)
        console.log('Form submitted:', formData);

        // Show success toast
        showToast('Thank you! Your booking request has been received. We\'ll contact you soon!', 'success');

        // Reset form
        contactForm.reset();

        // Clear any remaining errors
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

        // Scroll to confirmation message
        setTimeout(() => {
            const contactSection = document.getElementById('contact');
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    } else {
        showToast('Please fix the errors above and try again.', 'error');
    }
});

// ==================== TOAST NOTIFICATIONS ====================

/**
 * Show toast notification
 */
function showToast(message, type = 'success', duration = 3000) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Global toast function
 */
window.showToast = showToast;

// ==================== TESTIMONIALS CAROUSEL ====================

/**
 * Initialize carousel dots
 */
function initCarouselDots() {
    const cards = testimonialsCarousel?.querySelectorAll('.testimonial-card') || [];
    const dotsContainer = carouselDots;

    if (dotsContainer && cards.length > 0) {
        dotsContainer.innerHTML = '';
        
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                currentTestimonialIndex = index;
                updateCarouselPosition();
            });
            dotsContainer.appendChild(dot);
        });
    }
}

/**
 * Update carousel position
 */
function updateCarouselPosition() {
    const carousel = testimonialsCarousel;
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.testimonial-card');
    const dots = carouselDots?.querySelectorAll('.dot') || [];

    // Update carousel position for mobile
    if (window.innerWidth < 768) {
        const scrollLeft = currentTestimonialIndex * (cards[0]?.offsetWidth || 0);
        carousel.scrollLeft = scrollLeft;
    }

    // Update dot indicators
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTestimonialIndex);
    });
}

/**
 * Setup carousel swipe functionality
 */
function setupCarouselSwipe() {
    const carousel = testimonialsCarousel;
    if (!carousel) return;

    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const cards = carousel.querySelectorAll('.testimonial-card');
        if (touchStartX - touchEndX > 50) {
            // Swiped left
            currentTestimonialIndex = Math.min(currentTestimonialIndex + 1, cards.length - 1);
            updateCarouselPosition();
        } else if (touchEndX - touchStartX > 50) {
            // Swiped right
            currentTestimonialIndex = Math.max(currentTestimonialIndex - 1, 0);
            updateCarouselPosition();
        }
    }
}

// ==================== REAL-TIME FORM VALIDATION ====================

/**
 * Setup real-time validation
 */
function setupRealtimeValidation() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const dateInput = document.getElementById('date');

    nameInput?.addEventListener('blur', () => {
        if (nameInput.value.trim().length < 2) {
            showFieldError('name', 'nameError', 'Name must be at least 2 characters');
        } else {
            clearFieldError('name', 'nameError');
        }
    });

    emailInput?.addEventListener('blur', () => {
        if (emailInput.value && !validateEmail(emailInput.value)) {
            showFieldError('email', 'emailError', 'Please enter a valid email');
        } else {
            clearFieldError('email', 'emailError');
        }
    });

    phoneInput?.addEventListener('blur', () => {
        if (phoneInput.value && !validatePhone(phoneInput.value)) {
            showFieldError('phone', 'phoneError', 'Please enter a valid phone number');
        } else {
            clearFieldError('phone', 'phoneError');
        }
    });

    dateInput?.addEventListener('change', () => {
        if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError('date', 'dateError', 'Please select a future date');
            } else {
                clearFieldError('date', 'dateError');
            }
        }
    });
}

// ==================== 3D WASHING MACHINE ANIMATION ====================

/**
 * Initialize 3D washing machine animation using Three.js
 */
function setup3DWashingMachine() {
    const container = document.getElementById('washing-machine-container');
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0F1419);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    renderer.domElement.id = 'washing-machine-canvas';

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xFF6B35, 1, 100);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Set initial color based on theme
    setTimeout(() => {
        const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        if (initialColor) pointLight.color = new THREE.Color(initialColor);
    }, 100);

    // Create washing machine
    const washingMachine = new THREE.Group();
    scene.add(washingMachine);

    // Body (outer casing)
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a2332,
        metalness: 0.3,
        roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    washingMachine.add(body);

    // Front panel (slightly protruding)
    const panelGeometry = new THREE.BoxGeometry(1.4, 1.9, 0.2);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a52,
        metalness: 0.4,
        roughness: 0.5
    });
    const frontPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    frontPanel.position.z = 0.42;
    frontPanel.castShadow = true;
    frontPanel.receiveShadow = true;
    washingMachine.add(frontPanel);

    // Drum (circular opening)
    const drumGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32);
    const drumMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a4a62,
        metalness: 0.7,
        roughness: 0.3
    });
    const drum = new THREE.Mesh(drumGeometry, drumMaterial);
    drum.position.z = 0.52;
    drum.rotation.x = Math.PI / 2;
    drum.castShadow = true;
    drum.receiveShadow = true;
    washingMachine.add(drum);

    // Inner drum (visible through opening)
    const innerDrumGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 32);
    const innerDrumMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a2a42,
        metalness: 0.6,
        roughness: 0.4
    });
    const innerDrum = new THREE.Mesh(innerDrumGeometry, innerDrumMaterial);
    innerDrum.position.z = 0.55;
    innerDrum.rotation.x = Math.PI / 2;
    innerDrum.castShadow = true;
    innerDrum.receiveShadow = true;
    washingMachine.add(innerDrum);

    // Control panel dots
    const dotPositions = [
        { x: -0.4, y: 0.6, label: 'Temp' },
        { x: 0, y: 0.6, label: 'Speed' },
        { x: 0.4, y: 0.6, label: 'Cycle' }
    ];

    const dotsMaterials = [];

    dotPositions.forEach(pos => {
        const dotGeometry = new THREE.CircleGeometry(0.08, 32);
        const dotMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6B35,
            metalness: 0.5,
            roughness: 0.4
        });
        
        setTimeout(() => {
            const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
            if (initialColor) dotMaterial.color = new THREE.Color(initialColor);
        }, 100);

        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(pos.x, pos.y, 0.53);
        dot.castShadow = true;
        dot.receiveShadow = true;
        
        dotsMaterials.push(dotMaterial);
        washingMachine.add(dot);
    });

    // Display screen
    const screenGeometry = new THREE.PlaneGeometry(0.6, 0.3);
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a1a2a,
        metalness: 0.1,
        roughness: 0.8,
        emissive: 0xFF6B35,
        emissiveIntensity: 0.3
    });
    
    setTimeout(() => {
        const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        if (initialColor) screenMaterial.emissive = new THREE.Color(initialColor);
    }, 100);

    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, -0.5, 0.53);
    screen.castShadow = true;
    screen.receiveShadow = true;
    washingMachine.add(screen);

    // Animation variables
    let animationTime = 0;
    let isWashing = true;
    let washCycle = 0;
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    // Mouse tracking for interaction
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotation.y = x * 0.5; // Rotate left/right
        targetRotation.x = -y * 0.5; // Rotate up/down
    });

    container.addEventListener('mouseleave', () => {
        targetRotation.x = 0;
        targetRotation.y = 0;
    });

    // Handle window resize
    function onWindowResize() {
        const newWidth = container.clientWidth || 500;
        const newHeight = container.clientHeight || 400;
        
        if (newWidth > 0 && newHeight > 0) {
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }
    }

    window.addEventListener('resize', onWindowResize);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        animationTime += 0.016; // ~60fps

        // Rotating drum during wash cycle
        if (isWashing) {
            washCycle += 0.02;
            innerDrum.rotation.z = washCycle;

            // Pulsing effect on screen
            const pulse = Math.sin(animationTime * 2) * 0.2 + 0.3;
            screenMaterial.emissiveIntensity = pulse;
        }

        // Smooth rotation interpolation
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

        // Gentle floating rotation + Mouse interaction
        washingMachine.rotation.x = (Math.sin(animationTime * 0.5) * 0.08) + currentRotation.x;
        washingMachine.rotation.y = (Math.sin(animationTime * 0.3) * 0.12) + currentRotation.y;

        // Slight bobbing motion
        washingMachine.position.y = Math.sin(animationTime * 0.8) * 0.1;

        renderer.render(scene, camera);
    }

    animate();

    // Start/stop wash on click
    container.addEventListener('click', () => {
        isWashing = !isWashing;
        if (!isWashing) {
            innerDrum.rotation.z = 0;
            washCycle = 0;
            screenMaterial.emissiveIntensity = 0;
        }
    });

    // Listen for theme changes to update light and material colors
    window.addEventListener('themechange', () => {
        setTimeout(() => {
            const newColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
            if (newColor) {
                const colorObj = new THREE.Color(newColor);
                if (typeof gsap !== 'undefined') {
                    gsap.to(pointLight.color, { r: colorObj.r, g: colorObj.g, b: colorObj.b, duration: 1 });
                    gsap.to(screenMaterial.emissive, { r: colorObj.r, g: colorObj.g, b: colorObj.b, duration: 1 });
                    dotsMaterials.forEach(mat => {
                        gsap.to(mat.color, { r: colorObj.r, g: colorObj.g, b: colorObj.b, duration: 1 });
                    });
                } else {
                    pointLight.color.copy(colorObj);
                    screenMaterial.emissive.copy(colorObj);
                    dotsMaterials.forEach(mat => mat.color.copy(colorObj));
                }
            }
        }, 50);
    });
}

// ==================== 3D BACKGROUND ANIMATIONS ====================

/**
 * Initialize subtle 3D floating shapes in the background across all sections
 */
function setupBackground3DAnimations() {
    if (!window.THREE) return;

    // Create container for background 3D
    const container = document.createElement('div');
    container.id = 'bg-3d-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '-1'; // Behind everything
    container.style.pointerEvents = 'none'; // Ignore clicks
    document.body.insertBefore(container, document.body.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Initial color
    let accentColor = '#FF6B35'; // Default
    setTimeout(() => {
        const computed = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        if (computed) accentColor = computed;
    }, 100);

    const shapes = [];
    const geometry1 = new THREE.SphereGeometry(0.8, 32, 32); // Bubble
    const geometry2 = new THREE.IcosahedronGeometry(0.8, 0); // Geometric
    const geometry3 = new THREE.TorusGeometry(0.6, 0.2, 16, 50); // Ring

    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(accentColor),
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.9, // glass-like look
        thickness: 1.0,
        transparent: true,
        opacity: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    // Create scattered shapes
    for (let i = 0; i < 35; i++) {
        let geometry = geometry1;
        const rand = Math.random();
        if (rand > 0.5) geometry = geometry2;
        if (rand > 0.8) geometry = geometry3;

        const mesh = new THREE.Mesh(geometry, material);
        
        // Random spread
        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = (Math.random() - 0.5) * 50;
        mesh.position.z = (Math.random() - 0.5) * 30 - 10;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Custom animation parameters for each shape
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.015 + 0.005
        };

        scene.add(mesh);
        shapes.push(mesh);
    }

    // Mouse interactivity for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    });

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Listen to theme changes to dynamically update colors of the 3D background
    window.addEventListener('themechange', () => {
        setTimeout(() => {
            const newColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
            if (newColor && window.gsap) {
                const colorObj = new THREE.Color(newColor);
                gsap.to(material.color, {
                    r: colorObj.r,
                    g: colorObj.g,
                    b: colorObj.b,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }
        }, 50);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth parallax camera movement
        targetX = mouseX * 0.002;
        targetY = mouseY * 0.002;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;

        // Animate individual shapes
        shapes.forEach(shape => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;
            
            // Slowly float upwards
            shape.position.y += shape.userData.floatSpeed;

            // Reset position if floats too high
            if (shape.position.y > 25) {
                shape.position.y = -25;
            }
        });

        renderer.render(scene, camera);
    }

    animate();
}

// ==================== 3D TILT EFFECT FOR GLASS CARDS ====================

/**
 * Apply 3D tilt effect to glass cards
 */
function setupCardTilt() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Very subtle magnetic effect - barely noticeable tilt
            const rotateX = (y - centerY) / 100;
            const rotateY = (centerX - x) / 100;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.002)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// ==================== LAZY LOADING ====================

/**
 * Setup lazy loading for images
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ==================== REVEAL ON SCROLL ====================

/**
 * Setup reveal on scroll animation
 */
function setupRevealOnScroll() {
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.service-card, .process-step, .pricing-card, .testimonial-card').forEach(el => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }
}

// ==================== PRICING PLAN SELECTION ====================

/**
 * Setup pricing plan buttons
 */
function setupPricingButtons() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    let selectedPlan = null;

    pricingCards.forEach(card => {
        const button = card.querySelector('button');
        if (!button) return;

        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Get the plan name from the card
            const planName = card.querySelector('h3').textContent;
            selectedPlan = planName;

            // Remove previous selections
            pricingCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to current card
            card.classList.add('selected');

            // Show success toast
            showToast(`${planName} plan selected! Please fill in your details below.`, 'success');

            // Scroll to contact form
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Focus on the first form field
                    const firstInput = contactSection.querySelector('input');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 300);
                    }
                }
            }, 500);

            // Store selected plan for form submission
            window.selectedPricingPlan = planName;
        });
    });
}

// ==================== INITIALIZE ====================

/**
 * Initialize all functionality on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
    setup3DWashingMachine();
    setupBackground3DAnimations(); // Add the new global 3D background animation
    setupRealtimeValidation();
    setupCardTilt();
    setupLazyLoading();
    setupRevealOnScroll();
    setupPricingButtons();
    initCarouselDots();
    setupCarouselSwipe();

    // Smooth scroll for nav links (fallback for browsers without smooth-scroll support)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// ==================== RESIZE HANDLER ====================

/**
 * Handle window resize
 */
window.addEventListener('resize', () => {
    updateCarouselPosition();
});
