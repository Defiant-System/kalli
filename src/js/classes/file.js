
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		
		// defaults
		this.scale = .125;
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

		// reset canvas
		this.cvs.prop({ width, height });
		// apply image to canvas
		this.ctx.drawImage(image, 0, 0);
		this.img = image;

		// set file initial scale
		this.dispatch({ ...event, type: "set-scale" });

		// render file / image
		Projector.reset(this);
		Projector.render();
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
