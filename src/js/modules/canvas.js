
// kalli.canvas

{
	init() {
		// fast references
		this.els = {
			canvas: window.find(`.column-canvas .design`),
		};

		// bind event handlers
		this.els.canvas.on("mousedown", this.pan);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.canvas,
			el;
		// console.log(event);
		switch (event.type) {
			case "change-zoom":
				// min: 25
				// max: 800
				Projector.file.dispatch({ type: "set-scale", scale: event.value / 100 });
				break;
		}
	},
	pan(event) {
		let APP = kalli,
			Self = APP.canvas,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file;
				// dont pan if image fits available area
				if (File.width <= Proj.aW && File.height <= Proj.aH) return;

				Self.drag = {
					clickX: event.clientX - (File.oX - Proj.cX + (File.width >> 1)),
					clickY: event.clientY - (File.oY - Proj.cY + (File.height >> 1)),
					min: {
						x: Proj.aX - Proj.cX + (File.width >> 1),
						y: Proj.aY - Proj.cY + (File.height >> 1),
					},
					max: {
						x: (Proj.cX - Proj.aX - (File.width >> 1)) + 1,
						y: (Proj.cY - Proj.aY - (File.height >> 1)) + 1,
					},
					stop: true,
					_max: Math.max,
					_min: Math.min,
					proj: Proj,
					file: File,
					nav: APP.navigator,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				Drag.x = Drag._max(Drag._min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x);
				Drag.y = Drag._max(Drag._min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				// forward event to file
				Drag.file.dispatch({ ...Drag, type: "pan-canvas", noEmit: true });
				// dispatch event to sidebar navigator
				Drag.nav.dispatch({ ...Drag, type: "pan-view-rect" });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Drag.proj.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
}