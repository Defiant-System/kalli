
// kalli.toolbar

{
	init() {
		// fast references
		this.els = {
			display: window.find(".toolbar-group_.display"),
			frameCurrent: window.find(`.display .toolbar-field_ .frameCurrent`),
			framesTotal: window.find(`.display .toolbar-field_ .framesTotal`),
			fps: window.find(`.display .toolbar-field_ .fps`),
			btnPlay: window.find(`.toolbar-tool_[data-click="play"]`),
			btnRewind: window.find(`.toolbar-tool_[data-click="start-frame"]`),
			btnPrev: window.find(`.toolbar-tool_[data-click="prev-frame"]`),
			btnNext: window.find(`.toolbar-tool_[data-click="next-frame"]`),
			btnForward: window.find(`.toolbar-tool_[data-click="end-frame"]`),
		};

		// bind event handler
		this.els.display.on("mousedown", ".fps", this.doDisplayFPS);
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
				if (event.index !== undefined) Self.els.frameCurrent.html(event.index+1);
				if (event.total !== undefined) Self.els.framesTotal.html(event.total);
				if (event.fps !== undefined) Self.els.fps.html(event.fps);
				break;
			case "play":
				el = Self.els.btnPlay.find("> span.tool-icon_");
				value = el.hasClass("icon-play") ? "icon-stop" : "icon-play";
				el.removeClass("icon-play icon-stop")
					.addClass(value)
					.css({ "background-image": `url("~/icons/${value}.png")` });

				if (el.hasClass("icon-play")) Projector.file.stop();
				else {
					let fps = Projector.file.fps || 30;
					Projector.file.play({ fps });
				}
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
			case "enable-toolbar":
				Object.keys(Self.els).map(key => Self.els[key].addClass("tool-disabled_"));
				break;
			case "disable-toolbar":
				Object.keys(Self.els).map(key => Self.els[key].removeClass("tool-disabled_"));
				break;
		}
	},
	doDisplayFPS(event) {
		let APP = kalli,
			Self = APP.toolbar,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let el = $(this),
					file = Projector.file,
					value = file.fps,
					clickY = value + event.clientY,
					limit = { min: 5, max: 60, },
					min_ = Math.min,
					max_ = Math.max;
				Self.drag = { el, file, clickY, value, limit, min_, max_ };

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("hide-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doDisplayFPS);
				break;
			case "mousemove":
				// fps value limitations
				let fps = Drag.min_(Drag.max_(Drag.clickY - event.clientY, Drag.limit.min), Drag.limit.max);
				Drag.el.html(fps);
				// apply to file
				Drag.file.fps = fps;
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("hide-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doDisplayFPS);
				break;
		}
	}
}