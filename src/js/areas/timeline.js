
// kalli.timeline

{
	init() {
		// fast references
		this.els = {
			timeline: window.find(".row-timeline"),
			playhead: window.find(".row-timeline .play-head"),
			leftBody: window.find(".row-timeline .left .tbl-body"),
			frameCount: window.find(".row-timeline .frame-count ul"),
			rightBody: window.find(".row-timeline .right .tbl-body"),
			rScrTrack: window.find(".row-timeline .bg-scrollbar.right .scroll-track"),
			rScrBar: window.find(".row-timeline .bg-scrollbar.right .scroll-bar"),
			bScrTrack: window.find(".row-timeline .bg-scrollbar.bottom .scroll-track"),
			bScrBar: window.find(".row-timeline .bg-scrollbar.bottom .scroll-bar"),
		};
		
		// bind event handlers
		this.els.playhead.on("mousedown", this.doHead);

		// subscribe to internal events
		karaqu.on("file-parsed", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.timeline,
			full,
			value,
			str,
			el;
		// console.log(event);
		switch (event.type) {
			case "window.keystroke":
				// moves cursor
				switch (event.char) {
					case "up":
						value = +Self.els.timeline.cssProp("--cT");
						value = Math.max(1, value - 1);
						Self.els.timeline.css({ "--cT": value });
						break;
					case "down":
						value = +Self.els.timeline.cssProp("--cT");
						value = Math.min(Projector.file.brushes.length, value + 1);
						Self.els.timeline.css({ "--cT": value });
						break;
					case "left":
						value = +Self.els.timeline.cssProp("--cL");
						value = Math.max(0, value - 1);
						Self.els.timeline.css({ "--cL": value });
						break;
					case "right":
						full = +Self.els.timeline.cssProp("--full");
						value = +Self.els.timeline.cssProp("--cL");
						value = Math.min(full, value + 1);
						Self.els.timeline.css({ "--cL": value });
						break;
				}
				break;
			// subscribed events
			case "file-parsed":
				str = [];
				// plot frames on timeline
				let brushes = event.detail.file.brushes;
				str.push(`<div class="tbl-row">`);
				str.push(`	<i class="icon-eye-on"></i>`);
				str.push(`	<span>${event.detail.file.name}</span>`);
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
				// update full width detail
				Self.els.timeline.css({ "--full": minL + maxW });
				// add html string
				Self.els.rightBody.find(".tbl-row").remove();
				Self.els.rightBody.append(str.join(""));
				// frame counters
				str = [...Array(parseInt((minL + maxW) / 10, 10) + 1)].map(a => `<li></li>`);
				Self.els.frameCount.append(str.join(""));
				// calculate scrollbars
				Self.dispatch({ type: "update-scrollbars" });
				break;
			case "window.resize":
			case "update-scrollbars":
				let oW = Self.els.rightBody.prop("offsetWidth"),
					oH = Self.els.rightBody.prop("offsetHeight"),
					sW = Self.els.rightBody.prop("scrollWidth"),
					sH = Self.els.rightBody.prop("scrollHeight"),
					hScroll = Self.els.rScrTrack.prop("offsetHeight"),
					wScroll = Self.els.bScrTrack.prop("offsetWidth"),
					height = (oH / sH) * hScroll,
					width = (oW / sW) * wScroll;
				Self.els.rScrBar.css({ height }).toggleClass("hidden", hScroll !== height);
				Self.els.bScrBar.css({ width }).toggleClass("hidden", wScroll !== width);
				break;
			case "select-frame":
				let rW = parseInt(Self.els.timeline.cssProp("--frW"), 10),
					rH = parseInt(Self.els.timeline.cssProp("--rowH"), 10),
					offset = event.offset(".tbl-body");
				Self.els.timeline.css({
					"--cT": parseInt(offset.y / rH, 10),
					"--cL": parseInt(offset.x / rW, 10),
				});
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