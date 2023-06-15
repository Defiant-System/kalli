
// kalli.preview

{
	init() {
		// defaults
		this.view = {};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.preview,
			Proj = Projector,
			File = Proj.file,
			el;
		// console.log(event);
		switch (event.type) {
			case "switch-enter-event":
				// reset projector scale
				let scale = Self.view.scale || 1;
				File.dispatch({ type: "scale-at", scale });
				// reset projector pan file
				let top = Self.view.top || File.oY,
					left = Self.view.left || File.oX;
				File.dispatch({ type: "pan-canvas", top, left });
				// switch projector "lens"
				Proj.dispatch({ type: "switch-view", view: "preview" });
				break;
			case "switch-exit-event":
				// remeber view info
				Self.view.scale = File.scale;
				Self.view.top = File.oY;
				Self.view.left = File.oX;
				break;
		}
	}
}