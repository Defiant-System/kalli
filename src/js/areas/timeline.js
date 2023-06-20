
// kalli.timeline

{
	init() {
		// fast references
		this.els = {
			timeline: window.find(".row-timeline"),
			playhead: window.find(".row-timeline .play-head"),
			cursor: window.find(".row-timeline .right .cursor"),
			frameCount: window.find(".row-timeline .frame-count ul"),
			leftBody: window.find(".row-timeline .left .tbl-body"),
			rightBody: window.find(".row-timeline .right .tbl-body"),
			rScrTrack: window.find(".row-timeline .bg-scrollbar.right .scroll-track"),
			rScrBar: window.find(".row-timeline .bg-scrollbar.right .scroll-bar"),
			bScrTrack: window.find(".row-timeline .bg-scrollbar.bottom .scroll-track"),
			bScrBar: window.find(".row-timeline .bg-scrollbar.bottom .scroll-bar"),
		};
		
		// bind event handlers
		this.els.rightBody.on("mousedown", this.doFrames);
		this.els.playhead.on("mousedown", this.doHead);

		// subscribe to internal events
		karaqu.on("file-parsed", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.timeline,
			Proj = Projector,
			brushes,
			offset,
			data,
			full,
			value,
			rW, rH,
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
						data.cT = Math.min(Proj.file.brushes.length, data.cT + 1);
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
				brushes = event.detail.file.brushes;
				let bgColor = event.detail.file.bgColor,
					opaque = event.detail.file.opaque ? "" : "icon-eye-off";
				str.push(`<div class="tbl-row">`);
				str.push(`	<b class="row-color" data-click="show-timeline-row-colors" style="--color: ${bgColor}"></b>`);
				str.push(`	<i class="icon-eye-on ${opaque}" data-click="toggle-visibility"></i>`);
				str.push(`	<span>${event.detail.file.name}</span>`);
				str.push(`</div>`);
				// left column
				brushes.map((b, y) => {
					let isLocked = brushes.length === 1 ? "locked" : "";
					str.push(`<div class="tbl-row brush-row ${isLocked}">`);
					str.push(`	<b class="row-color" data-click="show-timeline-row-colors" style="--color: ${b.color}"></b>`);
					str.push(`	<i class="icon-eye-on" data-click="toggle-visibility"></i>`);
					str.push(`	<span>${b.name}</span>`);
					str.push(`	<i class="icon-trashcan" data-click="delete-row"></i>`);
					str.push(`</div>`);
				});
				// add html string
				Self.els.leftBody.html(str.join(""));

				str = [];
				data = Self.dispatch({ type: "get-animation-dims" });
				str.push(`<div class="tbl-row parent-row">`);
				str.push(`<span class="frames" style="--l: ${data.minL}; --w: ${data.maxW};"></span>`);
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
						if ((!f && l !== false && w === false) || x === fl) w = x - l;
						if (l !== false && w !== false) {
							str.push(`<span class="frames" style="--l: ${l}; --w: ${w}; --color: ${b.color};"></span>`);
							l = false;
							w = false;
						}
					});
					str.push(`</div>`);
				});
				// update full width detail
				Self.els.timeline.css({ "--full": data.fullW });
				// update file frame total
				event.detail.file.frameTotal = data.fullW;
				// add html string
				Self.els.rightBody.find(".tbl-row").remove();
				Self.els.rightBody.append(str.join(""));
				// frame counters
				str = [...Array(parseInt(data.fullW / 10, 10) + 1)].map(a => `<li></li>`);
				Self.els.frameCount.append(str.join(""));
				// auto focus on frame "1,0", if not specified in file
				data = {
					cT: event.detail.file.cursorTop || 1,
					cL: event.detail.file.cursorLeft || 0,
				};
				Self.dispatch({ type: "focus-frame", ...data });
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
			case "get-animation-dims":
				brushes = event.brushes || Proj.file.brushes;
				// find out start & end of animation
				data = {
					minL: 1e3,
					maxW: 0,
					fullW: 0,
				};
				brushes.map(b => { data.minL = Math.min(b.frames.findIndex(e => !!e), data.minL); });
				brushes.map(b => { data.maxW = Math.max(b.frames.findLastIndex(e => e !== 0) - data.minL + 1, data.maxW); });
				brushes.map(b => { data.fullW = Math.max(b.frames.length, data.fullW); });
				// update file frame total (if file is available)
				if (Proj.file) Proj.file.frameTotal = data.fullW;
				// return info
				return data;
			case "update-parent-row":
				data = Self.dispatch({ type: "get-animation-dims" });
				el = Self.els.timeline.find(".right .tbl-row.parent-row .frames");
				el.css({ "--l": data.minL, "--w": data.maxW });
				break;
			case "focus-frame":
				data = {
					cT: event.cT !== undefined ? event.cT : +Self.els.timeline.cssProp("--cT"),
					cL: event.cL !== undefined ? event.cL : +Self.els.timeline.cssProp("--cL"),
					full: event.full !== undefined ? event.full : +Self.els.timeline.cssProp("--full"),
				};
				// update toolbar display
				APP.toolbar.dispatch({ type: "set-display", index: data.cL, total: data.full, fps: Proj.file.fps });
				// update timeline area
				Self.els.timeline.css({ "--cT": data.cT, "--cL": data.cL });
				Self.els.leftBody.find(".active").removeClass("active");
				Self.els.leftBody.find(`.tbl-row:nth(${data.cT})`).addClass("active");
				// update projector
				Proj.file.render({ frame: data.cL });
				break;
			case "move-play-head":
				Self.els.timeline.css({ "--cL": event.index });
				break;
			case "go-to-frame-index":
				rW = parseInt(Self.els.timeline.cssProp("--frW"), 10);
				offset = event.offset(".tbl-head");
				value = parseInt(offset.x / rW, 10);
				Self.dispatch({ type: "focus-frame", cL: value });
				// update projector
				Proj.file.render({ frame: value });
				break;
			case "toggle-visibility":
				value = event.el.hasClass("icon-eye-off");
				event.el.toggleClass("icon-eye-off", value);
				el = event.el.parents(".tbl-row");
				if (el.hasClass("brush-row")) {
					// TODO: show / hide brush
				} else {
					Proj.file.opaque = value;
				}
				break;
			case "delete-row":
				el = event.el.parent();
				// remove row from "right list"
				Self.els.rightBody.find(`.tbl-row:nth(${el.index()})`).remove();
				// remove row from "left list"
				el.remove();

				let rows = Self.els.leftBody.find(`.tbl-row .icon-trashcan`);
				if (rows.length === 1) rows.parents(".tbl-row").addClass("locked");
				break;
			case "show-timeline-row-colors":
				APP.colorpicker.dispatch({ type: "focus-color-field", el: event.el });
				break;
		}
	},
	doFrames(head) {
		let APP = kalli,
			Self = APP.timeline,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// drag info
				let el = $(event.target),
					cEl = Self.els.cursor,
					type = el.hasClass("frames") ? "move" : "select",
					full = +Self.els.timeline.cssProp("--full"),
					rW = parseInt(Self.els.timeline.cssProp("--frW"), 10),
					rH = parseInt(Self.els.timeline.cssProp("--rowH"), 10),
					min = { x: 0, y: 0 },
					max = { x: 0, y: Self.els.rightBody.find(".tbl-row").length },
					offset = {
						rW, rH,
						y: parseInt(event.layerY / rH, 10),
						x: parseInt(event.layerX / rW, 10),
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					brushes = Projector.file.brushes,
					src = {},
					max_ = Math.max,
					min_ = Math.min;

				if (type === "select") {
					cEl.removeClass("hidden");
				} else {
					el.addClass("selected");
					offset.top = el.parent().prevAll(".tbl-row").length - 1;
					offset.left = parseInt(el.cssProp("--l"), 10);
					offset.width = parseInt(el.cssProp("--w"), 10);

					// source info for mouseup event
					src.b = offset.top;
					src.i = offset.left;
					src.l = offset.width;

					let maxLeft = full,
						prevSibling = el.prevAll(".frames:first"),
						nextSibling = el.nextAll(".frames:first");
					if (prevSibling.length) min.x = Math.max(min.x, parseInt(prevSibling.cssProp("--l"), 10) + parseInt(prevSibling.cssProp("--w"), 10));
					if (nextSibling.length) maxLeft = Math.min(maxLeft, parseInt(nextSibling.cssProp("--l"), 10));
					max.x = maxLeft - parseInt(el.cssProp("--w"), 10);
				}

				// prepare drag object
				Self.drag = { el, type, brushes, src, max, min, click, offset, max_, min_ };

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doFrames);
				break;
			case "mousemove":
				if (Drag.type === "move") {
					let left = Drag.offset.left + parseInt((event.clientX - Drag.click.x) / Drag.offset.rW, 10);
					Drag.left = Drag.min_(Drag.max_(left, Drag.min.x), Drag.max.x);
					Drag.el.css({ "--l": Drag.left });
				}
				break;
			case "mouseup":
				if (Drag.type === "move") {
					// re-calculate parent-row "frames"
					let frames = Drag.brushes[Drag.src.b].frames,
						cut = frames.splice(Drag.src.i, Drag.src.l);
					// paste cut frames
					frames.splice(Drag.left, 0, ...cut);

					// update timeline UI
					Self.dispatch({ type: "update-parent-row" });
				}
				// reset view
				Drag.el.removeClass("selected");
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doFrames);
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
					_floor: Math.floor,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doHead);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					frame = parseInt( left / Self.drag.frW, 10 );
				// for performance
				if (Drag.index === frame) return;
				// save value on drag object
				Drag.index = frame;
				// moves navigator view rectangle
				Drag.el.css({ left: Drag._floor((Drag.index + .5) * Drag.frW) - 1 });
				// update cursor left
				Self.els.timeline.css({ "--cL": frame });
				// update file 
				Drag.file.render({ frame });
				break;
			case "mouseup":
				// playhead obeys cursor left
				Drag.el.css({ left: "" });
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doHead);
				break;
		}
	}
}