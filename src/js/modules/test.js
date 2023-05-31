
let Test = {
	init(APP) {
		// return;

		return setTimeout(() => {
			Projector.file.dispatch({ type: "set-scale", scale: 4, noRender: 1 });
			Projector.file.dispatch({ type: "pan-canvas", top: 0, left: -220 });
		}, 340);

		// return setTimeout(() => $(`.def-desktop_`).trigger("mousedown").trigger("mouseup"), 350);
		
	}
};
