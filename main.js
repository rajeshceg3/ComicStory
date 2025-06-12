// Ensure Three.js is loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js has not been loaded. Check the script tag in index.html.');
} else {
    // Get the container element
    const container = document.getElementById('container');

    if (!container) {
        console.error('Container element #container not found.');
    } else {
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Sky blue background

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Geometry and Material for a Cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Green color, requires light
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Ambient Light (to illuminate the phong material)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        // Directional Light (to give some shadows and highlights)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);


        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Rotate the cube
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        // Start animation
        animate();
    }
}
