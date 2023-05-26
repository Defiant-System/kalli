
const Projector = {
	init() {
		// fast references
		this.doc = $(document);
		this.cvs = window.find(`.column-canvas .design`);
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		this.pEl = this.cvs.parent();
		// publicly used swap canvas
		this.swap = createCanvas(1, 1);
		// calc available dimensions
		this.reset();
		// auto "resize" canvas
		this.dispatch({ type: "window.resize" });
	},
	dispatch(event) {
		let APP = kalli,
			Self = Projector,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "window.resize":
				this.aW = Self.pEl.prop("offsetWidth");
				this.aH = Self.pEl.prop("offsetHeight");
				Self.cvs.prop({ width: this.aW, height: this.aH });
				break;
		}
	},
	pan(event) {
		let APP = kalli,
			Self = APP.navigator,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	},
	drawCheckers(ctx, opt) {
		let cfg = {
				size: 8,
				pX: 0, pY: 0,
				oX: 0, oY: 0,
				x:  0, y:  0,
				w: 16, h: 16,
				...opt,
			},
			lX = cfg.w % cfg.size,
			lY = cfg.h % cfg.size,
			il = (cfg.w-lX) / cfg.size,
			jl = (cfg.h-lY) / cfg.size;
		ctx.save();
		if (cfg.oX < 0) {
			cfg.pX = cfg.oX % cfg.size;
			cfg.x = (cfg.pX - cfg.oX) / cfg.size;
			il = (il-lX) - cfg.x;
		}
		if (cfg.oY < 0) {
			cfg.pY = cfg.oY % cfg.size;
			cfg.y = (cfg.pY - cfg.oY) / cfg.size;
			jl = (jl-lY) - cfg.y;
		}
		for (let i=cfg.x; i<il; i++) {
			for (let j=cfg.y; j<jl; j++) {
				ctx.fillStyle = ((i + j) % 2) ? "#bbb" : "#fff";
				let x = i * cfg.size + cfg.pX,
					y = j * cfg.size + cfg.pY,
					w = cfg.size,
					h = cfg.size;
				if (i === il-1) w = lX || cfg.size;
				if (j === jl-1) h = lY || cfg.size;
				ctx.fillRect(x, y, w, h);
			}
		}
		ctx.restore();
	},
	renderFrame(file) {
		// pre-render frame
		let w = file.oW * file.scale,
			h = file.oH * file.scale,
			oX = file.oX || Math.round(this.cX - (w / 2)),
			oY = file.oY || Math.round(this.cY - (h / 2));
		
		// reset canvases
		this.swap.cvs.prop({ width: this.aW, height: this.aH });
		
		this.swap.ctx.fillStyle = "#222";
		this.swap.ctx.shadowOffsetX = 0;
		this.swap.ctx.shadowOffsetY = 3;
		this.swap.ctx.shadowBlur = 13;
		this.swap.ctx.shadowColor = "#999";
		this.swap.ctx.fillRect(oX, oY, w, h);
		this.frame = this.swap.ctx.getImageData(0, 0, this.aW, this.aH);
	},
	reset(file) {
		// reference to displayed file
		this.file = file || this.file;
		// available dimensions
		this.aX = 0;
		this.aY = 0;
		this.aW = this.pEl.prop("offsetWidth");
		this.aH = this.pEl.prop("offsetHeight");
		// center
		this.cX = this.aW / 2;
		this.cY = this.aH / 2;
		// pre-render frame
		if (this.file) this.renderFrame(this.file);
	},
	render(opt) {
		// reference to displayed file
		let file = this.file;
		// reset canvas
		this.cvs.prop({ width: this.aW, height: this.aH });

		this.ctx.save();
		// this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		console.log(file.oX, file.oY);
		this.ctx.drawImage(file.cvs[0], 0, 0, file.width, file.height);
		this.ctx.restore();
	}
};
