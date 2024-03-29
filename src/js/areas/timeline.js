
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
			rightHead: window.find(".row-timeline .right .tbl-head"),
			rightBody: window.find(".row-timeline .right .tbl-body"),
			rScrTrack: window.find(".row-timeline .bg-scrollbar.right .scroll-track"),
			rScrBar: window.find(".row-timeline .bg-scrollbar.right .scroll-bar"),
			bScrTrack: window.find(".row-timeline .bg-scrollbar.bottom .scroll-track"),
			bScrBar: window.find(".row-timeline .bg-scrollbar.bottom .scroll-bar"),
		};
		
		// bind event handlers
		this.els.rightBody.on("mousedown", this.doFrames);
		this.els.rightHead.on("mousedown", this.doHead);

		// subscribe to internal events
		window.on("file-parsed", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.timeline,
			Proj = Projector,
			File = Proj.file,
			brushes,
			offset,
			data,
			full,
			value,
			rW, rH,
			x, y, l, w,
			row, col,
			str,
			clone,
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
					case "a": // add frame to active row / brush
						row = Self.els.leftBody.find(".tbl-row.active").index() - 1;
						col = File.frameIndex + 1;
						File.dispatch({ type: "add-frame", row, col });
						break;
					case "del":
					case "backspace":
						// delete frames, if selected
						Self.dispatch({ type: "delete-frames" });
						break;
					case "space":
						APP.toolbar.els.btnPlay.trigger("click");
						break;
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
				// render brush row contents
				Self.dispatch({ type: "render-brush-rows" });
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
			case "splice-frames":
				data = event.data;
				el = Self.els.rightBody.find(`.tbl-row:nth(${data.src.y}) .frames[style*="--l: ${data.src.x};"]`);
				// cut types
				switch (true) {
					case (data.cut.x > data.src.x && (data.cut.x + data.cut.w) < (data.src.x + data.src.w)):
						// CUT: at middle
						// left stump
						l = data.src.x;
						w = data.cut.x - data.src.x;
						el.css({ "--l": l, "--w": w });
						// right stump
						clone = el.after(el.clone(true));
						l = data.cut.x + data.cut.w;
						w = data.src.x + data.src.w - l;
						clone.css({ "--l": l, "--w": w });
						// middle stump
						clone = el.after(el.clone(true));
						l = data.cut.x;
						w = data.cut.w;
						clone.css({ "--l": l, "--w": w }).addClass("selected");
						break;
					case (data.cut.x > data.src.x):
						// CUT: at end
						clone = el.after(el.clone(true));
						// right stump
						l = data.src.x;
						w = data.cut.x - data.src.x;
						el.css({ "--l": l, "--w": w });
						// left stump
						l = data.cut.x;
						w = data.cut.w;
						clone.css({ "--l": l, "--w": w }).addClass("selected");
						break;
					case (data.cut.x == data.src.x):
						// CUT: at start
						clone = el.before(el.clone(true));
						// left stump
						l = data.cut.x;
						w = data.cut.w;
						clone.css({ "--l": l, "--w": w }).addClass("selected");
						// right stump
						l = data.src.x + data.cut.w;
						w = data.src.w - data.cut.w;
						el.css({ "--l": l, "--w": w });
						break;
				}
				break;
			case "merge-frames":
				Self.els.rightBody.find(".tbl-row:not(.parent-row)").map(rowEl => {
					$(rowEl).find(".frames").map(fr => {
						let fEl = $(fr),
							fl = +fEl.cssProp("--l"),
							fw = +fEl.cssProp("--w"),
							nextSibling = fEl.nextAll(".frames:first"),
							prevSibling = fEl.prevAll(".frames:first"),
							sl, sw;
						// check if next sibling is merge candidate
						if (nextSibling.length) {
							sl = +nextSibling.cssProp("--l");
							sw = +nextSibling.cssProp("--w");
							if (fl + fw === sl) {
								// merge elements
								fEl.css({ "--w": fw + sw }).removeClass("selected");
								// remove stump element
								nextSibling.remove();
							}
						}
						// check if previous sibling is merge candidate
						if (prevSibling.length) {
							sl = +prevSibling.cssProp("--l");
							sw = +prevSibling.cssProp("--w");
							if (fl === sl + sw) {
								// merge elements
								fEl.css({ "--l": fl - sw, "--w": fw + sw }).removeClass("selected");
								// remove stump element
								prevSibling.remove();
							}
						}
					});
				});
				break;
			case "select-frames":
				let cursor = event.cursor;
				Self.els.rightBody.find(`.tbl-row:nth(${cursor.row}) .frames`).map(fr => {
					let fEl = $(fr),
						x = +fEl.cssProp("--l"),
						w = +fEl.cssProp("--w");
					// collision detection style check
					if ((x + w > cursor.left) && x < cursor.left + cursor.width) {
						let src = { y: cursor.row, x, w },
							cut = {};
						cut.x = Math.max(cursor.left, x);
						cut.w = Math.min(cursor.left + cursor.width, x + w) - cut.x;
						data = { src, cut };
					}
				});
				if (data) {
					// auto splice frames
					Self.dispatch({ type: "splice-frames", data });
				}
				break;
			case "delete-frames":
				el = Self.els.rightBody.find(`.tbl-row .frames.selected`);
				let bIndex = el.parent().prevAll(".tbl-row").length - 1,
					frames = Proj.file.brushes[bIndex].frames,
					i = +el.cssProp("--l"),
					il = i + +el.cssProp("--w");
				// empty frames
				for (; i<il; i++) frames[i] = 0;
				// delete frames if any selected
				el.remove();
				// update timeline UI
				Self.dispatch({ type: "update-parent-row" });
				break;
			case "tween-frames":
				// TODO
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
			case "render-brush-rows":
				str = [];
				// plot frames on timeline
				brushes = File.brushes;
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
				File.frameTotal = data.fullW;
				// add html string
				Self.els.rightBody.find(".tbl-row").remove();
				Self.els.rightBody.append(str.join(""));
				// frame counters
				str = [...Array(parseInt(data.fullW / 10, 10))].map(a => `<li></li>`);
				Self.els.frameCount.append(str.join(""));
				// auto focus on frame "1,0", if not specified in file
				data = {
					cT: File.cursorTop || 1,
					cL: File.cursorLeft || 0,
				};
				Self.dispatch({ type: "focus-frame", ...data });
				// calculate scrollbars
				Self.dispatch({ type: "update-scrollbars" });
				// move timeline cursor, if "frame index" is passed
				if (event.index) Self.els.timeline.css({ "--cL": event.index });
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
				Self.els.leftBody.find(`.tbl-row:nth(${data.cT})`).addClass("active").scrollIntoView();
				// update projector
				Proj.file.render({ frame: +data.cL });
				break;
			case "move-play-head":
				Self.els.timeline.css({ "--cL": event.index });
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
			case "select-brush":
				row = $(event.target).parents("?.tbl-row");
				if (!row.hasClass("brush-row")) return;

				Self.els.leftBody.find(".active").removeClass("active");
				row.addClass("active");


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
	doFrames(event) {
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
					// only brush frame/lanes are selectable
					if (offset.y === 0 || offset.y > max.y-1) return false;

					// reset previously selected frames, if any
					Self.dispatch({ type: "merge-frames" });
					// remove "selected" class, if any
					Self.els.rightBody.find(".selected").removeClass("selected");

					// show cursor elemeent
					cEl.removeClass("hidden")
						.css({
							"--cT": offset.y,
							"--cL": offset.x,
							"--cW": 1,
						});

					offset.width = parseInt(cEl.cssProp("--cW"), 10);
					offset.left = parseInt(offset.x, 10);
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
				Self.drag = { el, cEl, type, brushes, src, max, min, click, offset, max_, min_ };

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doFrames);
				break;
			case "mousemove":
				if (Drag.type === "select") {
					let row = Drag.offset.y,
						left = Drag.offset.x,
						width = parseInt((event.clientX - Drag.click.x) / Drag.offset.rW, 10);
					
					if (width === 0) width = 1;
					else if (width < 0) {
						width *= -1;
						left -= width - 1;
					}
					Drag.cursor = { row, left, width };
					// cursor dim
					Drag.cEl.css({ "--cL": left, "--cW": width });
				} else {
					let left = Drag.offset.left + parseInt((event.clientX - Drag.click.x) / Drag.offset.rW, 10);
					Drag.left = Drag.min_(Drag.max_(left, Drag.min.x), Drag.max.x);
					Drag.el.css({ "--l": Drag.left });
				}
				break;
			case "mouseup":
				if (Drag.type === "select") {
					Drag.cEl.addClass("hidden");
					if (Drag.cursor) {
						// select / splice frames
						Self.dispatch({ type: "select-frames", cursor: Drag.cursor });
					}
				} else if (Drag.left) {
					// re-calculate parent-row "frames"
					let frames = Drag.brushes[Drag.src.b].frames,
						cut = frames.splice(Drag.src.i, Drag.src.l);
					// paste cut frames
					frames.splice(Drag.left, 0, ...cut);
					// update timeline UI
					Self.dispatch({ type: "update-parent-row" });
					// merge frames, if any
					Self.dispatch({ type: "merge-frames" });
				}
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doFrames);
				break;
		}
	},
	doHead(event) {
		let APP = kalli,
			Self = APP.timeline,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let target = $(event.target),
					el = Self.els.playhead,
					Proj = Projector,
					file = Proj.file;

				if (target.hasClass("frame-count")) {
					let rW = parseInt(Self.els.timeline.cssProp("--frW"), 10),
						sL = parseInt(Self.els.timeline.cssProp("--sLeft"), 10),
						value = parseInt((event.offsetX + sL) / rW, 10);
					// update cursor left
					Self.els.timeline.css({ "--cL": value });
					// update file 
					file.render({ frame: value });
				}

				// drag object
				Self.drag = {
					el,
					file,
					clickX: +el.prop("offsetLeft") - event.clientX,
					frW: parseInt(Self.els.timeline.cssProp("--frW"), 10),
					sL: parseInt(Self.els.timeline.cssProp("--sLeft"), 10),
					limit: {
						low: 0,
						high: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
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
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.limit.low), Drag.limit.high),
					frame = parseInt((left + Drag.sL) / Drag.frW, 10);
				// for performance
				if (Drag.index === frame) return;
				// save value on drag object
				Drag.index = frame;
				// update cursor left
				Self.els.timeline.css({ "--cL": frame });
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