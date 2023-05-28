
// kalli.timeline

{
	init() {
		// fast references
		this.els = {
			playhead: window.find(".row-timeline .play-head"),
		};
		
		// bind event handlers
		this.els.playhead.on("mousedown", this.doHead);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.timeline,
			el;
		// console.log(event);
		switch (event.type) {
			case "custom-event":
				break;
		}
	},
	doHead(head) {
		let APP = kalli,
			Self = APP.timeline,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				let el = Self.els.playhead;
				// drag object
				Self.drag = {
					el,
					// file: Proj.file,
					clickX: +el.prop("offsetLeft") - event.clientX,
					min: { x: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						// w: Proj.aW - Proj.file.width,
						// h: Proj.aH - Proj.file.height,
					},
					_max: Math.max,
					_min: Math.min,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doHead);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x);
				// moves navigator view rectangle
				Drag.el.css({ left });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doHead);
				break;
		}
	}
}