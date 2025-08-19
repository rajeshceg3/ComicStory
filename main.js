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
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('startButton');

    // Ensure the container element exists before proceeding.
    if (!container || !infoDisplay || !npcMessageDisplay || !welcomeScreen || !startButton) {
        console.error('One or more UI elements are missing from the DOM.');
    } else {
        // Hide game UI initially
        infoDisplay.style.display = 'none';
        npcMessageDisplay.style.display = 'none';
        container.style.opacity = 0;


        // Constants for game elements
        const ROBOT_INITIAL_X = 3;
        const ROBOT_INITIAL_Z = 1;

        // Game state variables
        let npcCharacter; // Holds the Three.js Group for the NPC
        let robotCharacter; // Holds the Three.js Group for the Robot
        let npcInteracted = false; // Flag to track if the initial NPC interaction has occurred
        let hasPassword = false; // Flag to track if the player has received the password from the NPC
        let robotHasTeddyBear = false; // Flag to track if the robot has received the teddy bear
        let gameStarted = false;

        // Scene setup: The scene is the container for all 3D objects.
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Sky blue background

        // Camera setup: Defines the perspective from which the scene is viewed.
        // PerspectiveCamera(fov, aspect, near, far)
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 5); // Position the camera for a better initial view.

        // Renderer setup: Responsible for drawing the scene onto the HTML canvas.
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to window size.
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement); // Add the renderer's canvas to the container.

        // Check if OrbitControls was loaded
        if (typeof THREE.OrbitControls === 'function') {
            console.log('THREE.OrbitControls is loaded.');
        } else {
            console.error('THREE.OrbitControls is NOT loaded. Check script inclusion in index.html.');
        }

        // OrbitControls setup: Allows camera manipulation (orbit, zoom, pan) with mouse/touch.
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        // M2: Constrain camera to keep focus on the player and prevent spoiling the discovery.
        controls.minDistance = 3;
        controls.maxDistance = 8;
        controls.minPolarAngle = Math.PI / 4; // Prevent looking from top-down
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
        controls.enablePan = false; // Disable panning


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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft white light with 50% intensity.
        scene.add(ambientLight);

        // DirectionalLight: Emits light in a specific direction, creating shadows and highlights.
        // DirectionalLight(color, intensity)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // White light with 50% intensity.
        directionalLight.position.set(5, 10, 7.5); // Position the light source.
        scene.add(directionalLight);


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

        // Function to create a Key
        function createKey() {
            const key = new THREE.Group();
            const gold = 0xFFD700; // Gold color
            const keyMaterial = new THREE.MeshPhongMaterial({ color: gold });

            // Key Head (Torus)
            const headRadius = 0.2;
            const headTubeRadius = 0.05;
            const headGeometry = new THREE.TorusGeometry(headRadius, headTubeRadius, 16, 100);
            const keyHead = new THREE.Mesh(headGeometry, keyMaterial);
            keyHead.position.y = 0.5; // Position it up
            key.add(keyHead);

            // Key Shaft (Cylinder)
            const shaftHeight = 0.6;
            const shaftRadius = 0.04;
            const shaftGeometry = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftHeight, 32);
            const keyShaft = new THREE.Mesh(shaftGeometry, keyMaterial);
            keyShaft.position.y = 0; // Center it
            key.add(keyShaft);

            // Key Tooth (Box)
            const toothWidth = 0.15;
            const toothHeight = 0.04;
            const toothDepth = 0.04;
            const toothGeometry = new THREE.BoxGeometry(toothWidth, toothHeight, toothDepth);
            const keyTooth = new THREE.Mesh(toothGeometry, keyMaterial);
            keyTooth.position.set(toothWidth / 2, -shaftHeight / 2 + toothHeight, 0); // Position at bottom of shaft
            key.add(keyTooth);

            return key;
        }

        // Collectible Item: A Lost Teddy Bear
        let collectibleItem = createTeddyBear();
        collectibleItem.name = "collectible"; // Name the object for the teddy bear
        collectibleItem.position.set(2, ground.position.y + 0.3, -2);
        scene.add(collectibleItem);

        // Collectible Item: The Lost Key
        let keyItem = createKey();
        keyItem.name = "key"; // Name the object for the key
        keyItem.position.set(-1.5, ground.position.y + 0.4, -3.0); // Position near the rocks
        keyItem.rotation.x = Math.PI / 2; // Lay it flat initially
        keyItem.visible = false; // Initially hidden until the quest starts
        scene.add(keyItem);

        let animationTime = 0; // Time variable for animation
        let gameWon = false; // Flag to track if the game has been won
        let score = 0; // Initialize score
        let hasTeddyBear = false; // Player has the teddy bear
        let hasKey = false; // Player has the key
        let keyQuestStarted = false; // Player has been given the key quest

        function updateInfoDisplay() {
            if (infoDisplay) {
                let status = "";
                if (!hasTeddyBear) {
                    status = "Find the teddy bear!";
                } else if (hasTeddyBear && !robotHasTeddyBear) {
                    status = "Give the teddy to the robot!";
                } else if (robotHasTeddyBear && !keyQuestStarted) {
                    status = "Talk to the Wise Old Tree.";
                } else if (keyQuestStarted && !hasKey) {
                    status = "Find the lost key near the rocks.";
                } else if (hasKey && hasPassword) {
                    status = "You have everything! Go to the party gate!";
                } else {
                    status = "Head to the party gate!"; // Fallback
                }
                // L3: Use textContent for security
                infoDisplay.innerHTML = ''; // Clear previous content
                const strongTag = document.createElement('strong');
                strongTag.textContent = 'Objective: ';
                infoDisplay.appendChild(strongTag);
                infoDisplay.append(status); // Appends the status text node
            }
        }


        // L2: Implement a message queue to prevent flickering and message interruption.
        let messageQueue = [];
        let isMessageVisible = false;
        let npcMessageTimeout;

        function processMessageQueue() {
            if (isMessageVisible || messageQueue.length === 0) {
                return; // Don't process if a message is already visible or queue is empty
            }

            isMessageVisible = true;
            const { message, duration } = messageQueue.shift(); // Get the next message

            if (npcMessageDisplay) {
                npcMessageDisplay.textContent = message;
                npcMessageDisplay.style.display = 'block';

                npcMessageTimeout = setTimeout(() => {
                    npcMessageDisplay.style.display = 'none';
                    isMessageVisible = false;
                    processMessageQueue(); // Process the next message in the queue
                }, duration);
            }
        }

        function showNpcMessage(message, duration = 3000) {
            messageQueue.push({ message, duration });
            processMessageQueue(); // Attempt to process the queue
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
        robotCharacter.position.set(ROBOT_INITIAL_X, ground.position.y, ROBOT_INITIAL_Z); // Position on the ground
        // Store initial position in userData
        robotCharacter.userData.initialX = ROBOT_INITIAL_X;
        robotCharacter.userData.initialZ = ROBOT_INITIAL_Z;
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
            if (!gameStarted) return;
            requestAnimationFrame(animate); // Request the next frame for smooth animation.

            animationTime += 0.05; // Increment time for animation

            // Animate the collectible items
            if (collectibleItem) {
                collectibleItem.rotation.y += 0.02;
            }
            if (keyItem && keyItem.visible) {
                keyItem.rotation.z += 0.02; // Rotate on its local Z-axis (since it's laying flat)
            }

            // Bob the character's head
            const characterHead = character.getObjectByName("characterHead");
            if (characterHead) {
                const bobAmplitude = 0.05; // How much the head bobs
                characterHead.position.y = characterHead.userData.initialY + Math.sin(animationTime) * bobAmplitude;
            }

            // Check for teddy bear collision
            if (collectibleItem && character) {
                const distanceToCollectible = character.position.distanceTo(collectibleItem.position);
                if (distanceToCollectible < 1.0) {
                    scene.remove(collectibleItem);
                    collectibleItem = null;
                    score++;
                    hasTeddyBear = true;
                    showNpcMessage("You found the teddy bear!", 2500);
                    updateInfoDisplay();
                }
            }

            // Check for key collision
            if (keyItem && keyItem.visible && character) {
                const distanceToKey = character.position.distanceTo(keyItem.position);
                if (distanceToKey < 1.0) {
                    scene.remove(keyItem);
                    keyItem = null;
                    hasKey = true;
                    showNpcMessage("You found the key!", 2500);
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
                        partyGate.material.color.setHex(0xFFFF00); // Change gate to yellow to indicate password received
                    }
                    updateInfoDisplay();
                    // Note on `hasTeddyBear`:
                    // `hasTeddyBear` remains `true` even after giving it to the robot.
                    // In this game's logic, it signifies that the player has completed the task of finding the teddy bear,
                    // which is a prerequisite for the win condition (having helped with the bear AND obtained the password).
                    // It does not strictly mean the player is still physically holding the bear.
                    // // hasTeddyBear = false; // This line is commented out as per discussion to allow win condition with player still "knowing" they helped with teddy.
                                        // If hasTeddyBear is set to false, the win condition needs adjustment.
                                        // For now, player "keeps" teddy status, implying they completed that task.
                }
            }

            // Check for win condition: Player must be near the party gate, have the teddy bear, and have the password.
            if (!gameWon && character && partyGate) { // Only check if game isn't already won and objects exist
                const distanceToGoal = character.position.distanceTo(partyGate.position);
                if (distanceToGoal < 1.0) { // Player is close enough to the gate
                    if (hasPassword && hasKey) { // Player has both items needed to win
                        partyGate.material.color.setHex(0x00ff00); // Set gate to green upon winning
                        showNpcMessage("Hooray! You opened the party gate! Time to celebrate!", 5000);
                        gameWon = true; // Set the game as won
                    } else if (hasPassword && !hasKey) { // Player has password but not the key
                        showNpcMessage("The password worked, but the gate is still locked. You need a key!", 3000);
                    } else if (!hasTeddyBear) { // Player does not have the teddy bear (and thus no password or key)
                        showNpcMessage("You need to help the robot to get the password first!", 3000);
                    } else { // Generic message if something is missing
                        showNpcMessage("You need the password and the key to open this gate!", 3000);
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
                // Use userData for initial position, set during robot creation
                const initialRobotX = robotCharacter.userData.initialX;
                const initialRobotZ = robotCharacter.userData.initialZ;
                robotCharacter.position.x = Math.max(initialRobotX - 0.1, Math.min(initialRobotX + 0.1, robotCharacter.position.x));
                robotCharacter.position.z = Math.max(initialRobotZ - 0.1, Math.min(initialRobotZ + 0.1, robotCharacter.position.z));

                // Ensure robot stays on the ground plane (its base y should be ground.position.y)
                robotCharacter.position.y = initialRobotY;
            }

            // NPC Interaction Logic: Handles dialogues when the player is near the NPC.
            if (npcCharacter && character && !gameWon) { // Only allow NPC interaction if game is not won
                const distanceToNPC = character.position.distanceTo(npcCharacter.position);
                if (distanceToNPC < 1.5) { // Player is close enough to the NPC
                    if (robotHasTeddyBear && !keyQuestStarted) { // Player helped robot, but hasn't received key quest yet
                        showNpcMessage("NPC: Thank you for helping the little robot! One more thing... I seem to have lost the key to the party gate near the rocks. Could you find it?", 5000);
                        keyQuestStarted = true;
                        keyItem.visible = true; // Make the key visible now
                        updateInfoDisplay();
                    } else if (robotHasTeddyBear && keyQuestStarted && !hasKey) { // Player has key quest but no key
                        showNpcMessage("NPC: The key should be somewhere near those big grey rocks. Good luck!", 3000);
                    } else if (hasKey) { // Player has found the key
                        showNpcMessage("NPC: You found the key! Amazing! Now you can open the gate.", 3000);
                    } else if (!npcInteracted && !hasTeddyBear) { // Initial interaction
                        showNpcMessage("NPC: Hello little explorer! Please find the teddy bear for my robot friend. He's too scared to come to the party without it!", 5000);
                        npcInteracted = true;
                    } else if (hasTeddyBear && !robotHasTeddyBear) { // Player has bear, but robot doesn't
                        showNpcMessage("NPC: I see you have a teddy bear! The little robot is over there. Maybe it's his?", 3000);
                    } else { // Default message if player returns without bear
                        showNpcMessage("NPC: Please try to find the teddy bear for the little robot.", 3000);
                    }
                    // The old "NPC gives password" logic is removed as the robot now handles this.
                }
            }

            // M2: Make camera follow the character
            if (character) {
                const targetPosition = new THREE.Vector3(character.position.x, character.position.y + 0.8, character.position.z);
                controls.target.lerp(targetPosition, 0.1);
            }

            // Update OrbitControls: Necessary if controls.enableDamping or controls.autoRotate are set.
            // Also good practice to include for other potential updates.
            if (controls && typeof controls.update === 'function') {
                controls.update();
            }



            // Render the scene from the perspective of the camera.
            renderer.render(scene, camera);
        }

        function startGame() {
            welcomeScreen.style.display = 'none';
            infoDisplay.style.display = 'block';
            container.style.transition = 'opacity 1.5s ease-in';
            container.style.opacity = 1;
            gameStarted = true;
            updateInfoDisplay();
            animate();
        }

        startButton.addEventListener('click', startGame);


        // Handle window resize: Adjusts camera aspect ratio and renderer size when the window is resized.
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio.
            camera.updateProjectionMatrix(); // Apply the new aspect ratio.
            renderer.setSize(window.innerWidth, window.innerHeight); // Resize the renderer.
        }, false);

        // Event listener for keyboard input
        document.addEventListener('keydown', (event) => {
            if (!gameStarted) return;
            const speed = 0.1;
            const boundary = 4.5;

            // M1: Make movement camera-relative
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0; // Project onto XZ plane
            cameraDirection.normalize();

            const moveDirection = new THREE.Vector3(0, 0, 0);

            if (event.key === 'w' || event.key === 'W') {
                moveDirection.add(cameraDirection);
            } else if (event.key === 's' || event.key === 'S') {
                moveDirection.sub(cameraDirection);
            } else if (event.key === 'a' || event.key === 'A') {
                // To move left, we need a vector perpendicular to the camera direction
                const left = new THREE.Vector3().crossVectors(camera.up, cameraDirection).normalize();
                moveDirection.add(left);
            } else if (event.key === 'd' || event.key === 'D') {
                // To move right, we use the opposite of the left vector
                const right = new THREE.Vector3().crossVectors(cameraDirection, camera.up).normalize();
                moveDirection.add(right);
            }

            if (moveDirection.length() > 0) {
                character.position.add(moveDirection.multiplyScalar(speed));
            }

            // Ensure the character stays within the ground plane boundaries
            character.position.x = Math.max(-boundary, Math.min(boundary, character.position.x));
            character.position.z = Math.max(-boundary, Math.min(boundary, character.position.z));
        });

        // Initial render to show something before the game starts
        renderer.render(scene, camera);
    }
}