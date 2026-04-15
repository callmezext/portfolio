/* ============================================ */
/*  Three.js Immersive 3D Background Scene      */
/*  Features:                                    */
/*  - Particle galaxy system                     */
/*  - Floating geometric shapes                  */
/*  - Mouse-reactive parallax                    */
/*  - Dynamic color shifting                     */
/*  - Connecting lines between particles         */
/*  - Morphing geometries                        */
/* ============================================ */

(function () {
    'use strict';

    // ---- Configuration ----
    const CONFIG = {
        particleCount: 1800,
        galaxyBranches: 5,
        galaxyRadius: 12,
        galaxySpin: 1.2,
        particleSize: 0.025,
        floatingShapesCount: 15,
        connectionDistance: 2.5,
        maxConnections: 80,
        mouseInfluence: 0.0003,
        colors: {
            primary: new THREE.Color(0x6C63FF),
            secondary: new THREE.Color(0x00D4AA),
            accent: new THREE.Color(0xFF6B9D),
            deep: new THREE.Color(0x1a0a3e),
        }
    };

    // ---- Scene Setup ----
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);

    // ---- Mouse Tracking ----
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ---- Galaxy Particle System ----
    function createGalaxy() {
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const colors = new Float32Array(CONFIG.particleCount * 3);
        const scales = new Float32Array(CONFIG.particleCount);
        const randomness = new Float32Array(CONFIG.particleCount * 3);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            const radius = Math.random() * CONFIG.galaxyRadius;
            const branchAngle = (i % CONFIG.galaxyBranches) / CONFIG.galaxyBranches * Math.PI * 2;
            const spinAngle = radius * CONFIG.galaxySpin;

            // Randomness
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 1.5;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            randomness[i3] = randomX;
            randomness[i3 + 1] = randomY;
            randomness[i3 + 2] = randomZ;

            // Color - gradient from primary to secondary based on radius
            const mixRatio = radius / CONFIG.galaxyRadius;
            const color = CONFIG.colors.primary.clone().lerp(CONFIG.colors.secondary, mixRatio);

            // Add accent color to some particles
            if (Math.random() > 0.85) {
                color.lerp(CONFIG.colors.accent, 0.6);
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            scales[i] = Math.random() * 2 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

        // Custom shader material for glowing particles
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float aScale;
                varying vec3 vColor;
                varying float vDistance;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vDistance = -mvPosition.z;
                    gl_PointSize = aScale * ${CONFIG.particleSize} * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vDistance;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float glow = 1.0 - dist * 2.0;
                    glow = pow(glow, 2.0);
                    
                    float fog = smoothstep(20.0, 5.0, vDistance);
                    
                    gl_FragColor = vec4(vColor, glow * fog * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        return { points, positions, randomness, geometry };
    }

    const galaxy = createGalaxy();

    // ---- Floating Geometric Shapes ----
    const floatingShapes = [];

    function createFloatingShapes() {
        const geometries = [
            new THREE.IcosahedronGeometry(0.3, 0),
            new THREE.OctahedronGeometry(0.25, 0),
            new THREE.TetrahedronGeometry(0.3, 0),
            new THREE.TorusGeometry(0.2, 0.08, 8, 16),
            new THREE.TorusKnotGeometry(0.2, 0.06, 64, 8, 2, 3),
            new THREE.DodecahedronGeometry(0.25, 0),
        ];

        for (let i = 0; i < CONFIG.floatingShapesCount; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];

            // Wireframe material with glow
            const material = new THREE.MeshBasicMaterial({
                color: [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.accent][i % 3],
                wireframe: true,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.15,
            });

            const mesh = new THREE.Mesh(geo, material);

            // Random position in a sphere around the scene
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 4 + Math.random() * 10;

            mesh.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                (Math.random() - 0.5) * 6,
                r * Math.sin(phi) * Math.sin(theta)
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            scene.add(mesh);

            floatingShapes.push({
                mesh,
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.01,
                },
                floatSpeed: 0.3 + Math.random() * 0.5,
                floatAmplitude: 0.3 + Math.random() * 0.5,
                originalY: mesh.position.y,
                orbitSpeed: (Math.random() - 0.5) * 0.1,
                orbitRadius: r,
                orbitAngle: theta,
            });
        }
    }

    createFloatingShapes();

    // ---- Central Glowing Orb ----
    function createCentralOrb() {
        const group = new THREE.Group();

        // Core sphere
        const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.primary,
            transparent: true,
            opacity: 0.15,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        // Outer glow rings
        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(0.7 + i * 0.4, 0.015, 16, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.accent][i],
                transparent: true,
                opacity: 0.1 - i * 0.025,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2 + (i - 1) * 0.3;
            ring.rotation.y = i * 0.5;
            group.add(ring);
        }

        // Wireframe sphere
        const wireGeo = new THREE.IcosahedronGeometry(1.0, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.secondary,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
        });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        group.add(wire);

        group.position.set(0, 0, 0);
        scene.add(group);

        return group;
    }

    const centralOrb = createCentralOrb();

    // ---- Connecting Lines ----
    const linesMaterial = new THREE.LineBasicMaterial({
        color: CONFIG.colors.primary,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
    });

    let linesGeometry = new THREE.BufferGeometry();
    let linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    function updateConnections() {
        const pos = galaxy.geometry.attributes.position.array;
        const linePositions = [];
        let connectionCount = 0;

        // Only check a subset for performance
        const step = Math.max(1, Math.floor(CONFIG.particleCount / 200));

        for (let i = 0; i < CONFIG.particleCount && connectionCount < CONFIG.maxConnections; i += step) {
            const i3 = i * 3;
            const x1 = pos[i3], y1 = pos[i3 + 1], z1 = pos[i3 + 2];

            for (let j = i + step; j < CONFIG.particleCount && connectionCount < CONFIG.maxConnections; j += step) {
                const j3 = j * 3;
                const dx = x1 - pos[j3];
                const dy = y1 - pos[j3 + 1];
                const dz = z1 - pos[j3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONFIG.connectionDistance) {
                    linePositions.push(x1, y1, z1, pos[j3], pos[j3 + 1], pos[j3 + 2]);
                    connectionCount++;
                }
            }
        }

        if (linePositions.length > 0) {
            linesGeometry.dispose();
            linesGeometry = new THREE.BufferGeometry();
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            linesMesh.geometry = linesGeometry;
        }
    }

    // ---- Ambient Light Particles ----
    function createAmbientParticles() {
        const count = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;

            const color = [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.accent][Math.floor(Math.random() * 3)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        return particles;
    }

    const ambientParticles = createAmbientParticles();

    // ---- Scroll-Based Effects ----
    let scrollProgress = 0;

    window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = window.scrollY / docHeight;
    });

    // ---- Animation Loop ----
    const clock = new THREE.Clock();
    let frame = 0;

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const delta = clock.getDelta();
        frame++;

        // Smooth mouse
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // ---- Galaxy Rotation ----
        galaxy.points.rotation.y = elapsedTime * 0.05;
        galaxy.points.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

        // Mouse influence on galaxy
        galaxy.points.rotation.y += mouse.x * 0.3;
        galaxy.points.rotation.x += mouse.y * 0.15;

        // ---- Floating Shapes Animation ----
        floatingShapes.forEach((shape, i) => {
            // Rotation
            shape.mesh.rotation.x += shape.rotSpeed.x;
            shape.mesh.rotation.y += shape.rotSpeed.y;
            shape.mesh.rotation.z += shape.rotSpeed.z;

            // Floating motion
            shape.mesh.position.y = shape.originalY + Math.sin(elapsedTime * shape.floatSpeed + i) * shape.floatAmplitude;

            // Slow orbit
            shape.orbitAngle += shape.orbitSpeed * 0.005;
            shape.mesh.position.x = Math.cos(shape.orbitAngle) * shape.orbitRadius;
            shape.mesh.position.z = Math.sin(shape.orbitAngle) * shape.orbitRadius;

            // Visual pulse
            const pulse = Math.sin(elapsedTime * 0.5 + i * 0.7) * 0.05 + 0.15;
            shape.mesh.material.opacity = pulse;

            // Mouse reactivity
            shape.mesh.rotation.x += mouse.x * 0.002;
            shape.mesh.rotation.y += mouse.y * 0.002;
        });

        // ---- Central Orb Animation ----
        centralOrb.rotation.y = elapsedTime * 0.2;
        centralOrb.rotation.z = Math.sin(elapsedTime * 0.3) * 0.2;

        // Pulse effect
        const orbScale = 1 + Math.sin(elapsedTime * 0.8) * 0.08;
        centralOrb.scale.set(orbScale, orbScale, orbScale);

        // Ring rotations
        centralOrb.children.forEach((child, i) => {
            if (i > 0 && i <= 3) {
                child.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
                child.rotation.z += 0.002 * (i % 2 === 0 ? -1 : 1);
            }
            if (i === 4) {
                child.rotation.x += 0.002;
                child.rotation.y += 0.003;
            }
        });

        // Mouse influence on orb
        centralOrb.position.x = mouse.x * 0.5;
        centralOrb.position.y = mouse.y * 0.3;

        // ---- Ambient Particles ----
        ambientParticles.rotation.y = elapsedTime * 0.01;
        ambientParticles.rotation.x = Math.sin(elapsedTime * 0.005) * 0.02;

        // ---- Camera ----
        // Parallax camera with scroll
        const cameraY = 2 - scrollProgress * 4;
        const cameraZ = 8 - scrollProgress * 2;

        camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
        camera.position.y += (cameraY + mouse.y * 0.8 - camera.position.y) * 0.02;
        camera.position.z += (cameraZ - camera.position.z) * 0.02;
        camera.lookAt(0, 0, 0);

        // ---- Update connections periodically ----
        if (frame % 60 === 0) {
            updateConnections();
        }

        // ---- Dynamic color shift based on scroll ----
        const hue = (scrollProgress * 0.3 + elapsedTime * 0.02) % 1;
        const dynamicColor = new THREE.Color().setHSL(hue, 0.8, 0.5);
        linesMaterial.color = dynamicColor;

        // ---- Render ----
        renderer.render(scene, camera);
    }

    // Start animation
    animate();
    updateConnections();

    // ---- Resize Handler ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // ---- Expose for external use ----
    window.threeScene = { scene, camera, renderer, galaxy, centralOrb };

})();
