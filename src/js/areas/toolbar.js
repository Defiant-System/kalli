
// kalli.toolbar

{
	init() {
		// fast references
		this.els = {
			frameCurrent: window.find(`.toolbar-field_ .fCurrent`),
			frameTotal: window.find(`.toolbar-field_ .fTotal`),
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
			data,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "set-display":
				if (event.index !== undefined) Self.els.frameCurrent.html(event.index);
				if (event.total !== undefined) Self.els.frameTotal.html(event.total);
				break;
			case "play":
				el = Self.els.btnPlay.find("> span.tool-icon_");
				value = el.hasClass("icon-play") ? "icon-stop" : "icon-play";
				el.removeClass("icon-play icon-stop")
					.addClass(value)
					.css({ "background-image": `url("~/icons/${value}.png")` });
				break;
			case "prev-frame":
				data = { cL: +APP.timeline.els.timeline.cssProp("--cL") };
				data.cL = Math.max(0, data.cL - 1);
				APP.timeline.dispatch({ type: "focus-frame", ...data });
				break;
			case "next-frame":
				data = {
					full: +APP.timeline.els.timeline.cssProp("--full"),
					cL: +APP.timeline.els.timeline.cssProp("--cL"),
				};
				data.cL = Math.min(data.full, data.cL + 1);
				APP.timeline.dispatch({ type: "focus-frame", ...data });
				break;
			case "start-frame":
				data = { cL: 0 };
				APP.timeline.dispatch({ type: "focus-frame", ...data });
				break;
			case "end-frame":
				data = { cL: +APP.timeline.els.timeline.cssProp("--full") };
				APP.timeline.dispatch({ type: "focus-frame", ...data });
				break;
		}
	}
}