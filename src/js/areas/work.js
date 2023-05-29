
// kalli.work

{
	init() {
		// fast references
		this.els = {
			workArea: window.find(".column-canvas > .area"),
		};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.work,
			el;
		// console.log(event);
		switch (event.type) {
			case "switch-view":
				// update buttons
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");
				// updat work area
				Self.els.workArea
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