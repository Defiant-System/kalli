
function createCanvas(w, h) {
	let cvs = $(document.createElement("canvas")),
		ctx = cvs[0].getContext("2d", { willReadFrequently: true });
	cvs.prop({ width: w || 1, height: h || 1 });
	return { cvs, ctx };
}

function loadImage(url) {
	return new Promise(resolve => {
		let img = new Image;
		img.src = url;
		img.onload = () => resolve(img);
	})
}
