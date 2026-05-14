# [NANDbox](https://jleescy.github.io/NANDbox) — Boolean Logic Simulator

> *Note:* This repository has been migrated from a previous project (SNEEZYlogic - now private) to encourage better issue tracking, cleaner commits, and cleaner code.

NANDbox is a powerful web-based digital logic simulation tool that allows users to design, build, and test boolean circuits in their browser.

## Features

- **Component Library**: Includes standard logic gates (AND, NAND, OR, NOR, XOR, XNOR, NOT) and common flip-flops (D-Type, JK, SR, T-Type).
- **Interactive Simulation**: A tick-based evaluation engine ensures accurate signal propagation and real-time feedback.
- **Input/Output**: Support for interactive switches, clocks, visual lights, and 7-segment displays.
- **Visuals**: Clean SVG-based component designs with dynamic visual updates based on logic states.

## Project Structure

- `www/index.html`: The landing page and entry point.
- `www/simulate/`: The main simulation environment.
- `www/js/`: Core simulation logic and component classes.
  - `engine.js`: The tick-based simulation engine.
  - `gate.js`, `flipflop.js`, `wire.js`: Logic and behavior for circuit components.
- `www/css/`: Application styling and custom shapes.
- `www/images/`: SVG assets for all logic gates and interface icons.
- `www/library/`: Example circuits and pre-defined logic structures.

## Getting Started

To run NANDbox locally, simply serve the `www` directory using any static web server.

```bash
# Example using Python
cd www
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000` in your web browser.

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Frameworks**: Bootstrap 5, jQuery
- **Icons/Graphics**: Custom SVG assets

---
Developed by [Joshua Lees](https://github.com/jleesCY).
