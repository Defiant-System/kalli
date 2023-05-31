
@import "./classes/file.js"

@import "./modules/ux.js";
@import "./modules/misc.js"
@import "./modules/color.js"
@import "./modules/projector.js"
@import "./modules/test.js"


const kalli = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
		};

		// init objects
		UX.init();
		Projector.init();

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = kalli,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.resize":
				// forward event
				Projector.dispatch(event);
				Self.assets.dispatch(event);
				Self.timeline.dispatch(event);
				break;

			// custom events
			case "load-sample":
				// opening image file from application package
				event.names.map(async name => {
					// forward event to app
					let file = await Self.work.openLocal(`~/samples/${name}`);
					Self.dispatch({ type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// set up workspace
				Self.dispatch({ type: "setup-workspace" });
				// open file with Files
				Self.work.open(event.file);
				break;
			case "setup-workspace":
				// hide blank view
				Self.els.content.removeClass("show-blank-view");
				// TODO: update toolbar
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "./areas/blank-view.js",
	work: @import "./areas/work.js",
	code: @import "./areas/code.js",
	canvas: @import "./areas/canvas.js",
	preview: @import "./areas/preview.js",
	navigator: @import "./areas/navigator.js",
	timeline: @import "./areas/timeline.js",
	assets: @import "./areas/assets.js",
};

window.exports = kalli;
