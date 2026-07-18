// assets/3d-scene.js

class ImmersiveScene {
    constructor() {
        this.container = document.getElementById('webgl-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.002);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.objects = [];
        this.particles = null;
        
        this.clearanceLevel = 'guest'; // Default

        this.init();
    }

    init() {
        this.createLighting();
        this.createParticles();
        this.createJourneyObjects();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Expose method to update visuals based on clearance
        window.updateSceneForClearance = this.updateSceneForClearance.bind(this);

        this.animate();
    }

    createLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xd1567e, 3, 50); // Pinkish (Innovator facet)
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x4a90e2, 3, 50); // Blueish (Scientist facet)
        pointLight2.position.set(-5, -5, -5);
        this.scene.add(pointLight2);
    }

    createParticles() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0xd1567e);
        const color2 = new THREE.Color(0x4a90e2);

        for (let i = 0; i < particleCount; i++) {
            // Spread particles over a long Z distance for the scroll journey
            positions[i * 3] = (Math.random() - 0.5) * 40;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
            positions[i * 3 + 2] = (Math.random() - 1.0) * 100; // z (mostly negative)

            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createJourneyObjects() {
        // Group 1: Identity (Icosahedron / Tech shape)
        const geo1 = new THREE.IcosahedronGeometry(2, 1);
        const mat1 = new THREE.MeshStandardMaterial({ 
            color: 0x4a90e2, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        });
        const obj1 = new THREE.Mesh(geo1, mat1);
        obj1.position.set(3, 0, -10);
        this.scene.add(obj1);
        this.objects.push({ mesh: obj1, speed: 0.005 });

        // Group 2: The Journey (Torus Knot)
        const geo2 = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
        const mat2 = new THREE.MeshStandardMaterial({ 
            color: 0xd1567e, 
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const obj2 = new THREE.Mesh(geo2, mat2);
        obj2.position.set(-3, 1, -25);
        this.scene.add(obj2);
        this.objects.push({ mesh: obj2, speed: 0.008 });

        // Group 3: Projects (Floating Cubes/Nodes)
        const group3 = new THREE.Group();
        const geo3 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mat3 = new THREE.MeshStandardMaterial({ color: 0xe2b94a });
        for(let i=0; i<10; i++) {
            const mesh = new THREE.Mesh(geo3, mat3);
            mesh.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6
            );
            mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
            group3.add(mesh);
        }
        group3.position.set(2, -1, -40);
        this.scene.add(group3);
        this.objects.push({ mesh: group3, speed: 0.002 });
        
        // Group 4: Vision/Philosophy (Large ring)
        const geo4 = new THREE.TorusGeometry(4, 0.1, 16, 100);
        const mat4 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        const obj4 = new THREE.Mesh(geo4, mat4);
        obj4.position.set(0, 0, -55);
        this.scene.add(obj4);
        this.objects.push({ mesh: obj4, speed: 0.01, isRing: true });

        this.setupScrollAnimation();
    }

    setupScrollAnimation() {
        gsap.registerPlugin(ScrollTrigger);

        // Map the entire scroll height to camera Z movement
        gsap.to(this.camera.position, {
            z: -60, // Move deep into the scene
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Smooth scrubbing
            }
        });

        // Add subtle camera rotation along the way
        gsap.to(this.camera.rotation, {
            z: Math.PI / 4,
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 2
            }
        });
    }

    updateSceneForClearance(level) {
        this.clearanceLevel = level;
        if (level === 'professional') {
            // Turn objects to wireframe, change fog color for a "technical" look
            this.scene.fog.color.setHex(0x0a192f);
            this.objects.forEach(obj => {
                if(obj.mesh.material) {
                    obj.mesh.material.wireframe = true;
                    obj.mesh.material.color.setHex(0x64ffda); // Technical green/cyan
                } else if (obj.mesh.children) {
                     obj.mesh.children.forEach(c => {
                         c.material.wireframe = true;
                         c.material.color.setHex(0x64ffda);
                     });
                }
            });
        } else {
            // Guest/Cinematic look
            this.scene.fog.color.setHex(0x050510);
            // Reset colors (simplified for demo)
            if(this.objects[0]) this.objects[0].mesh.material.color.setHex(0x4a90e2);
            if(this.objects[1]) this.objects[1].mesh.material.color.setHex(0xd1567e);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.z += 0.0002;
        }

        // Animate individual objects
        this.objects.forEach(obj => {
            if(obj.isRing) {
                obj.mesh.rotation.x += obj.speed;
                obj.mesh.rotation.y += obj.speed;
            } else {
                obj.mesh.rotation.x += obj.speed;
                obj.mesh.rotation.y += obj.speed;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Ensure the scene doesn't start rendering/calculating heavily until auth is passed,
// or initialize it but keep it hidden. We'll init it on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
    // Only init if WebGL is supported and Three.js is loaded
    if (typeof THREE !== 'undefined') {
        window.thkScene = new ImmersiveScene();
    }
});
