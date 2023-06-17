
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		// defaults
		this._fps = 10;
		this._frameTotal = 0;
		this._stopped = true;
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

	set frameTotal(val) {
		this._frameTotal = val;
	}

	get frameTotal() {
		return this._frameTotal;
	}

	set fps(val) {
		this._fps = val;
	}

	get fps() {
		return this._fps;
	}

	get name() {
		return this._file.base;
	}

	async parseImage() {
		let APP = kalli,
			Proj = Projector,
			xWork = this._file.data.selectSingleNode(`//Project/work`),
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

		// set file FPS
		this._fps = xNode.getAttribute("fps") || 20;

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
		let xScale = xWork ? +xWork.getAttribute("scale") : false,
			scale = xScale || .125;
		if (!xScale) {
			// iterate available zoom levels
			ZOOM.filter(z => z.level <= 100)
				.map(zoom => {
					let testScale = zoom.level / 100;
					if (Proj.aW > width * testScale && Proj.aH > height * testScale) {
						scale = testScale;
					}
				});
		}
		// set file initial scale
		this.dispatch({ type: "scale-at", scale: 1 });
		// auto scale view to file image size
		this.dispatch({ type: "scale-at", scale });
		// pan canvas, if any
		let top = xWork ? +xWork.getAttribute("top") : false,
			left = xWork ? +xWork.getAttribute("left") : false,
			area = xWork ? xWork.getAttribute("area") : false;
		if (!!top || !!left) this.dispatch({ type: "pan-canvas", top, left });

		// auto select area
		if (area) APP.work.els.workArea.find(`.foot .button[data-arg="${area}"]`).trigger("click");
		else this.render({ reset: true, frame: this.cursorLeft });

		// emit event
		karaqu.emit("file-parsed", { file: this });
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

	play(start) {
		let fps = start.fps || this._fps;
		let func = this.play.bind(this);
		if (start.fps) this._stopped = false;
		if (this._stopped) return;

		let frame = this.frameIndex++;
		if (frame >= this.frameTotal) {
			// stop at the end
			return this.stop();
		}
		this.render({ frame });

		this._fps = fps;
		setTimeout(() => requestAnimationFrame(func), 1000 / fps);
	}

	stop() {
		this._stopped = true;
	}

	render(opt={}) {
		let APP = kalli,
			Proj = Projector,
			width = this.oW,
			height = this.oH,
			isPreview = Proj.view == Proj.preview,
			frameIndex = isPreview ? opt.frame : opt.frame-1;
		// reset canvas
		this.cvs.prop({ width, height });

		// render frames history
		if (opt.frame !== undefined) this.frameHistory(frameIndex);

		// update toolbar display
		APP.toolbar.dispatch({ type: "set-display", index: frameIndex });

		if (isPreview) {
			// frames history
			this.ctx.globalCompositeOperation = "source-over";
			this.brushes.map(brush => {
				this.ctx.drawImage(brush.cvs[0], 0, 0, width, height);
			});
			this.ctx.globalCompositeOperation = "source-in";
			// apply image to canvas
			this.ctx.drawImage(this.image, 0, 0, width, height);
		} else {
			// apply image to canvas
			this.ctx.drawImage(this.image, 0, 0, width, height);
			// frames history
			this.ctx.globalCompositeOperation = "source-atop";
			this.brushes.map(brush => {
				this.ctx.drawImage(brush.cvs[0], 0, 0, width, height);
			});
		}

		if (opt.frame !== undefined && !isPreview) {
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
			case "scale-at":
				let newScale = event.scale,
					scaleChange = newScale - this.scale,
					zoomX = event.zoomX != undefined ? event.zoomX : Proj.cX - this.oX,
					zoomY = event.zoomY != undefined ? event.zoomY : Proj.cY - this.oY,
					width = Math.round(this.oW * newScale),
					height = Math.round(this.oH * newScale);
				
				oX = (zoomX / this.scale) * -scaleChange;
				oY = (zoomY / this.scale) * -scaleChange;

				this.scale = event.scale || this.scale;
				this.oX += oX;
				this.oY += oY;
				this.width = width;
				this.height = height;
				// set reference to file
				Proj.file = this;

				if (event.oX && event.oY) {
					this.oX = event.oX;
					this.oY = event.oY;
				}
				// constrainsts
				if (width > Proj.aW && this.oX > 0) this.oX = 0;
				if (height > Proj.aH && this.oY > 0) this.oY = 0;
				if (this.width + this.oX < Proj.aW) this.oX = Proj.aW - this.width;
				if (this.height + this.oY < Proj.aH) this.oY = Proj.aH - this.height;
				// make sure image is centered
				if (width < Proj.aW) this.oX = (Proj.aW - width) * .5;
				if (height < Proj.aH) this.oY = (Proj.aH - height) * .5;
				// get rid of floats
				this.oX = Math.round(this.oX);
				this.oY = Math.round(this.oY);

				// update work area zoom value
				APP.canvas.dispatch({ type: "update-zoom-index", scale: this.scale });
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
				oX = Number.isInteger(event.left)
					? event.left
					: this.width > Proj.aW ? Proj.cX - (this.width >> 1) + event.x : false;
				oY = Number.isInteger(event.top)
					? event.top
					: this.height > Proj.aH ? Proj.cY - (this.height >> 1) + event.y : false;
				if (oX !== false) this.oX = oX;
				if (oY !== false) this.oY = oY;

				// set reference to file
				Proj.file = this;
				// render projector canvas
				Proj.render({ noEmit: event.noEmit });
				// update navigator
				APP.navigator.dispatch({ type: "pan-view-rect", x: this.oX, y: this.oY });
				// update "edit bubble"
				APP.canvas.dispatch({ type: "edit-frame-index", index: this.frameIndex });
				break;
		}
	}
}
