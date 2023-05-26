
const Projector = {
	init() {
		// fast references
		this.doc = $(document);
		this.cvs = window.find(`.area.canvas .canvas`);
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		// auto "resize" canvas
		this.dispatch({ type: "window.resize" });
	},
	dispatch(event) {
		let APP = kalli,
			Self = Projector,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "window.resize":
				let pEl = Self.cvs.parent(),
					width = pEl.prop("offsetWidth"),
					height = pEl.prop("offsetHeight");
				Self.cvs.prop({ width, height });
				break;
		}
	},
	pan(event) {
		let APP = kalli,
			Self = APP.navigator,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	},
	render(opt) {
		
	}
};
