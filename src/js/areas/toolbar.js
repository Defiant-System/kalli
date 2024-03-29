
// kalli.toolbar

{
	init() {
		// fast references
		this.els = {
			el: window.find(".win-caption-toolbar_"),
			display: window.find(".toolbar-group_.display"),
			frameCurrent: window.find(`.display .toolbar-field_ .frameCurrent`),
			framesTotal: window.find(`.display .toolbar-field_ .framesTotal`),
			fps: window.find(`.display .toolbar-field_ .fps`),

			btnMove: window.find(`.toolbar-tool_[data-arg="move"]`),
			btnResize: window.find(`.toolbar-tool_[data-arg="resize"]`),
			btnZoomIn: window.find(`.toolbar-tool_[data-arg="zoom-in"]`),
			btnZoomOut: window.find(`.toolbar-tool_[data-arg="zoom-out"]`),

			btnPlay: window.find(`.toolbar-tool_[data-click="play"]`),
			btnRewind: window.find(`.toolbar-tool_[data-click="start-frame"]`),
			btnPrev: window.find(`.toolbar-tool_[data-click="prev-frame"]`),
			btnNext: window.find(`.toolbar-tool_[data-click="next-frame"]`),
			btnForward: window.find(`.toolbar-tool_[data-click="end-frame"]`),
		};

		// subscribe to internal events
		window.on("file-parsed", this.dispatch);

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
			// subscribed events
			case "file-parsed":
				// auto-select canvas tool
				Self.els.btnMove.trigger("click");
				break;
			// custom events
			case "set-display":
				if (event.index !== undefined) Self.els.frameCurrent.html(event.index+1);
				if (event.total !== undefined) Self.els.framesTotal.html(event.total);
				if (event.fps !== undefined) Self.els.fps.html(event.fps).data({ real: event.fps });
				break;
			case "play":
				el = Self.els.btnPlay.find("> span.tool-icon_");
				value = el.hasClass("icon-play") ? "icon-stop" : "icon-play";
				el.removeClass("icon-play icon-stop")
					.addClass(value)
					.css({ "background-image": `url("~/icons/${value}.png")` });
				// start / stop animation
				if (el.hasClass("icon-play")) Projector.file.stop();
				else Projector.file.play();
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
				data = { cL: +APP.timeline.els.timeline.cssProp("--full") - 1 };
				APP.timeline.dispatch({ type: "focus-frame", ...data });
				break;
			case "enable-toolbar":
				Self.els.display.find(".toolbar-field_").removeClass("blank-display");
				Object.keys(Self.els).map(key => Self.els[key].removeClass("tool-disabled_"));
				break;
			case "disable-toolbar":
				Self.els.display.find(".toolbar-field_").addClass("blank-display");
				Object.keys(Self.els).map(key => Self.els[key].addClass("tool-disabled_"));
				break;
			case "activate-tool":
				el = Self.els.el.find(`.toolbar-tool_[data-arg="${event.arg}"]`);
				el.parent().find(".tool-active_").removeClass("tool-active_");
				el.addClass("tool-active_");
				break;
			case "select-tool":
				el = Self.els.el.find(`.toolbar-tool_[data-click="select-tool"][data-arg="${event.arg}"]`);
				if (el.length) return true;
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