/* ========================================
   LÜNA WASH - Theme Switcher
   Handles theme switching and persistence
   ======================================== */

class ThemeSwitcher {
    constructor() {
        this.themes = [
            { id: 'dark', name: 'Dark (Default)', color: '#FF6B35', type: 'dark' },
            { id: 'ocean', name: 'Ocean Blue', color: '#00D9FF', type: 'dark' },
            { id: 'forest', name: 'Forest Green', color: '#4ECB71', type: 'dark' },
            { id: 'sunset', name: 'Sunset', color: '#FF9F43', type: 'dark' },
            { id: 'purple', name: 'Purple', color: '#B366FF', type: 'dark' },
            { id: 'coolGray', name: 'Cool Gray', color: '#7DB8DA', type: 'dark' },
            { id: 'arctic', name: 'Arctic', color: '#00E5FF', type: 'dark' },
            { id: 'coral', name: 'Coral', color: '#FF7A5C', type: 'dark' },
            { id: 'mint', name: 'Mint', color: '#2FCCB8', type: 'dark' },
            { id: 'crimson', name: 'Crimson Red', color: '#FF3366', type: 'dark' },
            { id: 'light', name: 'Light (Default)', color: '#FF6B35', type: 'light' },
            { id: 'rose', name: 'Rose Red', color: '#FF4D6D', type: 'light' },
            { id: 'sky', name: 'Sky Blue', color: '#4DA8DA', type: 'light' }
        ];

        this.storageKey = 'luna-wash-theme';
        this.defaultTheme = 'dark';
        
        this.init();
    }

    init() {
        // Load saved theme or use default
        const savedTheme = this.getSavedTheme();
        this.setTheme(savedTheme);
        
        // Create theme switcher UI
        this.createThemeSwitcher();
        
        // Listen for system preference changes
        this.listenToSystemPreference();
    }

    getSavedTheme() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && this.themes.some(t => t.id === saved)) {
            return saved;
        }
        return this.defaultTheme;
    }

    setTheme(themeId) {
        // Validate theme exists
        if (!this.themes.some(t => t.id === themeId)) {
            console.warn(`Theme "${themeId}" not found, using default`);
            themeId = this.defaultTheme;
        }

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', themeId);
        document.body.setAttribute('data-theme', themeId);

        // Save preference
        localStorage.setItem(this.storageKey, themeId);

        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeId } }));

        // Update UI if theme switcher exists
        this.updateThemeSwitcherUI(themeId);
    }

    createThemeSwitcher() {
        // Create theme switcher container
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.id = 'themeSwitcher';

        // Create theme toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.title = 'Toggle theme menu';
        toggleBtn.innerHTML = '🎨';

        // Create theme menu
        const menu = document.createElement('div');
        menu.className = 'theme-menu';

        const darkGroup = document.createElement('div');
        darkGroup.className = 'theme-group theme-group-dark';
        darkGroup.innerHTML = '<div class="theme-group-title">Dark Themes</div>';
        
        const lightGroup = document.createElement('div');
        lightGroup.className = 'theme-group theme-group-light';
        lightGroup.innerHTML = '<div class="theme-group-title">Light Themes</div>';

        // Add theme options
        this.themes.forEach(theme => {
            const option = document.createElement('button');
            option.className = 'theme-option';
            option.setAttribute('data-theme', theme.id);
            option.title = theme.name;
            option.innerHTML = `<span style="background-color: ${theme.color}"></span> ${theme.name}`;
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.setTheme(theme.id);
                menu.classList.remove('active');
            });

            if (theme.type === 'light') {
                lightGroup.appendChild(option);
            } else {
                darkGroup.appendChild(option);
            }
        });

        menu.appendChild(darkGroup);
        menu.appendChild(lightGroup);

        // Toggle menu visibility
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            menu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                menu.classList.remove('active');
            }
        });

        // Append elements
        switcher.appendChild(toggleBtn);
        switcher.appendChild(menu);

        // Add to navbar (after navbar-auth-buttons)
        const navbar = document.querySelector('.navbar-container');
        if (navbar) {
            // Insert before auth buttons or at the end
            const authButtons = navbar.querySelector('.navbar-auth-buttons');
            if (authButtons) {
                authButtons.parentNode.insertBefore(switcher, authButtons);
            } else {
                navbar.appendChild(switcher);
            }
        } else {
            // Fallback: add to body
            document.body.appendChild(switcher);
        }
    }

    updateThemeSwitcherUI(themeId) {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            if (option.getAttribute('data-theme') === themeId) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    listenToSystemPreference() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            darkModeQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                // Check if the current theme is the default or light
                const currentTheme = this.getSavedTheme();
                
                if (currentTheme === this.defaultTheme || currentTheme === 'light') {
                    // Don't automatically change - let user manually select if desired
                    console.log('System preference changed, but keeping user choice');
                }
            });
        }
    }

    getThemes() {
        return this.themes;
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.defaultTheme;
    }
}

// Initialize theme switcher when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeSwitcher = new ThemeSwitcher();
    });
} else {
    window.themeSwitcher = new ThemeSwitcher();
}
