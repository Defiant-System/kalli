
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		
		// defaults
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

	async parseImage() {
		let xImg = this._file.data.selectSingleNode(`//Project/img`),
			image = await loadImage("~/samples/"+ xImg.getAttribute("src")),
			width = image.width,
			height = image.height;

		// set image dimensions
		this.oW = this.width = width;
		this.oH = this.height = height;
		// save references for performance
		this.xImg = xImg;
		this.image = image;
		// set file initial scale
		this.dispatch({ ...event, type: "set-scale" });
		// render image
		this.render();
	}

	render(opt={}) {
		let Proj = Projector,
			bgColor = this.xImg.getAttribute("bg"),
			width = this.width,
			height = this.height;
		// reset canvas
		this.cvs.prop({ width, height });

		if (!bgColor || bgColor === "transparent") {
			// layer: checkers
			Proj.drawCheckers(this.ctx, { w: this.oW, h: this.oH });
		} else {
			// layer: checkers
			this.ctx.fillStyle = bgColor;
			this.ctx.fillRect(0, 0, width, height);
		}

		// apply image to canvas
		this.ctx.drawImage(this.image, 0, 0);

		// render file / image
		Proj.reset(this);
		Proj.render();
	}

	dispatch(event) {
		let APP = kalli,
			Proj = Projector,
			el;
		//console.log(event);
		switch (event.type) {
			// custom events
			case "set-scale":
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.width = this.oW * this.scale;
				this.height = this.oH * this.scale;

				// origo
				this.oX = Math.round(Proj.cX - (this.width / 2));
				this.oY = Math.round(Proj.cY - (this.height / 2));
				break;
		}
	}
}
