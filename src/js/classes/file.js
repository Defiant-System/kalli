
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
			cX, cY,
			oX, oY,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "scale-at":
				// cX = Proj.aW * .5;
				// cY = Proj.aH * .5;

				let newScale = event.scale,
					scaleChange = newScale - this.scale,
					zoomX = event.zoomX || ((Proj.aW * .5) - this.oX),
					zoomY = event.zoomY || ((Proj.aH * .5) - this.oY),
					width = Math.round(this.oW * newScale),
					height = Math.round(this.oH * newScale);
				
				oX = (zoomX / this.scale) * -scaleChange;
				oY = (zoomY / this.scale) * -scaleChange;
				// if (height > Proj.aH) oY = Math.min(oY, 0);
				// if (width > Proj.aW) oX = Math.min(oX, 0);

				console.log( zoomX, zoomY );
				// console.log( this.oW, this.oH );
				// console.log( oX, oY );
				// console.log( this.oX, this.oY );
				// console.log( width, height );
				
				// 296, 250

				this.scale = event.scale || this.scale;
				this.oX += oX;
				this.oY += oY;
				this.width = width;
				this.height = height;

				// update work area zoom value
				APP.work.dispatch({ type: "update-zoom-value", scale: this.scale });
				// update navigator
				APP.navigator.dispatch({ type: "pan-view-rect", x: this.oX, y: this.oY });

				if (!event.noRender) {
					// render file
					this.render({ frame: this.cursorLeft });
				}
				break;
			case "set-scale":
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.width = Math.round(this.oW * this.scale);
				this.height = Math.round(this.oH * this.scale);

				// make sure projector is reset
				if (Proj.cX === 0 || Proj.cY === 0) Proj.reset(this);

				cX = Math.round(Proj.cX - (this.width * .5));
				cY = Math.round(Proj.cY - (this.height * .5));

				// origo
				this.oX = cX;
				this.oY = cY;

				// update work area zoom value
				APP.work.dispatch({ type: "update-zoom-value", scale: this.scale });
				// update navigator
				APP.navigator.dispatch({ type: "pan-view-rect", x: this.oX, y: this.oY });

				if (!event.noRender) {
					// render file
					this.render({ frame: this.cursorLeft });
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
				if (oX !== false) this.oX = oX;
				if (oY !== false) this.oY = oY;
				// render projector canvas
				Proj.render({ noEmit: event.noEmit });
				// update "edit bubble"
				APP.canvas.dispatch({ type: "edit-frame-index", index: this.frameIndex });
				break;
		}
	}
}
