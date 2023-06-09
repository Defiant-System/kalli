
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		// defaults
		this._opaque = true;
		this.scale = 1;
		this.width = 0;
		this.height = 0;

		// file canvas
		let { cvs, ctx } = createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// parse image content blob
		this.parseImage();
	}

	get opaque() {
		return this._opaque;
	}

	set opaque(v) {
		this._opaque = v;
		// save value in file data
		this.xImg.setAttribute("opaque", v);
		// re-render view
		Projector.render();
		// return value
		return this._opaque;
	}

	get name() {
		return this._file.base;
	}

	async parseImage() {
		let APP = kalli,
			Proj = Projector,
			xImg = this._file.data.selectSingleNode(`//Project/assets/img`),
			image = await loadImage("~/samples/"+ xImg.getAttribute("src")),
			width = image.width,
			height = image.height;

		// set image dimensions
		this.oW = this.width = width;
		this.oH = this.height = height;
		this.bgColor = xImg.getAttribute("bgColor");
		this._opaque = xImg.getAttribute("opaque") === "1";

		// set default frame index
		let xNode = this._file.data.selectSingleNode(`//Project/timeline`);
		this.cursorTop = xNode.getAttribute("cursorTop") || 1;
		this.cursorLeft = xNode.getAttribute("cursorLeft") || 0;

		// prepare brushes
		this.brushes = xNode.selectNodes(`./brush`).map(xBrush => {
			let canvas = createCanvas(width, height);
			return {
				...canvas,
				name: xBrush.getAttribute("name"),
				color: xBrush.getAttribute("color"),
				frames: JSON.parse(xBrush.getAttribute("frames")),
			};
		});
		// save references for performance
		this.xImg = xImg;
		this.image = image;

		// make sure aW & aH are set
		Proj.dispatch({ type: "window.resize", noRender: 1 });
		// default to first zoom level
		let scale = .125;
		// iterate available zoom levels
		ZOOM.filter(z => z.level <= 100)
			.map(zoom => {
				let testScale = zoom.level / 100;
				if (Proj.aW > width * testScale && Proj.aH > height * testScale) {
					scale = testScale;
				}
			});

		// set file initial scale
		this.dispatch({ type: "set-scale", scale });

		// emit event
		karaqu.emit("file-parsed", { file: this });

		// render image
		this.render({ reset: true, frame: this.cursorLeft });
	}

	frameHistory(index) {
		let width = this.oW,
			height = this.oH,
			tau = Math.PI * 2;
		// update brush masks
		this.brushes.map(brush => {
			// reset canvas
			brush.cvs.prop({ width, height });
			// paint up until frame index
			brush.ctx.fillStyle = brush.color;
			[...brush.frames.slice(0, index)].map(f => {
				if (f) {
					brush.ctx.beginPath();
					brush.ctx.arc(...f, 0, tau);
					brush.ctx.fill();
				}
			});
		});
	}

	render(opt={}) {
		let APP = kalli,
			Proj = Projector,
			width = this.oW,
			height = this.oH;
		// reset canvas
		this.cvs.prop({ width, height });

		// render frames history
		if (opt.frame) this.frameHistory(opt.frame-1);

		// apply image to canvas
		this.ctx.drawImage(this.image, 0, 0, width, height);

		this.ctx.save();
		// frames history
		this.ctx.globalCompositeOperation = "source-atop";
		this.brushes.map(brush => {
			this.ctx.drawImage(brush.cvs[0], 0, 0, width, height);
		});
		this.ctx.restore();

		if (opt.frame) {
			APP.canvas.dispatch({ type: "edit-frame-index", index: opt.frame });
			// save refererce to frame index
			this.frameIndex = opt.frame;
		}
		
		// render file / image
		if (opt.reset) Proj.reset(this);
		Proj.render();
	}

	dispatch(event) {
		let APP = kalli,
			Proj = Projector,
			oX, oY,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "set-scale":
				console.log( event.scale );
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.width = Math.round(this.oW * this.scale);
				this.height = Math.round(this.oH * this.scale);

				// make sure projector is reset
				if (Proj.cX === 0 || Proj.cY === 0) Proj.reset(this);

				// origo
				this.oX = Math.round(Proj.cX - (this.width * .5));
				this.oY = Math.round(Proj.cY - (this.height * .5));

				// update work area zoom value
				APP.work.dispatch({ ...event, type: "update-zoom-value" });

				if (!event.noRender) {
					// render file
					this.render({ reset: true });
				}
				break;
			case "pan-canvas":
				// console.log( event );
				oX = Number.isInteger(event.left)
					? event.left
					: this.width > Proj.aW ? Proj.cX - (this.width >> 1) + event.x : false;
				oY = Number.isInteger(event.top)
					? event.top
					: this.height > Proj.aH ? Proj.cY - (this.height >> 1) + event.y : false;
				if (Number.isInteger(oX)) this.oX = oX;
				if (Number.isInteger(oY)) this.oY = oY;
				// render projector canvas
				Proj.render({ noEmit: event.noEmit });
				// update "edit bubble"
				APP.canvas.dispatch({ type: "edit-frame-index", index: this.frameIndex });
				break;
		}
	}
}
