
// kalli.navigator

{
	init() {
		// fast references
		this.doc = $(document);
		this.els = {
			zoomRect: window.find(".area.navigator .body > div"),
		};
		
		// bind event handlers
		this.els.zoomRect.on("mousedown", this.pan);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.navigator,
			el;
		// console.log(event);
		switch (event.type) {
			case "custom-event":
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
	}
}