# Canvas Rendering Refactor for NANDbox

## Goal

Replace DOM-based rendering of circuit elements (components, wires, connectors) with a single HTML5 `<canvas>` element to eliminate DOM overhead when dealing with thousands of elements.

## Background

Currently, each gate, wire, connector, and label is a DOM element. With ~1000 components and ~2500 wires, the browser must manage ~10,000+ DOM nodes, causing layout thrashing, paint storms, and poor interaction performance.

A canvas approach draws everything as pixels in a single element — O(1) DOM nodes regardless of circuit size.

## Architecture: Hybrid DOM + Canvas

**Stays as DOM:** Navbar, side panel, settings panels, modals, library overlay, selection box overlay, mobile drawer.

**Moves to Canvas:** All components (gates, inputs, lights, flip-flops, junctions, labels, 7-seg displays), all connectors, all wires, wire preview line, ghost preview during drag.

**Pan/Zoom:** Replace `panzoom` library with canvas `ctx.translate()`/`ctx.scale()` transforms. The canvas element fills the `#dropwindow` area.

---

## Proposed Changes

### 1. Canvas Renderer

#### [NEW] [renderer.js](file:///home/jlees/Code/NANDbox/www/js/renderer.js)

A `CanvasRenderer` class that:
- Creates and manages the `<canvas>` element inside `#dropwindow`
- Handles pan/zoom state (replaces `panzoom` library)
- Runs a `requestAnimationFrame` render loop that draws the entire scene
- Provides `screenToWorld(clientX, clientY)` and `worldToScreen(x, y)` coordinate transforms
- Draws grid background
- Draws all wires (underneath)
- Draws all components with their connectors
- Draws selection indicators, wire preview, selection box, ghost preview
- Exposes a `hitTest(worldX, worldY)` method returning what was clicked (component body, connector, wire segment, or nothing)

Key drawing functions:
- `drawGate(ctx, comp)` — draws the gate SVG shape paths (AND/OR/NOT/XOR) using canvas path commands, connector circles, bridges
- `drawInput(ctx, comp)` — draws button/switch/const/clock shapes
- `drawLight(ctx, comp)` — draws the dome-shaped LED
- `drawFlipFlop(ctx, comp)` — draws the rectangular body with pin labels
- `drawJunction(ctx, comp)` — draws lines and center dot
- `drawLabel(ctx, comp)` — draws text with background
- `drawSeg7(ctx, comp)` — draws the 7-segment display
- `drawConnector(ctx, connector)` — draws the circle + bridge line
- `drawWire(ctx, wire)` — draws the path with appropriate color
- `drawSelectionBox(ctx, rect)` — dashed rectangle overlay
- `drawWirePreview(ctx, from, to)` — dashed green line
- `drawGhostPreview(ctx, type, x, y)` — semi-transparent component preview

All drawing respects the component's `rotation` property via `ctx.save()`, `ctx.translate()`, `ctx.rotate()`, `ctx.restore()`.

### 2. Hit Testing

#### [NEW] In renderer.js

`hitTest(worldX, worldY)` checks in priority order:
1. **Connectors**: Point-in-circle (radius ~7px). Returns `{type: 'connector', connectorId, connector}`.
2. **Component bodies**: Point-in-rotated-rect using component dimensions. Returns `{type: 'component', compId, component}`.
3. **Wire segments**: Point-near-line-segment (threshold ~8px). Returns `{type: 'wire', wireId, wire, segIndex, isHorizontal}`.
4. **Nothing**: Returns `null`.

Component bounding boxes (in local coords, before rotation):

| Type | Width | Height | Body offset |
|------|-------|--------|-------------|
| Gate | 160 | 80 | body at (20, 0) size 120×80 |
| Input | 60 | 40 | body at (0, 0) size 40×40 |
| Light | 40 | 60 | body at (0, 0) size 40×40 |
| FlipFlop | 160 | 80 | body at (20, 0) size 120×80 |
| Junction | 50 | 50 | center dot at (25, 25) |
| Label | text width | text height | full area |
| Seg7 | 80 | 80 | display at (20, 0) size 60×80 |

Connector positions are pre-computed relative to the component origin (matching the existing `localX`/`localY` cache).

### 3. Pan/Zoom

#### In renderer.js

Replace `panzoom` library with built-in canvas transforms:
- **Mouse wheel** on canvas → zoom (centered on cursor)
- **Middle-click drag** or pan mode drag → pan
- Store `panX`, `panY`, `zoomScale` in renderer
- Apply as `ctx.translate(panX, panY); ctx.scale(zoomScale, zoomScale)` before drawing
- Expose the same interface the rest of the code expects (`getTransform()` returning `{x, y, scale}`)
- The zoom slider continues to work by calling `renderer.setZoom()`

### 4. Event Handling Updates

#### [MODIFY] [index.js](file:///home/jlees/Code/NANDbox/www/js/index.js)

The existing event handlers on `document` (pointerdown, pointermove, pointerup, click, dblclick) will be updated to:
1. Convert `event.clientX/Y` to world coordinates via `renderer.screenToWorld()`
2. Use `renderer.hitTest()` instead of checking `event.target` classes
3. The drag-and-drop from the side panel will continue using HTML5 drag events, but the `dragover` handler will position the ghost by setting renderer state (which draws it on canvas) instead of moving a DOM element
4. Selection box is drawn on canvas overlay instead of a DOM element
5. Wire preview line is drawn on canvas instead of creating an SVG element

### 5. Component Class Updates

#### [MODIFY] All component files (gate.js, input.js, light.js, flipflop.js, junction.js, label.js, 7Seg.js, clock.js)

- Remove all DOM manipulation from `select()`, `deselect()`, `updateVisuals()`, `enableSelect()`, `disableSelect()`, `enablePress()`, `disablePress()`, `enableEdit()`, `delete()`
- Components become pure data models. Their `select()` just sets `this.selected = true`. Their `deselect()` just sets `this.selected = false`.
- `updateVisuals()` becomes a no-op (canvas renderer reads state directly)
- `delete()` no longer touches DOM
- `enablePress/disablePress` no longer attach DOM events — pressing is handled by hit testing in the canvas event handlers
- Labels: `enableEdit()` will create a temporary `<input>` overlay on the canvas at the label's screen position for text editing

#### [MODIFY] [connector.js](file:///home/jlees/Code/NANDbox/www/js/connector.js)

- Remove DOM manipulation from `on()`, `off()`, `float()`, `short()`, `updateVisual()`, `select()`, `deselect()`, `enlarge()`, `unenlarge()`, `enableSelect()`, `disableSelect()`
- Connector becomes pure data. Rendering reads `connector.value` directly.
- Remove `dom` property (connectors no longer have DOM elements)
- Keep `localX`/`localY` as the position cache — these are now the authoritative position relative to parent

#### [MODIFY] [wire.js](file:///home/jlees/Code/NANDbox/www/js/wire.js)

- Remove `render()`, `updatePath()`, `updateVisual()`, `delete()` DOM operations
- Keep `getPoints()`, `_getConnectorPos()`, `_getColor()` as they compute data needed by the canvas renderer
- `_getColor()` returns actual hex colors instead of CSS variable references
- Remove `dom` property

### 6. HTML Updates

#### [MODIFY] [index.html](file:///home/jlees/Code/NANDbox/www/simulate/index.html)

- Remove `#simulation-window` div (replaced by canvas)
- Add `<canvas id="circuit-canvas">` inside `#dropwindow`
- Remove `#selection-box` div (drawn on canvas)
- Remove panzoom script include
- Add renderer.js script include

### 7. CSS Updates

#### [MODIFY] [shapes.css](file:///home/jlees/Code/NANDbox/www/css/shapes.css)

- Remove all component rendering CSS (gates, inputs, lights, etc.) — these are now drawn on canvas
- Keep sidebar preview styles (those are still DOM)
- Keep connector state classes only if needed for sidebar previews

---

## User Review Required

> [!IMPORTANT]
> This is a very large refactor touching every file. The simulation engine (`engine.js`) is NOT changed — it continues working as-is. The component classes become pure data models, and all visual rendering moves to a single `requestAnimationFrame` loop.

> [!WARNING]
> **Label editing**: Since canvas can't have editable text, labels will use a floating `<input>` element that appears on double-click at the label's screen position. This is the standard approach for canvas-based editors.
> 
> **CSS transitions**: The smooth color transitions on wires and connectors (0.15s ease) will need to be implemented as lerped animation in the render loop, or simply removed (instant color change). For performance, instant change is recommended.

## Open Questions

1. **CSS Transitions**: Should I implement interpolated color transitions in the render loop for wires/connectors (adds complexity), or is instant color change acceptable?
2. **Fonts**: The 7-segment font (`DSEG7ClassicMini-Bold.ttf`) and `JetBrains Mono` will need to be loaded before canvas can render text with them. I'll use `document.fonts.ready` to ensure they're available. Is this acceptable?

## Verification Plan

### Manual Verification
- Load a saved circuit file → visually compare to the DOM version
- Place each component type from the sidebar and verify appearance
- Draw wires between components, verify routing
- Select components, verify selection indicator
- Drag single and groups of components, verify wire updates
- Toggle switches and buttons, verify signal propagation visuals
- Test pan/zoom with mouse wheel and slider
- Test undo/redo
- Test copy/paste
- Test save/load
- Test with a large circuit (1000+ components) and verify smooth 60 FPS
