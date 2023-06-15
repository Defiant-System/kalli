
// kalli.work

{
	init() {
		// fast references
		this.els = {
			workArea: window.find(".column-canvas > .area"),
			btnZoom: window.find(".button.zoom"),
		};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.work,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "update-zoom-value":
				value = Math.round(event.scale * 100);
				Self.els.btnZoom.find(".value").html(value);
				break;
			case "switch-view":
				// update buttons
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");
				// notify area of switch
				APP[event.el.data("arg")].dispatch({ type: "switch-init-event" });
				// updat work area
				APP.els.content
					.removeClass("show-canvas show-preview show-code")
					.addClass(`show-${event.el.data("arg")}`);
				break;
		}
	},
	open(fsFile) {
		// create file
		let file = new File(fsFile);

		// Projector.reset(file);
	},
	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;

					let reader = new FileReader();
					reader.addEventListener("load", () => {
						// this will then display a text file
						file.data = $.xmlFromString(reader.result);
						resolve(file);
					}, false);
					reader.readAsText(blob);
				})
				.catch(err => reject(err));
		});
	}
}