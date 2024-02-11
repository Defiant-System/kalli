
let Test = {
	init(APP) {

		// return;

		return setTimeout(() => APP.toolbar.els.btnResize.trigger("click"), 500);

		return setTimeout(() => Projector.file.toBlob(), 500);

		// return setTimeout(() => window.find(".tbl-row:nth(0) .row-color").trigger("click"), 500);

		// return setTimeout(() => {
		// 	$(".menubar-group_:nth(0) .menubar-menu_:nth-child(4)").trigger("mousedown");
		// }, 350);

		return setTimeout(() => {
			APP.canvas.dispatch({ type: "select-tool", arg: "zoom-in" });

			setTimeout(() => {
				let el = APP.canvas.els.area.find(".brush"),
					ev = {
						type: "mousedown",
						target: el[0],
						layerY: 300,
						layerX: 200,
						preventDefault() {}
					};
				APP.canvas.move(ev);
			}, 200);
		}, 350);

		return setTimeout(() => {
			// let cursor = { row: 1, left: 9, width: 26 };
			// let cursor = { row: 1, left: 9, width: 6 };
			// let cursor = { row: 1, left: 3, width: 16 };
			let cursor = { row: 1, left: 3, width: 3 };
			// let cursor = { row: 1, left: 2, width: 4 };
			APP.timeline.dispatch({ type: "select-frames", cursor });


			setTimeout(() => APP.timeline.dispatch({ type: "delete-frames" }), 100);

		}, 350);


		return setTimeout(() => {
			let data;
			// after
			data = {
				src: { y: 1, x: 4, w: 8 },
				cut: { x: 6, w: 6 },
			};

			// before
			data = {
				src: { y: 1, x: 4, w: 8 },
				cut: { x: 4, w: 3 },
			};

			// // middle
			// data = {
			// 	src: { y: 1, x: 4, w: 8 },
			// 	cut: { x: 6, w: 3 },
			// };

			APP.timeline.dispatch({ type: "splice-frames", data });

			setTimeout(() => APP.timeline.dispatch({ type: "merge-frames" }), 100);
		}, 350);

		// setTimeout(() => window.find(`.toolbar-tool_[data-arg="move"]`).trigger("click"), 350);
		// setTimeout(() => window.find(`.toolbar-tool_[data-click="play"]`).trigger("click"), 350);
		// setTimeout(() => window.find(`.toolbar-tool_[data-click="play"]`).trigger("click"), 2000);

		// return setTimeout(() => APP.els.content.find(`.button[data-arg="code"]`).trigger("click"), 350);
		// return setTimeout(() => APP.els.content.find(`.button[data-arg="canvas"]`).trigger("click"), 850);
		// return setTimeout(() => APP.els.content.find(".icon-eye-on:nth(0)").trigger("click"), 350);

		// return setTimeout(() => APP.els.content.find(".icon-maxi").trigger("click"), 350);


		// return setTimeout(() => {
		// 	window.find(".block-samples .sample:nth(0)").trigger("click");
		// }, 100);


		// return setTimeout(() => {
		// 	APP.els.content.find(`.button[data-arg="code"]`).trigger("click");
		// 	// highlight code view
		// 	hljs.highlightAll();
		// }, 340);
		

		
	},
	zoom() {
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
	}
};
