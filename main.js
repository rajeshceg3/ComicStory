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
        let robotCharacter; // Holds the Three.js Group for the Robot
        let npcInteracted = false; // Flag to track if the initial NPC interaction has occurred
        let hasPassword = false; // Flag to track if the player has received the password from the NPC
        let robotHasTeddyBear = false; // Flag to track if the robot has received the teddy bear

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

        // Party Gate: A wider cone representing the goal.
        // ConeGeometry(radius, height, radialSegments)
        const partyGateHeight = 1.5;
        const partyGateRadius = 1;
        const partyGateGeometry = new THREE.ConeGeometry(partyGateRadius, partyGateHeight, 16);
        const partyGateMaterial = new THREE.MeshPhongMaterial({ color: 0x6082B6 }); // Muted blue (SlateGray-ish)
        const partyGate = new THREE.Mesh(partyGateGeometry, partyGateMaterial);
        partyGate.name = "partyGate"; // Name the object
        partyGate.position.set(0, partyGateHeight / 2, -5); // Position it so its base is on the ground
        scene.add(partyGate); // Add the party gate to the scene.

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
            const bodyWidth = 0.6;
            const bodyHeight = 0.8;
            const bodyDepth = 0.4;
            const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xadd8e6 }); // Light blue body
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = bodyHeight / 2; // Position body so its base is at the group's origin
            character.add(body);

            // Head
            const headSize = 0.4;
            const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize);
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffd580 }); // Light orange head
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.name = "characterHead"; // Assign a name to the head
            // Position head on top of the body
            // Body's top is at bodyHeight. Head's center will be bodyHeight + headSize / 2.
            head.userData.initialY = bodyHeight + (headSize / 2);
            head.position.y = head.userData.initialY;
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

        // Function to create the Teddy Bear
        function createTeddyBear() {
            const teddyBear = new THREE.Group();
            const brown = 0x8B4513; // SaddleBrown

            // Body
            const bodyRadius = 0.3;
            const bodyGeometry = new THREE.SphereGeometry(bodyRadius, 16, 16);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: brown });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = bodyRadius; // Base of body at y=0 in local group
            teddyBear.add(body);

            // Head
            const headRadius = 0.2;
            const headGeometry = new THREE.SphereGeometry(headRadius, 16, 16);
            const headMaterial = new THREE.MeshPhongMaterial({ color: brown });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = bodyRadius * 2 + headRadius; // Position on top of body
            teddyBear.add(head);

            // Ears
            const earRadius = 0.08; // Smaller ears
            const earGeometry = new THREE.SphereGeometry(earRadius, 12, 12);
            const earMaterial = new THREE.MeshPhongMaterial({ color: brown });

            const leftEar = new THREE.Mesh(earGeometry, earMaterial);
            leftEar.position.set(-headRadius * 0.7, head.position.y + headRadius * 0.7, 0); // Position on head
            teddyBear.add(leftEar);

            const rightEar = new THREE.Mesh(earGeometry, earMaterial);
            rightEar.position.set(headRadius * 0.7, head.position.y + headRadius * 0.7, 0); // Position on head
            teddyBear.add(rightEar);

            // Paws (optional, simple spheres)
            const pawRadius = 0.1;
            const pawGeometry = new THREE.SphereGeometry(pawRadius, 8, 8);
            const pawMaterial = new THREE.MeshPhongMaterial({color: brown });

            const leftPaw = new THREE.Mesh(pawGeometry, pawMaterial);
            leftPaw.position.set(-bodyRadius * 0.8, bodyRadius * 0.8, bodyRadius * 0.5);
            teddyBear.add(leftPaw);

            const rightPaw = new THREE.Mesh(pawGeometry, pawMaterial);
            rightPaw.position.set(bodyRadius * 0.8, bodyRadius * 0.8, bodyRadius * 0.5);
            teddyBear.add(rightPaw);


            return teddyBear;
        }

        // Collectible Item: A Lost Teddy Bear
        let collectibleItem = createTeddyBear();
        collectibleItem.name = "collectible"; // Name the object
        // Adjust y position so the base of the teddy bear (bodyRadius above its local origin) sits on the ground.
        // Ground is at -1.5. Teddy bear's local origin needs to be at ground.position.y + its lowest point (which is 0 for the group origin)
        // The teddy bear's lowest point is its origin because body.position.y = bodyRadius.
        // So we want the group's origin to be slightly above the ground if the teddy's base is at y=0 in local.
        // Let's aim to have the *base* of the teddy (bottom of body sphere) at y = ground.position.y + ~0.1 for visual clearance
        // The teddy bear group's origin is at the base of the body sphere. So set y to ground.position.y + bodyRadius
        // collectibleItem.position.set(2, ground.position.y + 0.3, -2); // old calculation for TorusKnot was 0.5
        collectibleItem.position.set(2, ground.position.y + 0.3, -2); // Body radius is 0.3

        scene.add(collectibleItem); // Add the collectible item to the scene.

        let animationTime = 0; // Time variable for animation
        let gameWon = false; // Flag to track if the game has been won
        let score = 0; // Initialize score
        let hasTeddyBear = false; // Renamed from hasKey

        function updateInfoDisplay() {
            if (infoDisplay) {
                infoDisplay.textContent = `Score: ${score} | Player Has Teddy: ${hasTeddyBear ? 'Yes' : 'No'} | Robot Has Teddy: ${robotHasTeddyBear ? 'Yes' : 'No'} | Code: ${hasPassword ? '1234' : 'No'}`;
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


        // Function to create the Non-Player Character (NPC) - Wise Old Tree
        function createNPC() {
            const npcGroup = new THREE.Group();

            // Trunk
            const trunkHeight = 1.2;
            const trunkRadiusTop = 0.3;
            const trunkRadiusBottom = 0.4;
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 16);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // SaddleBrown
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = trunkHeight / 2; // Position trunk so its base is at y=0 for the group
            npcGroup.add(trunk);

            // Foliage
            const foliageRadius = 0.8;
            const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 32, 32);
            const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // ForestGreen
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            // Position foliage on top of the trunk
            foliage.position.y = trunkHeight + foliageRadius * 0.8; // Adjust foliage to sit nicely on trunk
            npcGroup.add(foliage);

            // Position the NPC on the ground plane at a specific location
            // The group's origin is at the base of the trunk.
            npcGroup.position.set(-2, ground.position.y, -2); // ground.position.y places the base of the trunk on the ground
            npcGroup.name = "npcCharacter"; // Name the NPC object for potential reference
            scene.add(npcGroup); // Add the NPC to the main scene
            return npcGroup; // Return the NPC object
        }

        // Function to create the Robot Character
        function createRobotCharacter() {
            const robotGroup = new THREE.Group();
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa }); // Metallic gray
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc }); // Lighter gray
            const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 }); // Yellow eyes

            // Body
            const bodyWidth = 0.5;
            const bodyHeight = 0.7;
            const bodyDepth = 0.3;
            const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
            const robotBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
            robotBody.position.y = bodyHeight / 2; // Position body so its base is at the group's origin
            robotGroup.add(robotBody);

            // Head
            const headSize = 0.3;
            const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize);
            const robotHead = new THREE.Mesh(headGeometry, headMaterial);
            // Position head on top of the body
            robotHead.position.y = bodyHeight + (headSize / 2);
            robotGroup.add(robotHead);

            // Eyes
            const eyeRadius = 0.05;
            const eyeGeometry = new THREE.SphereGeometry(eyeRadius, 8, 8);

            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            // Position eyes on the front of the head
            // Head center is at (0, bodyHeight + headSize / 2, 0) locally to the group
            // Eyes should be forward (positive Z), and spread apart (X)
            leftEye.position.set(-headSize / 4, bodyHeight + headSize / 2, headSize / 2);
            robotGroup.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(headSize / 4, bodyHeight + headSize / 2, headSize / 2);
            robotGroup.add(rightEye);

            robotGroup.name = "robotCharacter";
            return robotGroup;
        }

        // Create and add the NPC to the scene during initialization
        npcCharacter = createNPC();

        // Create, position, and add the Robot Character to the scene
        robotCharacter = createRobotCharacter();
        robotCharacter.position.set(3, ground.position.y, 1); // Position on the ground
        scene.add(robotCharacter);

        // Function to create environment props (trees and rocks)
        function createEnvironmentProps() {
            // Trees
            const treePositions = [
                { x: -3, z: 2 },
                { x: 3.5, z: -1 },
                { x: 1, z: 3 }
            ];
            const trunkHeight = 1;
            const foliageRadius = 0.5;
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
            const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x2E8B57 }); // SeaGreen

            treePositions.forEach(pos => {
                const tree = new THREE.Group();

                const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, trunkHeight, 12);
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = trunkHeight / 2; // Base of trunk at group origin y=0
                tree.add(trunk);

                const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 16, 16);
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = trunkHeight + foliageRadius; // Foliage on top of trunk
                tree.add(foliage);

                tree.position.set(pos.x, ground.position.y, pos.z); // Place base of tree on the ground
                scene.add(tree);
            });

            // Rocks
            const rockRadius = 0.4;
            const rockPositions = [
                { x: 2, y: ground.position.y + rockRadius, z: 1.5 },
                { x: -1.5, y: ground.position.y + rockRadius, z: -3.5 }
            ];
            const rockGeometry = new THREE.DodecahedronGeometry(rockRadius, 0);
            const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Grey

            rockPositions.forEach(pos => {
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.position.set(pos.x, pos.y, pos.z);
                scene.add(rock);
            });
        }

        // Add environment props to the scene
        createEnvironmentProps();

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
                    hasTeddyBear = true; // Renamed from hasKey
                    // Gate color change is now handled when robot gets the teddy bear
                    updateInfoDisplay();
                }
            }

            // Robot Interaction Logic: Give teddy bear to robot
            if (robotCharacter && character && hasTeddyBear && !robotHasTeddyBear) {
                const distanceToRobot = character.position.distanceTo(robotCharacter.position);
                if (distanceToRobot < 1.0) { // Player is close enough to the robot
                    robotHasTeddyBear = true;
                    hasPassword = true; // Robot gives the password
                    showNpcMessage("Robot: Oh, my teddy! Thank you! The password for the party is '1234'.", 4000);

                    if (partyGate) { // Check if partyGate exists
                        partyGate.material.color.setHex(0x00ff00); // Change gate to green
                    }
                    updateInfoDisplay();
                    // Player should no longer "have" the teddy bear in their inventory for other interactions
                    // hasTeddyBear = false; // This line is commented out as per discussion to allow win condition with player still "knowing" they helped with teddy.
                                        // If hasTeddyBear is set to false, the win condition needs adjustment.
                                        // For now, player "keeps" teddy status, implying they completed that task.
                }
            }

            // Check for win condition: Player must be near the party gate, have the teddy bear, and have the password.
            if (!gameWon && character && partyGate) { // Only check if game isn't already won and objects exist
                const distanceToGoal = character.position.distanceTo(partyGate.position);
                if (distanceToGoal < 1.0) { // Player is close enough to the gate
                    if (hasTeddyBear && hasPassword) { // Player has both items needed to win
                        showNpcMessage("Hooray! You opened the party gate with the code! Time to celebrate!", 5000);
                        gameWon = true; // Set the game as won
                        // Future enhancement: Consider removing the gate or changing its appearance further.
                    } else if (hasTeddyBear && !hasPassword) { // Player has the teddy bear but not the password
                        showNpcMessage("You've helped with the teddy bear, but you still need the password for the gate. Did the robot tell you what it is?", 2000);
                    } else if (!hasTeddyBear) { // Player does not have the teddy bear
                        showNpcMessage("You need the teddy bear and a password to open this gate!", 2000);
                    }
                }
            }

            // Animate Robot if it exists and doesn't have the teddy bear
            if (robotCharacter && !robotHasTeddyBear) {
                const jitterAmount = 0.02;
                // Store initial Y to ensure it stays on the ground
                const initialRobotY = robotCharacter.position.y;

                robotCharacter.position.x += (Math.random() - 0.5) * jitterAmount;
                robotCharacter.position.z += (Math.random() - 0.5) * jitterAmount;

                // Constrain jitter to prevent robot from moving too far
                const initialRobotX = 3; // The initial X position set for the robot
                const initialRobotZ = 1; // The initial Z position set for the robot
                robotCharacter.position.x = Math.max(initialRobotX - 0.1, Math.min(initialRobotX + 0.1, robotCharacter.position.x));
                robotCharacter.position.z = Math.max(initialRobotZ - 0.1, Math.min(initialRobotZ + 0.1, robotCharacter.position.z));

                // Ensure robot stays on the ground plane (its base y should be ground.position.y)
                robotCharacter.position.y = initialRobotY;
            }

            // NPC Interaction Logic: Handles dialogues when the player is near the NPC.
            if (npcCharacter && character && !gameWon) { // Only allow NPC interaction if game is not won
                const distanceToNPC = character.position.distanceTo(npcCharacter.position);
                if (distanceToNPC < 1.5) { // Player is close enough to the NPC
                    if (hasTeddyBear && robotHasTeddyBear) { // Player helped robot
                        showNpcMessage("NPC: Thank you for helping the little robot! He's so much happier now. Enjoy the party!", 3000);
                    } else if (!npcInteracted && !hasTeddyBear) { // Initial interaction: player doesn't have bear
                        showNpcMessage("NPC: Hello little explorer! My friend, the little robot, is scared of the dark, and his teddy bear helps him sleep. He can't come to the party without it! Can you find his teddy bear?", 5000);
                        npcInteracted = true; // Mark that the initial interaction has occurred.
                    } else if (npcInteracted && hasTeddyBear && !robotHasTeddyBear) { // Player has bear, but robot doesn't
                        showNpcMessage("NPC: I see you have a teddy bear! The little robot is over there. Maybe it's his?", 3000);
                    } else if (npcInteracted && !hasTeddyBear) { // Player interacted, left, came back without bear
                        showNpcMessage("NPC: Please try to find the teddy bear for the little robot.", 3000);
                    }
                    // The old "NPC gives password" logic is removed as the robot now handles this.
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
