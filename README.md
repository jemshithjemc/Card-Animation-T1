# Indula — 3D Pitch Deck Card Animation

Cascading **3D pitch-deck cards** built with pure HTML, CSS, and JavaScript — no frameworks, no build step.

Cards peel toward the camera, the stack moves in depth, and the next slide rises from behind. Scroll or drag to take control; autoplay resumes when you stop.

![Indula 3D pitch deck card stack](./preview.png)

## Live demo

```bash
# Option A — open directly
open indula/index.html

# Option B — local server
cd indula && python3 -m http.server 8080
# → http://localhost:8080
```

## Features

- Perspective **3D card stack** with depth, tilt, and scale
- Smooth **auto-play cascade** (peel → advance → enter from back)
- **Scroll & drag** scrubbing with inertia-style velocity
- Subtle **ambient sway** so the stack feels alive
- **Responsive** layout for desktop and mobile
- **Zero dependencies** — vanilla HTML / CSS / JS

## Tech

| Layer | Approach |
|-------|----------|
| Layout | Editorial 16:9 pitch slides (process, metrics, brand, about…) |
| Motion | CSS `transform` + `perspective` driven by `requestAnimationFrame` |
| Interaction | Wheel + pointer events; autoplay pauses while you interact |
| Easing | Cubic in-out for each cascade step |

## How the animation works

1. Cards are ordered front → back.
2. Each frame interpolates every card between its current stack slot and the one above (eased).
3. The front card lifts and fades; deeper cards step forward in Y/Z; the last card eases in from further back.
4. When progress hits `1`, the order rotates and the cycle repeats.

## Project structure

```
├── README.md
├── LICENSE
├── preview.png
└── indula/
    ├── index.html
    ├── css/style.css
    ├── js/script.js
    └── assets/images/
```

## Author

**Mohamed Jemshith**  
Portfolio motion experiment — Indula Card Animation T1

## License

Copyright © 2026 Mohamed Jemshith. All rights reserved.
