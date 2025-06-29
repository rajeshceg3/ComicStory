# Interactive 3D Story with Three.js

This project is a starting point for creating an interactive 3D story experience for kids using Three.js.

## Current Status

A basic Three.js scene has been set up:
- An `index.html` file serves as the entry point.
- The Three.js library is included via CDN.
- A `main.js` file contains the script to render a 3D scene with basic interactive elements.
- The scene includes a character, a goal flag, a collectible item, and a ground plane.
- Basic UI for score display.

## How to View

1.  Clone or download this repository.
2.  Open the `index.html` file in a modern web browser that supports WebGL.

## Gameplay and Features

The current version includes the following interactive elements:

- **Goal Flag**: A red cone object is present in the scene, representing the goal.
- **Character Movement**: You can move the character using W (forward), A (left), S (backward), and D (right) keys on your keyboard. The character moves along the X and Z axes and is constrained to the ground plane.
- **Collectible Item and Score**: A spinning collectible item is present in the scene. When the character approaches it, the item is collected, disappears, and your score increases. The score is displayed at the top-left of the screen.
- **Win Condition**: If the character gets close enough to the goal flag (within approximately 1 unit of distance), a success message "You reached the flag!" will be displayed via an alert box. This message appears only once per game session.

## Next Steps

The plan is to expand this basic setup to include:
- Story elements (characters, environments, props).
- Interactivity to allow users to progress through the story.
- Animations to bring the story to life.