
let Test = {
	init(APP) {
		return;

		return setTimeout(() => {
			Projector.file.dispatch({ type: "set-scale", scale: 4, noRender: 1 });
			Projector.file.dispatch({ type: "pan-canvas", top: 50, left: -300 });
		}, 300);

		// return setTimeout(() => $(`.def-desktop_`).trigger("mousedown").trigger("mouseup"), 350);
		
	}
};
