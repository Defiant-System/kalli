
// kalli.toolbar

{
	init() {
		// fast references
		this.els = {
			btnPlay: window.find(`.toolbar-tool_[data-click="play"]`),
			btnRewind: window.find(`.toolbar-tool_[data-click="start-frame"]`),
			btnPrev: window.find(`.toolbar-tool_[data-click="prev-frame"]`),
			btnNext: window.find(`.toolbar-tool_[data-click="next-frame"]`),
			btnForward: window.find(`.toolbar-tool_[data-click="end-frame"]`),
		};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.toolbar,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "play":
				el = Self.els.btnPlay.find("> span.tool-icon_");
				value = el.hasClass("icon-play") ? "icon-stop" : "icon-play";
				el.removeClass("icon-play icon-stop")
					.addClass(value)
					.css({ "background-image": `url("~/icons/${value}.png")` });
				break;
			case "start-frame": break;
			case "prev-frame": break;
			case "next-frame": break;
			case "end-frame": break;
		}
	}
}