class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.panX = 0;
        this.panY = 0;
        this.zoomScale = 1.0;
        
        // Settings
        this.showGrid = true;
        this.theme = 'light';
        
        // Visual Constants
        this.colors = {
            bg: 'var(--bg-primary, #ffffff)',
            grid: 'rgba(0,0,0,0.1)',
            high: '#e35050',
            low: '#494f5c',
            float: '#7a859c',
            short: '#e38520',
            text: '#222222',
            bgComp: '#ffffff',
            border: '#000000',
            select: 'rgba(50, 150, 255, 0.4)'
        };

        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Render loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    screenToWorld(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return {
            x: (x - this.panX) / this.zoomScale,
            y: (y - this.panY) / this.zoomScale
        };
    }

    worldToScreen(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: x * this.zoomScale + this.panX + rect.left,
            y: y * this.zoomScale + this.panY + rect.top
        };
    }

    getTransform() {
        return { x: this.panX, y: this.panY, scale: this.zoomScale };
    }

    pan(dx, dy) {
        this.panX += dx;
        this.panY += dy;
    }

    setZoom(scale, centerX = this.canvas.width / 2, centerY = this.canvas.height / 2) {
        const newScale = Math.max(0.2, Math.min(3.0, scale));
        this.panX = centerX - (centerX - this.panX) * (newScale / this.zoomScale);
        this.panY = centerY - (centerY - this.panY) * (newScale / this.zoomScale);
        this.zoomScale = newScale;
        
        const slider = document.getElementById('zoom-slider');
        if (slider) slider.value = this.zoomScale;
        const text = document.getElementById('status-zoom');
        if (text) text.innerText = `Zoom: ${Math.round(this.zoomScale * 100)}%`;
    }

    hitTest(worldX, worldY) {
        // 1. Check Connectors
        for (let comp of Object.values(components)) {
            let conns = [comp.n1, comp.n2, comp.n3, comp.n4, comp.nC, comp.nOut, comp.nQ, comp.nQNot].filter(c => c);
            for (let c of conns) {
                let dims = getCompDims(comp.type);
                let originX = comp.x + dims.w / 2;
                let originY = comp.y + dims.h / 2;
                let cx = comp.x + c.localX;
                let cy = comp.y + c.localY;
                if (comp.rotation) {
                    let angle = comp.rotation * Math.PI / 180;
                    let dx = cx - originX;
                    let dy = cy - originY;
                    cx = originX + dx * Math.cos(angle) - dy * Math.sin(angle);
                    cy = originY + dx * Math.sin(angle) + dy * Math.cos(angle);
                }
                let dx = worldX - cx;
                let dy = worldY - cy;
                if (dx * dx + dy * dy <= 400) { // Radius 20
                    return { type: 'connector', connector: c };
                }
            }
        }

        // 2. Check Components
        let compArr = Object.values(components);
        for (let i = compArr.length - 1; i >= 0; i--) {
            let comp = compArr[i];
            let dims = getCompDims(comp.type);
            let w = dims.w;
            let h = dims.h;

            let originX = comp.x + w / 2;
            let originY = comp.y + h / 2;
            let localX = worldX - originX;
            let localY = worldY - originY;
            if (comp.rotation) {
                let angle = -comp.rotation * Math.PI / 180;
                let tx = localX * Math.cos(angle) - localY * Math.sin(angle);
                let ty = localX * Math.sin(angle) + localY * Math.cos(angle);
                localX = tx;
                localY = ty;
            }
            localX += originX;
            localY += originY;

            if (localX >= comp.x && localX <= comp.x + w && localY >= comp.y && localY <= comp.y + h) {
                return { type: 'component', component: comp };
            }
        }

        // 3. Check Wires
        for (let wire of Object.values(wires)) {
            let pts = wire.getPoints ? wire.getPoints(1.0) : [];
            for (let i = 0; i < pts.length - 1; i++) {
                let p1 = pts[i];
                let p2 = pts[i+1];
                let dist = this.distToSegment(worldX, worldY, p1.x, p1.y, p2.x, p2.y);
                if (dist < 8) {
                    return { type: 'wire', wire: wire, segment: i };
                }
            }
        }

        return null;
    }

    distToSegment(px, py, x1, y1, x2, y2) {
        let l2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    getColor(val) {
        if (val === 'short') return this.colors.short;
        if (val === null) return this.colors.float;
        if (val) return this.colors.high;
        return this.colors.low;
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        // Update colors from CSS variables if available
        let style = getComputedStyle(document.body);
        this.colors.bg = style.getPropertyValue('--bg-primary') || '#ffffff';

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoomScale, this.zoomScale);

        if (this.showGrid) {
            this.drawGrid(ctx, w, h);
        }

        // Draw Wires
        if (typeof wires !== 'undefined') {
            for (let wire of Object.values(wires)) {
                this.drawWire(ctx, wire);
            }
        }
        
        // Draw preview wire if active
        if (typeof wireDrawState !== 'undefined' && wireDrawState.active && wireDrawState.previewWire) {
            this.drawWire(ctx, wireDrawState.previewWire);
        }

        // Draw Components
        if (typeof components !== 'undefined') {
            for (let comp of Object.values(components)) {
                this.drawComponent(ctx, comp);
            }
        }

        // Overlays (Selection Box)
        if (typeof selectState !== 'undefined' && selectState.active) {
            ctx.fillStyle = 'rgba(227,80,80,0.08)';
            ctx.strokeStyle = '#e35050';
            ctx.lineWidth = 2 / this.zoomScale;
            ctx.setLineDash([5 / this.zoomScale, 5 / this.zoomScale]);
            ctx.fillRect(selectState.startX, selectState.startY, selectState.currX - selectState.startX, selectState.currY - selectState.startY);
            ctx.strokeRect(selectState.startX, selectState.startY, selectState.currX - selectState.startX, selectState.currY - selectState.startY);
            ctx.setLineDash([]);
        }

        // Wire Draw Preview
        if (typeof wireDrawState !== 'undefined' && wireDrawState.active) {
            let pts = wireDrawState.previewWire.getPoints();
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
        requestAnimationFrame(this.render);
    }

    drawGrid(ctx, w, h) {
        let grid = 10;
        let scaledGrid = grid * this.zoomScale;
        
        let startX = -(this.panX % scaledGrid) / this.zoomScale;
        let startY = -(this.panY % scaledGrid) / this.zoomScale;
        let endX = w / this.zoomScale;
        let endY = h / this.zoomScale;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1 / this.zoomScale;
        
        // Draw dots instead of lines for a cleaner look
        ctx.fillStyle = this.colors.grid;
        for (let x = startX; x < endX; x += grid) {
            for (let y = startY; y < endY; y += grid) {
                if ((x - startX) % (grid * 5) === 0 && (y - startY) % (grid * 5) === 0) {
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                } else {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    drawWire(ctx, wire) {
        let pts = wire.getPoints();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = this.getColor(wire.value);
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    drawComponent(ctx, comp) {
        ctx.save();
        let dims = getCompDims(comp.type);
        let cx = dims.w / 2;
        let cy = dims.h / 2;
        ctx.translate(comp.x + cx, comp.y + cy);
        if (comp.rotation) {
            ctx.rotate(comp.rotation * Math.PI/180);
        }
        ctx.translate(-cx, -cy);

        if (comp.selected) {
            ctx.shadowColor = this.colors.select;
            ctx.shadowBlur = 10;
        }

        switch (comp.type) {
            case 'and':
            case 'or':
            case 'not':
            case 'nand':
            case 'nor':
            case 'xor':
            case 'xnor':
                this.drawGate(ctx, comp);
                break;
            case 'vcc':
            case 'gnd':
            case 'button':
            case 'switch':
            case 'clock':
                this.drawInput(ctx, comp);
                break;
            case 'led':
                this.drawLight(ctx, comp);
                break;
            case 'dff':
            case 'srff':
            case 'tff':
            case 'jkff':
                this.drawFlipFlop(ctx, comp);
                break;
            case 'junc3':
            case 'junc4':
                this.drawJunction(ctx, comp);
                break;
            case '7seg':
                this.drawSeg7(ctx, comp);
                break;
            case 'label':
                this.drawLabel(ctx, comp);
                break;
        }

        ctx.shadowBlur = 0; // Reset shadow for connectors

        // Draw connectors
        let conns = [comp.n1, comp.n2, comp.n3, comp.n4, comp.nC, comp.nOut, comp.nQ, comp.nQNot].filter(c => c);
        for (let c of conns) {
            this.drawConnector(ctx, c);
        }

        ctx.restore();
    }

    drawGate(ctx, comp) {
        ctx.fillStyle = this.colors.bgComp;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;

        ctx.beginPath();
        if (comp.type === 'and' || comp.type === 'nand') {
            ctx.moveTo(15, 10);
            ctx.lineTo(60, 10);
            ctx.arc(60, 40, 30, -Math.PI/2, Math.PI/2);
            ctx.lineTo(15, 70);
            ctx.closePath();
        } else if (comp.type === 'or' || comp.type === 'nor') {
            ctx.moveTo(15, 10);
            ctx.quadraticCurveTo(60, 10, 100, 40);
            ctx.quadraticCurveTo(60, 70, 15, 70);
            ctx.quadraticCurveTo(35, 40, 15, 10);
        } else if (comp.type === 'xor' || comp.type === 'xnor') {
            ctx.moveTo(15, 10);
            ctx.quadraticCurveTo(60, 10, 100, 40);
            ctx.quadraticCurveTo(60, 70, 15, 70);
            ctx.quadraticCurveTo(35, 40, 15, 10);
            ctx.fill();
            ctx.stroke();
            // Extra curve
            ctx.beginPath();
            ctx.moveTo(5, 10);
            ctx.quadraticCurveTo(25, 40, 5, 70);
        } else if (comp.type === 'not') {
            ctx.moveTo(25, 15);
            ctx.lineTo(100, 40);
            ctx.lineTo(25, 65);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        let bodyEndX = (comp.type === 'and' || comp.type === 'nand') ? 90 : 100;
        let circleX = bodyEndX + 6;

        if (comp.type === 'not' || comp.type === 'nand' || comp.type === 'nor' || comp.type === 'xnor') {
            ctx.beginPath();
            ctx.arc(circleX, 40, 6, 0, Math.PI*2);
            ctx.fillStyle = this.colors.bgComp;
            ctx.fill();
            ctx.stroke();
            bodyEndX = circleX + 6;
        }

        // Draw bridges
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (comp.type === 'not') {
            ctx.moveTo(0, 40); ctx.lineTo(25, 40); // In
            ctx.moveTo(bodyEndX, 40); ctx.lineTo(120, 40); // Out
        } else {
            let inX = (comp.type === 'xor' || comp.type === 'xnor') ? 5 : 15;
            ctx.moveTo(0, 20); ctx.lineTo(inX, 20); // In 1
            ctx.moveTo(0, 60); ctx.lineTo(inX, 60); // In 2
            ctx.moveTo(bodyEndX, 40); ctx.lineTo(120, 40); // Out
        }
        ctx.stroke();
        
        ctx.fillStyle = this.colors.text;
        ctx.font = "bold 14px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(comp.type.toUpperCase(), 50, 40);
    }

    drawInput(ctx, comp) {
        ctx.fillStyle = this.getColor(comp.value);
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        
        // Background box
        this.roundRect(ctx, 0, 0, 40, 40, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = (comp.value && comp.type !== 'clock' && comp.type !== 'button' && comp.type !== 'switch') ? '#fff' : '#fff';
        if (comp.value === null) ctx.fillStyle = '#fff';
        
        ctx.font = "bold 14pt 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (comp.type === 'vcc') ctx.fillText('1', 20, 20);
        else if (comp.type === 'gnd') ctx.fillText('0', 20, 20);
        else if (comp.type === 'clock') {
            ctx.font = "bold 8px 'JetBrains Mono', monospace";
            ctx.fillText(comp.value ? '▲' : '▼', 20, 15);
            ctx.font = "600 5px 'JetBrains Mono', monospace";
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText('CLK', 20, 25);
        } else if (comp.type === 'switch') {
            // Draw switch lines
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, 10); ctx.lineTo(30, 10);
            ctx.moveTo(10, 30); ctx.lineTo(30, 30);
            ctx.stroke();
        }

        // Bridge to output
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, 20); ctx.lineTo(50, 20);
        ctx.stroke();
    }

    drawLight(ctx, comp) {
        ctx.fillStyle = this.getColor(comp.value);
        if (comp.value === true && comp.lightColor) {
            ctx.fillStyle = comp.lightColor;
        }
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, 34);
        ctx.lineTo(0, 20);
        ctx.arcTo(0, 0, 40, 0, 20);
        ctx.arcTo(40, 0, 40, 40, 20);
        ctx.lineTo(40, 34);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 33, 40, 7);

        // Bridge
        ctx.beginPath();
        ctx.moveTo(20, 40); ctx.lineTo(20, 50);
        ctx.stroke();
    }

    drawFlipFlop(ctx, comp) {
        ctx.fillStyle = this.colors.bgComp;
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        this.roundRect(ctx, 20, 0, 100, 80, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.colors.text;
        ctx.font = "bold 20px 'JetBrains Mono', monospace";
        ctx.textBaseline = "middle";
        
        ctx.textAlign = "left";
        if (comp.type === 'dff') {
            ctx.fillText("D", 28, 20);
        } else if (comp.type === 'srff') {
            ctx.fillText("S", 28, 20);
            ctx.fillText("R", 28, 60);
        } else if (comp.type === 'jkff') {
            ctx.fillText("J", 28, 20);
            ctx.fillText("K", 28, 60);
        } else if (comp.type === 'tff') {
            ctx.fillText("T", 28, 20);
        }

        // Clock Triangle
        ctx.beginPath();
        ctx.moveTo(20, 33);
        ctx.lineTo(30, 40);
        ctx.lineTo(20, 47);
        ctx.fillStyle = this.colors.border;
        ctx.fill();

        ctx.textAlign = "right";
        ctx.fillText("Q", 112, 20);
        ctx.fillText("Q", 112, 60);
        // Overline for QNot
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(98, 48); ctx.lineTo(112, 48);
        ctx.stroke();

        // Bridges
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); ctx.lineTo(20, 20);
        ctx.moveTo(0, 40); ctx.lineTo(20, 40);
        if (comp.type !== 'dff' && comp.type !== 'tff') {
            ctx.moveTo(0, 60); ctx.lineTo(20, 60);
        }
        ctx.moveTo(120, 20); ctx.lineTo(140, 20);
        ctx.moveTo(120, 60); ctx.lineTo(140, 60);
        ctx.stroke();
    }

    drawJunction(ctx, comp) {
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 25); ctx.lineTo(50, 25);
        if (comp.type === 'junc3') {
            ctx.moveTo(25, 25); ctx.lineTo(25, 50);
        } else {
            ctx.moveTo(25, 0); ctx.lineTo(25, 50);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(25, 25, 6, 0, Math.PI*2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawSeg7(ctx, comp) {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 3;
        this.roundRect(ctx, 20, 0, 60, 80, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = comp.displayColor || 'rgb(255,75,75)';
        ctx.font = "bold 52pt 'Seven-Seg', monospace"; // Requires font load
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(comp.displayValue || '0', 50, 40);
    }

    drawLabel(ctx, comp) {
        ctx.fillStyle = '#000';
        let txt = comp.text || "Label";
        ctx.font = "bold 12pt 'JetBrains Mono', monospace";
        let width = ctx.measureText(txt).width + 24;
        this.roundRect(ctx, 0, 0, width, 24, 5);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, 12, 12);
    }

    drawConnector(ctx, conn) {
        let cx = conn.localX;
        let cy = conn.localY;
        
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI*2);
        ctx.fillStyle = this.getColor(conn.value);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colors.border;
        ctx.stroke();

        if (conn.selected) {
            ctx.beginPath();
            ctx.arc(cx, cy, 7, 0, Math.PI*2);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }
}
