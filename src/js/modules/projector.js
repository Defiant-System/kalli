
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
		this.dispatch({ type: "window.resize", noRender: 1 });
	},
	dispatch(event) {
		let APP = kalli,
			Self = Projector,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "window.resize":
				Self.aW = Self.pEl.prop("offsetWidth");
				Self.aH = Self.pEl.prop("offsetHeight");
				Self.cvs.prop({ width: Self.aW, height: Self.aH });

				if (!event.noRender) Self.render();
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
			il = ((cfg.w-lX) / cfg.size) + 1,
			jl = ((cfg.h-lY) / cfg.size) + 1;
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
				ctx.fillStyle = ((i + j) % 2) ? "#bbb" : "#ddd";
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
		// if (file === this.file || !file.image) return;
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
	render(opt={}) {
		// reference to displayed file
		let File = this.file,
			w = File.width,
			h = File.height,
			scale = File.scale,
			oW = File.oW,
			oH = File.oH,
			oX = File.oX,
			oY = File.oY;
		// reset canvas
		this.cvs.prop({ width: this.aW, height: this.aH });

		this.ctx.save();
		// this.ctx.scale(scale, scale);
		this.ctx.translate(oX, oY);

		// drop shadow
		this.ctx.save();
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 5;
		this.ctx.shadowColor = "#555";
		this.ctx.fillRect(0, 0, w, h);
		this.ctx.restore();

		if (!File.opaque) {
			// layer: checkers
			this.drawCheckers(this.ctx, { w, h, size: 12 });
		} else {
			// file bg-color
			this.ctx.fillStyle = File.bgColor;
			this.ctx.fillRect(0, 0, w, h);
		}

		// this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(File.cvs[0], 0, 0, w, h);
		this.ctx.restore();

		if (!opt.noEmit) {
			let events = ["projector-update"];
			if (opt.emit) events.push(opt.emit);
			// emit event
			events.map(type => karaqu.emit(type));
		}
	}
};
