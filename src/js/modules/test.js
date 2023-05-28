
let Test = {
	init(APP) {

		return setTimeout(() => {
			Projector.file.dispatch({ type: "set-scale", scale: 4 });
			Projector.file.dispatch({ type: "pan-canvas", top: 100, left: 100 });
		}, 300);

		return;

		// return setTimeout(() => $(`.def-desktop_`).trigger("mousedown").trigger("mouseup"), 350);
		
	}
};
