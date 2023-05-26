
@import "./classes/file.js"


const kalli = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// init objects
		Projector.init();

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));
	},
	dispatch(event) {
		switch (event.type) {
			case "window.init":
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	code: @import "./modules/code.js",
	canvas: @import "./modules/canvas.js",
	preview: @import "./modules/preview.js",
	navigator: @import "./modules/navigator.js",
	timeline: @import "./modules/timeline.js",
	assets: @import "./modules/assets.js",
};

window.exports = kalli;
