
let Test = {
	init(APP) {

		// setTimeout(() => window.find(`.toolbar-tool_[data-click="play"]`).trigger("click"), 350);
		// setTimeout(() => window.find(`.toolbar-tool_[data-click="play"]`).trigger("click"), 2000);

		return;

		// return setTimeout(() => APP.els.content.find(`.button[data-arg="code"]`).trigger("click"), 350);
		// return setTimeout(() => APP.els.content.find(`.button[data-arg="canvas"]`).trigger("click"), 850);
		// return setTimeout(() => APP.els.content.find(".icon-eye-on:nth(0)").trigger("click"), 350);

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

			setTimeout(() =>
				Projector.file.dispatch({
					type: "scale-at",
					zoomX: 212,
					zoomY: 282,
					scale: 4
				}), 500);

			setTimeout(() => APP.els.content.find(".icon-mini").trigger("click"), 1000);
			// return setTimeout(() => Projector.file.dispatch({ type: "scale-at", scale: 4 }), 1000);

			return;

			return setTimeout(() =>
				Projector.file.dispatch({
					type: "scale-at",
					zoomX: 296,
					zoomY: 162,
					scale: 4
				}), 1000);

			// return setTimeout(() =>
			// 	Projector.file.dispatch({
			// 		type: "scale-at",
			// 		zoomX: 296,
			// 		zoomY: 323,
			// 		scale: 4
			// 	}), 1000);

			return;


			let zoomX = Projector.aW * .5,
				zoomY = Projector.aH * .71;
			setTimeout(() => Projector.file.dispatch({ type: "scale-at", zoomX, zoomY, scale: 2 }), 700);
			
			// setTimeout(() => APP.els.content.find(".icon-maxi").trigger("click"), 700);
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
