
let Test = {
	init(APP) {

		// return;

		// return setTimeout(() => APP.els.content.find(".icon-maxi").trigger("click"), 350);
		// return setTimeout(() => window.find(".tbl-row:nth(0) .row-color").trigger("click"), 350);


		// return setTimeout(() => {
		// 	window.find(".block-samples .sample:nth(0)").trigger("click");
		// }, 100);


		// return setTimeout(() => {
		// 	APP.els.content.find(`.button[data-arg="code"]`).trigger("click");
		// 	// highlight code view
		// 	hljs.highlightAll();
		// }, 340);

		return setTimeout(() => {
			// Projector.file.dispatch({ type: "set-scale", scale: 2 });
			// Projector.file.dispatch({ type: "pan-canvas", x: 54.5, y: 95.5 });
			// APP.navigator.dispatch({ type: "pan-view-rect", x: 54.5, y: 95.5 });

			let scale = 2,
				viewX = Projector.aW * .5,
				viewY = Projector.aH * .5;
			setTimeout(() => Projector.file.dispatch({ type: "scale-at", viewX, viewY, scale }), 700);
			// setTimeout(() => APP.els.content.find(".icon-maxi").trigger("click"), 100);
			
		}, 350);

		return setTimeout(() => {
			let drag = { top: 0, left: -484 };
			Projector.file.dispatch({ type: "set-scale", scale: 4, noRender: 1 });
			Projector.file.viewPan(drag);
			APP.navigator.dispatch({ type: "pan-view-rect", ...drag });

			// APP.work.els.workArea.find(".zoom").trigger("click");
		}, 350);

		// return setTimeout(() => $(`.def-desktop_`).trigger("mousedown").trigger("mouseup"), 350);
		
	}
};
