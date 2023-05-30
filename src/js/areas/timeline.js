
// kalli.timeline

{
	init() {
		// fast references
		this.els = {
			timeline: window.find(".row-timeline"),
			playhead: window.find(".row-timeline .play-head"),
			leftBody: window.find(".row-timeline .left .tbl-body"),
			rightBody: window.find(".row-timeline .right .tbl-body"),
		};
		
		// bind event handlers
		this.els.playhead.on("mousedown", this.doHead);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.timeline,
			str,
			el;
		// console.log(event);
		switch (event.type) {
			case "file-parsed":
				str = [];
				// plot frames on timeline
				let brushes = event.file.brushes;
				str.push(`<div class="tbl-row">`);
				str.push(`	<i class="icon-eye-on"></i>`);
				str.push(`	<span>${event.file.name}</span>`);
				str.push(`</div>`);
				// left column
				brushes.map((b, y) => {
					str.push(`<div class="tbl-row brush-row">`);
					str.push(`	<i class="icon-eye-on"></i>`);
					str.push(`	<span>${b.name}</span>`);
					str.push(`</div>`);
				});
				// add html string
				Self.els.leftBody.html(str.join(""));

				str = [];
				// find out start & end of animation
				let minL = 1e3,
					maxW = 0;
				brushes.map(b => { minL = Math.min(b.frames.findIndex(e => !!e), minL); });
				brushes.map(b => { maxW = Math.max(b.frames.length-minL-1, maxW); });
				str.push(`<div class="tbl-row parent-row">`);
				str.push(`<span class="frames" style="--l: ${minL}; --w: ${maxW};"></span>`);
				str.push(`</div>`);
				// iterate brushes
				brushes.map((b, y) => {
					str.push(`<div class="tbl-row">`);
					let fl = b.frames.length-1,
						l = false,
						w = false;
					// iterate frames
					b.frames.map((f, x) => {
						if (f && l === false) l = x;
						if ((!f && l && w === false) || x === fl) w = x - l;
						if (l !== false && w !== false) {
							str.push(`<span class="frames" style="--l: ${l}; --w: ${w}; --c: ${b.color};"></span>`);
							l = false;
							w = false;
						}
					});
					str.push(`</div>`);
				});
				// add html string
				Self.els.rightBody.html(str.join(""));
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
				let el = Self.els.playhead,
					Proj = Projector,
					file = Proj.file;
				// drag object
				Self.drag = {
					el,
					file,
					clickX: +el.prop("offsetLeft") - event.clientX,
					frW: parseInt(Self.els.timeline.cssProp("--frW"), 10),
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
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					frame = parseInt( left / Self.drag.frW, 10 );
				// moves navigator view rectangle
				Drag.el.css({ left });
				// update file 
				Drag.file.render({ frame });
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