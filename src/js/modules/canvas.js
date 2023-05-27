
// kalli.canvas

{
	init() {
		
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
	}
}