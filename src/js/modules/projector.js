
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
	renderFrame(file) {
		// pre-render frame
		let w = file.oW * file.scale,
			h = file.oH * file.scale,
			oX = file.oX || Math.round(this.cX - (w / 2)),
			oY = file.oY || Math.round(this.cY - (h / 2));
		
		// reset canvases
		this.swap.cvs.prop({ width: this.aW, height: this.aH });
		
		this.swap.ctx.fillStyle = "#fff";
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
		this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		this.ctx.drawImage(file.cvs[0], 0, 0, file.width, file.height);
		this.ctx.restore();
	}
};
