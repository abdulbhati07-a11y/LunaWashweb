/* ========================================
   LÜNA WASH - 3D Background Animation
   Washing machines, flying clothes & bubbles
   Theme-color-aware, visible & performant
   ======================================== */

class ThreeBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.scene    = new THREE.Scene();
        this.camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });

        this.objects   = [];   // all animated meshes / groups
        this.materials = [];   // all accent-colored materials
        this.mouse     = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.accentColor = this.getAccentColor();

        this.init();
        this.animate();
        this.setupListeners();
    }

    /* ---- helpers ---- */
    getAccentColor() {
        const raw = getComputedStyle(document.documentElement)
                        .getPropertyValue('--color-accent').trim();
        return raw || '#FF6B35';
    }

    makeMaterial(opacity = 0.15) {
        // Create a color that is a bit darker than the accent color
        const color = new THREE.Color(this.accentColor);
        color.multiplyScalar(0.65); // Darken by 35%

        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity,
            wireframe: true,
            wireframeLinewidth: 1
        });
        this.materials.push(mat);
        return mat;
    }

    rand(min, max) { return Math.random() * (max - min) + min; }

    /* ---- scene setup ---- */
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.camera.position.z = 30;   // closer = bigger apparent size

        this.spawnWashingMachines(7);
        this.spawnShirts(10);
        this.spawnSocks(9);
        this.spawnBubbles(20);
    }

    /* ---- WASHING MACHINE ---- */
    spawnWashingMachines(count) {
        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            // Body
            group.add(new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 2.8, 1.4),
                this.makeMaterial(0.40)
            ));

            // Door ring (torus)
            const door = new THREE.Mesh(
                new THREE.TorusGeometry(0.85, 0.14, 8, 16),
                this.makeMaterial(0.45)
            );
            door.position.z = 0.75;
            group.add(door);

            // Inner drum
            const drum = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.45, 1),
                this.makeMaterial(0.50)
            );
            drum.position.z = 0.75;
            group.add(drum);

            // Top knob
            const knob = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
                this.makeMaterial(0.55)
            );
            knob.position.set(-0.7, 1.5, 0.1);
            group.add(knob);

            this.placeObject(group, 1.4, 2.2);
        }
    }

    /* ---- T-SHIRT ---- */
    spawnShirts(count) {
        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            // Torso
            group.add(new THREE.Mesh(
                new THREE.PlaneGeometry(1.6, 1.9),
                this.makeMaterial(0.40)
            ));

            // Left sleeve
            const sl = new THREE.Mesh(
                new THREE.PlaneGeometry(0.85, 0.65),
                this.makeMaterial(0.55)
            );
            sl.position.set(-1.1, 0.65, 0);
            sl.rotation.z = 0.5;
            group.add(sl);

            // Right sleeve
            const sr = new THREE.Mesh(
                new THREE.PlaneGeometry(0.85, 0.65),
                this.makeMaterial(0.55)
            );
            sr.position.set(1.1, 0.65, 0);
            sr.rotation.z = -0.5;
            group.add(sr);

            // Collar
            const collar = new THREE.Mesh(
                new THREE.TorusGeometry(0.32, 0.08, 6, 12, Math.PI),
                this.makeMaterial(0.65)
            );
            collar.position.set(0, 0.97, 0.01);
            collar.rotation.z = Math.PI;
            group.add(collar);

            this.placeObject(group, 0.8, 1.3);
        }
    }

    /* ---- SOCK ---- */
    spawnSocks(count) {
        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            // Leg tube
            group.add(new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.32, 1.3, 8, 1, true),
                this.makeMaterial(0.40)
            ));

            // Foot
            const foot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.26, 0.28, 0.95, 8, 1, true),
                this.makeMaterial(0.55)
            );
            foot.rotation.z = Math.PI / 2;
            foot.position.set(0.35, -0.7, 0);
            group.add(foot);

            // Toe
            const toe = new THREE.Mesh(
                new THREE.SphereGeometry(0.27, 8, 6, 0, Math.PI),
                this.makeMaterial(0.60)
            );
            toe.rotation.z = Math.PI / 2;
            toe.position.set(0.83, -0.7, 0);
            group.add(toe);

            this.placeObject(group, 0.7, 1.2);
        }
    }

    /* ---- BUBBLES ---- */
    spawnBubbles(count) {
        for (let i = 0; i < count; i++) {
            const r = this.rand(0.2, 0.6);
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(r, 10, 8),
                this.makeMaterial(this.rand(0.20, 0.40))
            );
            this.placeObject(mesh, r * 0.8, r * 1.2);
        }
    }

    /* ---- scatter helper ---- */
    placeObject(obj, scaleMin, scaleMax) {
        const s = this.rand(scaleMin, scaleMax);
        obj.scale.set(s, s, s);

        // spread across full screen, some closer for size variation
        obj.position.set(
            this.rand(-38, 38),
            this.rand(-55, 55),
            this.rand(-18, 2)    // -18 to +2 keeps objects nearer camera
        );

        obj.rotation.set(
            this.rand(0, Math.PI * 2),
            this.rand(0, Math.PI * 2),
            this.rand(0, Math.PI * 2)
        );

        obj.userData = {
            speedY:     this.rand(0.008, 0.025),    // slower float
            speedRotX:  (Math.random() - 0.5) * 0.005,
            speedRotY:  (Math.random() - 0.5) * 0.005,
            speedRotZ:  (Math.random() - 0.5) * 0.003,
            wobbleAmp:  this.rand(0.5, 1.2),
            wobbleFreq: this.rand(0.0002, 0.0005),
            originX:    obj.position.x,
            phase:      this.rand(0, Math.PI * 2)
        };

        this.scene.add(obj);
        this.objects.push(obj);
    }

    /* ---- animation loop ---- */
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const t = Date.now();

        // Smoothly interpolate mouse position
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

        this.objects.forEach(obj => {
            const d = obj.userData;

            obj.position.y += d.speedY;
            
            // Interaction: ATTRACT to mouse instead of just offset
            // Calculate distance to a projected mouse point in 3D space
            const targetX = d.originX + (this.mouse.x * 25);
            const targetY = obj.position.y + (this.mouse.y * 25);
            
            // Move 10% of the way to the "desired" position influenced by mouse
            obj.position.x += (targetX - obj.position.x) * 0.02;
            
            // Rotation also reacts to the direction of interaction
            obj.rotation.x += d.speedRotX + (this.mouse.y * 0.03);
            obj.rotation.y += d.speedRotY + (this.mouse.x * 0.03);
            obj.rotation.z += d.speedRotZ;

            // Reset when drifted off top
            if (obj.position.y > 60) {
                obj.position.y = -60;
                obj.position.x = this.rand(-38, 38);
                d.originX      = obj.position.x;
            }
        });

        // Subtle parallax with scroll
        this.camera.position.y = -(window.scrollY * 0.001);

        this.renderer.render(this.scene, this.camera);
    }

    /* ---- theme color update ---- */
    updateColor() {
        const newHex = this.getAccentColor();
        if (newHex === this.accentColor) return;
        this.accentColor = newHex;
        
        // Target color should also be darkened slightly for the "dark" look
        const target = new THREE.Color(newHex);
        target.multiplyScalar(0.65);

        this.materials.forEach(mat => {
            if (typeof gsap !== 'undefined') {
                gsap.to(mat.color, {
                    r: target.r, g: target.g, b: target.b,
                    duration: 1.2,
                    ease: 'power2.inOut'
                });
            } else {
                mat.color.set(target);
            }
        });
    }

    /* ---- event listeners ---- */
    setupListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('mousemove', (e) => {
            // Normalized mouse coords (-1 to +1)
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        window.addEventListener('themechange', () => {
            setTimeout(() => this.updateColor(), 60);
        });
    }
}

/* ---- bootstrap ---- */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThreeBackground());
} else {
    new ThreeBackground();
}
