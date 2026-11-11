# Verify ComicStory
Teddy's Adventure - single-file interactive comic story.
## Launch
Any static file server from the repo root.
## Doctor
`python3 .cursor/skills/verify-comic-story/verify.py`
## Drive
Serves the static site and renders it in headless Chromium asserting the boot marker, scene container, and zero JS console errors.
## Evidence
`.cursor/skills/verify-comic-story/evidence.json`
## Cleanup
Static/streamlit server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.
