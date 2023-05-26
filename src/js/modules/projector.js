
const Projector = {
	init() {
		
	},
	dispatch(event) {
		let APP = kalli,
			Self = Projector,
			el;

		switch (event.type) {
			// native events
			case "custome-event":
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
