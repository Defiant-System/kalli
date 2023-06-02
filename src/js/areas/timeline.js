
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
			data,
			full,
			value,
			str,
			el;
		// console.log(event);
		switch (event.type) {
			case "window.keystroke":
				data = {
					cT: +Self.els.timeline.cssProp("--cT"),
					cL: +Self.els.timeline.cssProp("--cL"),
				};
				// moves cursor
				switch (event.char) {
					case "up":
						data.cT = Math.max(1, data.cT - 1);
						Self.dispatch({ type: "focus-frame", ...data });
						break;
					case "down":
						data.cT = Math.min(Projector.file.brushes.length, data.cT + 1);
						Self.dispatch({ type: "focus-frame", ...data });
						break;
					case "left":
						data.cL = Math.max(0, data.cL - 1);
						Self.dispatch({ type: "focus-frame", ...data });
						break;
					case "right":
						full = +Self.els.timeline.cssProp("--full");
						data.cL = Math.min(full, data.cL + 1);
						Self.dispatch({ type: "focus-frame", ...data });
						break;
				}
				break;
			// subscribed events
			case "file-parsed":
				str = [];
				// plot frames on timeline
				let brushes = event.detail.file.brushes;
				str.push(`<div class="tbl-row">`);
				str.push(`	<span>${event.detail.file.name}</span>`);
				str.push(`</div>`);
				// left column
				brushes.map((b, y) => {
					str.push(`<div class="tbl-row brush-row">`);
					str.push(`	<i class="icon-eye-on"></i>`);
					str.push(`	<span>${b.name}</span>`);
					str.push(`	<i class="icon-trashcan"></i>`);
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
				// auto focus on frame "1,0"
				Self.dispatch({ type: "focus-frame", cT: 1, cL: 0 });
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
				Self.dispatch({
					type: "focus-frame",
					cT: parseInt(offset.y / rH, 10),
					cL: parseInt(offset.x / rW, 10),
				});
				break;
			case "focus-frame":
				Self.els.timeline.css({ "--cT": event.cT, "--cL": event.cL });
				Self.els.leftBody.find(".active").removeClass("active");
				Self.els.leftBody.find(`.tbl-row:nth(${event.cT})`).addClass("active");
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