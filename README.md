# Interactive 3D Story with Three.js

This project is a starting point for creating an interactive 3D story experience for kids using Three.js.

## Current Status

A basic Three.js scene has been set up:
- An `index.html` file serves as the entry point.
- The Three.js library is included via CDN.
- A `main.js` file contains the script to render a 3D scene with basic interactive elements.
- The scene includes a player character, an NPC (Wise Old Tree), a Robot character, a collectible teddy bear, a party gate (goal), and a ground plane.
- UI for score, inventory/status, and messages.

## How to View

1.  Clone or download this repository.
2.  Open the `index.html` file in a modern web browser that supports WebGL.

## Gameplay and Features

The current version includes the following interactive elements and gameplay flow:

-   **Player Character**: A simple character you can move using W (forward), A (left), S (backward), and D (right) keys. The character moves along the X and Z axes and is constrained to the ground plane.
-   **The Goal - Party Gate**: A blue cone object representing the entrance to a party. To open it, you'll need a password.
-   **The Quest Giver - Wise Old Tree (NPC)**:
    -   Initially, the Tree will tell you about its friend, a little Robot who has lost its teddy bear and is too scared to come to the party without it. The Tree asks for your help.
    -   If you find the teddy bear but talk to the Tree before giving it to the Robot, the Tree might hint that the teddy bear belongs to the Robot.
    -   After you've helped the Robot, the Tree will thank you.
-   **The Lost Teddy Bear (Collectible Item)**: A spinning teddy bear is hidden in the scene.
    -   Collecting it will increase your score.
-   **The Frightened Robot**: A new character in the game!
    -   The Robot is initially scared (it jitters slightly).
    -   If you approach the Robot *after* collecting the teddy bear, you will automatically give the teddy bear to it.
    -   The Robot will cheer up (stop jittering) and thank you by giving you the secret password ('1234') for the Party Gate.
-   **UI Display**:
    -   **Score**: Displayed at the top-left, increases when you collect the teddy bear.
    -   **Inventory/Status**: Shows if you've collected the teddy bear, if the robot has it, and if you have the password.
    -   **Messages**: Dialogue from characters and important game messages appear at the top-left.
-   **Win Condition**:
    -   Collect the teddy bear.
    -   Give the teddy bear to the Robot to get the password.
    -   Approach the Party Gate with the password. A success message will be displayed.
    -   If you approach the gate without the necessary items, messages will guide you on what's missing.

## Next Steps

The plan is to further expand this interactive experience:
- Enhance story elements with more dialogues and character interactions.
- Add more sophisticated animations for characters and events.
- Incorporate sound effects and background music.
- Introduce additional small quests or interactive props.
- Refine UI/UX for a more polished feel.
- Explore more complex 3D modeling for characters and environment.
