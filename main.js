// This script sets up a basic 3D scene using Three.js,
// including a cube, a ground plane, lights, and orbit controls.

// Ensure Three.js is loaded before attempting to use it.
if (typeof THREE === 'undefined') {
    console.error('Three.js has not been loaded. Check the script tag in index.html.');
} else {
    // Get the container element from the HTML.
    const container = document.getElementById('container');
    const infoDisplay = document.getElementById('infoDisplay'); // Get reference to info display
    const npcMessageDisplay = document.getElementById('npcMessageDisplay'); // Get reference to NPC message display

    // Ensure the container element exists before proceeding.
    if (!container) {
        console.error('Container element #container not found.');
    } else if (!infoDisplay) {
        console.error('Info display element #infoDisplay not found.');
    } else if (!npcMessageDisplay) {
        console.error('NPC message display element #npcMessageDisplay not found.');
    } else {
        // Game state variables
        let npcCharacter; // Holds the Three.js Group for the NPC
        let npcInteracted = false; // Flag to track if the initial NPC interaction has occurred
        let hasPassword = false; // Flag to track if the player has received the password from the NPC

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
        let hasKey = false;

        function updateInfoDisplay() {
            if (infoDisplay) {
                infoDisplay.textContent = `Score: ${score} | Key: ${hasKey ? 'Yes' : 'No'} | Password: ${hasPassword ? '1234' : 'No'}`;
            }
        }
        updateInfoDisplay(); // Initial display update

        // Function to show NPC messages in the npcMessageDisplay div
        // message: The text to display
        // duration: How long the message stays visible in milliseconds
        let npcMessageTimeout; // Variable to store the timeout ID for clearing messages
        function showNpcMessage(message, duration = 3000) {
            if (npcMessageDisplay) {
                npcMessageDisplay.textContent = message;
                npcMessageDisplay.style.display = 'block'; // Make the message area visible

                // Clear any existing timeout to prevent the message from disappearing prematurely if called again quickly
                if (npcMessageTimeout) {
                    clearTimeout(npcMessageTimeout);
                }

                // Set a timeout to clear the message and hide the display area
                npcMessageTimeout = setTimeout(() => {
                    npcMessageDisplay.textContent = '';
                    npcMessageDisplay.style.display = 'none'; // Hide the message area
                    npcMessageTimeout = null; // Reset timeout ID
                }, duration);
            }
        }


        // Function to create the Non-Player Character (NPC)
        // The NPC is a purple sphere that provides guidance to the player.
        function createNPC() {
            const npcGroup = new THREE.Group(); // Use a group to potentially add more parts later

            // NPC Body (purple sphere)
            const npcBodyRadius = 0.5;
            const npcBodyGeometry = new THREE.SphereGeometry(npcBodyRadius, 32, 32);
            const npcBodyMaterial = new THREE.MeshPhongMaterial({ color: 0x800080 }); // Purple color
            const npcBody = new THREE.Mesh(npcBodyGeometry, npcBodyMaterial);
            npcBody.position.y = npcBodyRadius; // Position body so its base is at the group's origin
            npcGroup.add(npcBody);

            // Position the NPC on the ground plane at a specific location
            npcGroup.position.set(-2, ground.position.y, -2);
            npcGroup.name = "npcCharacter"; // Name the NPC object for potential reference
            scene.add(npcGroup); // Add the NPC to the main scene
            return npcGroup; // Return the NPC object
        }

        // Create and add the NPC to the scene during initialization
        npcCharacter = createNPC();

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
                    hasKey = true;
                    if (goalFlag) {
                        goalFlag.material.color.setHex(0x00ff00); // Change goal to green
                    }
                    updateInfoDisplay();
                }
            }

            // Check for win condition: Player must be near the goal, have the key, and have the password.
            if (!gameWon && character && goalFlag) { // Only check if game isn't already won and objects exist
                const distanceToGoal = character.position.distanceTo(goalFlag.position);
                if (distanceToGoal < 1.0) { // Player is close enough to the goal
                    if (hasKey && hasPassword) { // Player has both items needed to win
                        showNpcMessage("Congratulations! You used the key and the code to win!", 5000);
                        gameWon = true; // Set the game as won
                        // Future enhancement: Consider removing the goal or changing its appearance further.
                    } else if (hasKey && !hasPassword) { // Player has the key but not the password
                        showNpcMessage("You have the key, but you need the password from the NPC!", 2000);
                    } else if (!hasKey) { // Player does not have the key (and by extension, likely not the password either)
                        showNpcMessage("You need to find the key first!", 2000);
                    }
                }
            }

            // NPC Interaction Logic: Handles dialogues when the player is near the NPC.
            if (npcCharacter && character && !gameWon) { // Only allow NPC interaction if game is not won
                const distanceToNPC = character.position.distanceTo(npcCharacter.position);
                if (distanceToNPC < 1.5) { // Player is close enough to the NPC
                    if (!npcInteracted && !hasKey) {
                        // Initial interaction: Player doesn't have the key yet.
                        showNpcMessage("NPC: Hello adventurer! Find the golden key first, then return to me.");
                        npcInteracted = true; // Mark that the initial interaction has occurred.
                    } else if (hasKey && !hasPassword) {
                        // Second interaction: Player has the key but not the password.
                        showNpcMessage("NPC: Well done! Your code is '1234'. Use it at the goal!");
                        hasPassword = true; // Grant the password.
                        updateInfoDisplay(); // Update the info display to show password status.
                    }
                    // If npcInteracted is true and player still doesn't have the key, NPC says nothing more.
                    // If player has both key and password, NPC interaction block is effectively skipped or has no new message.
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
