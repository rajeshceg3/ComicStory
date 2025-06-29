// This script sets up a basic 3D scene using Three.js,
// including a cube, a ground plane, lights, and orbit controls.

// Ensure Three.js is loaded before attempting to use it.
if (typeof THREE === 'undefined') {
    console.error('Three.js has not been loaded. Check the script tag in index.html.');
} else {
    // Get the container element from the HTML.
    const container = document.getElementById('container');
    const infoDisplay = document.getElementById('infoDisplay'); // Get reference to info display

    // Ensure the container element exists before proceeding.
    if (!container) {
        console.error('Container element #container not found.');
    } else if (!infoDisplay) {
        console.error('Info display element #infoDisplay not found.');
    } else {
        // Scene setup: The scene is the container for all 3D objects.
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Sky blue background

        // Camera setup: Defines the perspective from which the scene is viewed.
        // PerspectiveCamera(fov, aspect, near, far)
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5; // Position the camera further back to see the objects.

        // Renderer setup: Responsible for drawing the scene onto the HTML canvas.
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to window size.
        container.appendChild(renderer.domElement); // Add the renderer's canvas to the container.

        // Check if OrbitControls was loaded
        if (typeof THREE.OrbitControls === 'function') {
            console.log('THREE.OrbitControls is loaded.');
        } else {
            console.error('THREE.OrbitControls is NOT loaded. Check script inclusion in index.html.');
        }

        // OrbitControls setup: Allows camera manipulation (orbit, zoom, pan) with mouse/touch.
        const controls = new THREE.OrbitControls(camera, renderer.domElement);

        // Cube: A basic 3D box shape.
        // BoxGeometry(width, height, depth)
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); // Standard 1x1x1 cube.
        // MeshPhongMaterial: A material for shiny surfaces, reacts to light.
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red color for the cube.
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        scene.add(cube); // Add the cube to the scene.

        // Ground Plane: A flat surface below the cube.
        // PlaneGeometry(width, height)
        const groundGeometry = new THREE.PlaneGeometry(10, 10); // 10x10 units in size.
        // MeshPhongMaterial for the ground as well, so it reacts to light.
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc }); // Light gray color.
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -1.5; // Position it 1.5 units below the origin.
        ground.rotation.x = -Math.PI / 2; // Rotate it to be horizontal (flat).
        scene.add(ground); // Add the ground to the scene.

        // Goal Flag: A red cone representing the goal.
        // ConeGeometry(radius, height, radialSegments)
        const goalGeometry = new THREE.ConeGeometry(0.5, 1, 16); // Radius 0.5, Height 1, 16 segments
        const goalMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red color for the flag
        const goalFlag = new THREE.Mesh(goalGeometry, goalMaterial);
        goalFlag.name = "goalFlag"; // Name the object
        goalFlag.position.set(0, 0.5, -5); // Position it in front of the character
        scene.add(goalFlag); // Add the goal flag to the scene.

        // Lighting: Essential for MeshPhongMaterial to be visible.

        // AmbientLight: Provides a soft, diffuse light that illuminates all objects in the scene equally.
        // AmbientLight(color, intensity)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light with 50% intensity.
        scene.add(ambientLight);

        // DirectionalLight: Emits light in a specific direction, creating shadows and highlights.
        // DirectionalLight(color, intensity)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // White light with 50% intensity.
        directionalLight.position.set(5, 5, 5); // Position the light source.
        scene.add(directionalLight);

        // PointLight: Emits light from a single point in all directions.
        // PointLight(color, intensity, distance)
        const pointLight = new THREE.PointLight(0xffffff, 1, 10); // Bright white light, intensity 1, affects objects up to 10 units away.
        pointLight.position.set(2, 2, 2); // Position the light source.
        scene.add(pointLight);

        // Function to create the character
        function createCharacter() {
            const character = new THREE.Group();

            // Body
            const bodyRadius = 0.5;
            const bodyGeometry = new THREE.SphereGeometry(bodyRadius, 32, 32);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff }); // Blue body
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = bodyRadius; // Position body so its base is at the group's origin
            character.add(body);

            // Head
            const headRadius = 0.3;
            const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc00 }); // Yellow head
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.name = "characterHead"; // Assign a name to the head
            head.userData.initialY = bodyRadius * 2 + headRadius; // Store initial Y position
            head.position.y = head.userData.initialY; // Position head on top of the body
            character.add(head);

            return character;
        }

        // Create and add the character to the scene
        const character = createCharacter();
        // The character group's origin is at the base of the body.
        // The ground is at y = -1.5.
        // So, set the character's y position to the ground's y position.
        character.position.y = ground.position.y;
        scene.add(character);

        // Collectible Item: A TorusKnot that can be collected.
        // TorusKnotGeometry(radius, tube, tubularSegments, radialSegments)
        const collectibleGeometry = new THREE.TorusKnotGeometry(0.3, 0.1, 100, 16);
        const collectibleMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 }); // Gold color
        let collectibleItem = new THREE.Mesh(collectibleGeometry, collectibleMaterial); // Changed to let
        collectibleItem.name = "collectible"; // Name the object
        collectibleItem.position.set(2, 0.5, -2); // Position it on the ground plane, adjust y based on ground and item size
        scene.add(collectibleItem); // Add the collectible item to the scene.

        let animationTime = 0; // Time variable for animation
        let gameWon = false; // Flag to track if the game has been won
        let score = 0; // Initialize score

        // Animation loop: Called repeatedly to update the scene and render it.
        function animate() {
            requestAnimationFrame(animate); // Request the next frame for smooth animation.

            animationTime += 0.05; // Increment time for animation

            // Animate the cube by rotating it slightly each frame.
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            // Animate the collectible item
            if (collectibleItem) {
                collectibleItem.rotation.y += 0.02;
            }

            // Bob the character's head
            const characterHead = character.getObjectByName("characterHead");
            if (characterHead) {
                const bobAmplitude = 0.05; // How much the head bobs
                characterHead.position.y = characterHead.userData.initialY + Math.sin(animationTime) * bobAmplitude;
            }

            // Check for collectible item collision
            if (collectibleItem && character) { // Ensure both character and collectibleItem exist
                const distanceToCollectible = character.position.distanceTo(collectibleItem.position);
                if (distanceToCollectible < 1.0) { // Threshold of 1 unit
                    scene.remove(collectibleItem);
                    collectibleItem = null; // Set to null to prevent further checks and allow garbage collection
                    score++;
                    infoDisplay.textContent = "Score: " + score;
                }
            }

            // Check for win condition
            if (!gameWon && character && goalFlag) {
                const distanceToGoal = character.position.distanceTo(goalFlag.position);
                if (distanceToGoal < 1.0) { // Threshold of 1 unit
                    alert("You reached the flag!");
                    gameWon = true;
                }
            }

            // Update OrbitControls: Necessary if controls.enableDamping or controls.autoRotate are set.
            // Also good practice to include for other potential updates.
            if (controls && typeof controls.update === 'function') {
                controls.update();
            }

            // Render the scene from the perspective of the camera.
            renderer.render(scene, camera);
        }

        // Handle window resize: Adjusts camera aspect ratio and renderer size when the window is resized.
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio.
            camera.updateProjectionMatrix(); // Apply the new aspect ratio.
            renderer.setSize(window.innerWidth, window.innerHeight); // Resize the renderer.
        }, false);

        // Event listener for keyboard input
        document.addEventListener('keydown', (event) => {
            const speed = 0.1;
            const boundary = 4.5;

            if (event.key === 'w' || event.key === 'W') {
                character.position.z -= speed; // Move character forward
            } else if (event.key === 'a' || event.key === 'A') {
                character.position.x -= speed; // Move character left
            } else if (event.key === 's' || event.key === 'S') {
                character.position.z += speed; // Move character backward
            } else if (event.key === 'd' || event.key === 'D') {
                character.position.x += speed; // Move character right
            }

            // Ensure the character stays within the ground plane boundaries
            character.position.x = Math.max(-boundary, Math.min(boundary, character.position.x));
            character.position.z = Math.max(-boundary, Math.min(boundary, character.position.z));
        });

        // Start the animation loop.
        animate();
    }
}
