
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile;
		
		// defaults
		this.scale = 1;
		this.width = 0;
		this.height = 0;

		// let xNode = this._file.data.selectSingleNode(`//Project/timeline/brush`);
		// this.frames = JSON.parse(xNode.getAttribute("frames"));

		// file canvas
		let { cvs, ctx } = createCanvas(1, 1);
		this.cvs = cvs;
		this.ctx = ctx;

		// parse image content blob
		this.parseImage();
	}

	async parseImage() {
		let xImg = this._file.data.selectSingleNode(`//Project/assets/img`),
			image = await loadImage("~/samples/"+ xImg.getAttribute("src")),
			width = image.width,
			height = image.height;

		// set image dimensions
		this.oW = this.width = width;
		this.oH = this.height = height;
		this.bgColor = xImg.getAttribute("bgColor");

		// prepare brushes
		this.brushes = this._file.data.selectNodes(`//Project/timeline/brush`).map(xBrush => {
			let canvas = createCanvas(width, height);
			return {
				...canvas,
				color: xBrush.getAttribute("color"),
				frames: JSON.parse(xBrush.getAttribute("frames")),
			};
		});

		// save references for performance
		this.xImg = xImg;
		this.image = image;
		// set file initial scale
		this.dispatch({ ...event, type: "set-scale", scale: 1 });

		// temp
		this.frameIndex(55);

		// render image
		this.render();
	}

	frameIndex(index) {
		let width = this.width,
			height = this.height,
			pi2 = Math.PI * 2;
		// update brush masks
		this.brushes.map(brush => {
			// reset canvas
			brush.cvs.prop({ width, height });
			// paint up until frame index
			brush.ctx.fillStyle = brush.color;
			[...brush.frames.slice(0, index)].map(f => {
				if (f) {
					brush.ctx.beginPath();
					brush.ctx.arc(...f, 0, pi2);
					brush.ctx.fill();
				}
			});
		});
	}

	render(opt={}) {
		let Proj = Projector,
			bgColor = this.xImg.getAttribute("bg"),
			width = this.width,
			height = this.height;
		// reset canvas
		this.cvs.prop({ width, height });

		this.ctx.save();

		// apply image to canvas
		this.ctx.globalCompositeOperation = "source-over";
		this.ctx.drawImage(this.image, 0, 0, width, height);

		// previous frames
		this.ctx.globalCompositeOperation = "source-atop";
		this.brushes.map(brush => {
			this.ctx.drawImage(brush.cvs[0], 0, 0, width, height);
		});

		this.ctx.restore();

		// current frame
		// this.ctx.globalCompositeOperation = "source-over";

		// render file / image
		Proj.reset(this);
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
				// scaled dimension
				this.scale = event.scale || this.scale;
				this.width = Math.round(this.oW * this.scale);
				this.height = Math.round(this.oH * this.scale);

				// origo
				this.oX = Math.round(Proj.cX - (this.width >> 1));
				this.oY = Math.round(Proj.cY - (this.height >> 1));

				if (!event.noRender) {
					// render file
					this.render();
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
				break;
		}
	}
}
