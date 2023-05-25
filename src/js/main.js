
const kalli = {
	init() {
		// fast references
		this.content = window.find("content");
	},
	dispatch(event) {
		switch (event.type) {
			case "window.init":
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = kalli;
