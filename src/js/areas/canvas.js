
// kalli.canvas

{
	init() {
		// fast references
		this.els = {
			area: window.find(`.column-canvas .body[data-area="canvas"]`),
		};
		// defaults
		this.view = {};
		// default zoom-index
		this.zoomIndex = 3;

		// bind event handlers
		this.els.area.on("mousedown", this.move);
		// this.els.area.on("wheel", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.canvas,
			Proj = Projector,
			File = Proj.file,
			scale, top, left,
			str;
		// console.log(event);
		switch (event.type) {
			// native events
			case "wheel":
				// prevent default behaviour
				event.preventDefault();

				let dir = event.deltaY < 0 ? 1 : -1,
					zoomY = event.layerY - File.oY,
					zoomX = event.layerX - File.oX,
					zoomIndex = Math.min(Math.max(Self.zoomIndex + dir, 0), ZOOM.length-1);
				
				scale = ZOOM[Self.zoomIndex].level / 100;
				// call dispatch only if new value is other than current value (performance)
				if (Self.zoomIndex !== zoomIndex) {
					File.dispatch({ type: "scale-at", zoomY, zoomX, scale });
					// save value
					Self.zoomIndex = zoomIndex;
				}
				break;
			// custom events
			case "switch-enter-event":
				// reset projector scale
				scale = Self.view.scale || File.scale || 1;
				File.dispatch({ type: "scale-at", scale });
				// reset projector pan file
				top = Self.view.top !== undefined ? Self.view.top : File.oY;
				left = Self.view.left !== undefined ? Self.view.left : File.oX;
				File.dispatch({ type: "pan-canvas", top, left });
				// switch projector "lens"
				Proj.dispatch({ type: "switch-view", view: "canvas" });
				break;
			case "switch-exit-event":
				// remeber view info
				Self.view.scale = File.scale;
				Self.view.top = File.oY;
				Self.view.left = File.oX;
				break;
			case "select-tool":
				// event trigger by shortcut - update toolbar
				if (!event.el) {
					APP.toolbar.dispatch({ type: "activate-tool", arg: event.arg });
				}
				// ui/ux tool
				Self.tool = event.arg;
				Self.els.area.data({ tool: event.arg });
				// forward event to toolbar
				return APP.toolbar.dispatch(event);
			case "toggle-play":
				APP.toolbar.els.btnPlay.trigger("click");
				break;
			case "prev-frame":
				APP.timeline.dispatch({ type: "window.keystroke", char: "left" });
				break;
			case "next-frame":
				APP.timeline.dispatch({ type: "window.keystroke", char: "right" });
				break;
			case "update-zoom-index":
				ZOOM.map((zoom, index) => {
						let testScale = zoom.level / 100;
						if (testScale === event.scale) this.zoomIndex = index;
					});
				break;
			case "edit-frame-index":
				// delete old brushes
				Self.els.area.find(".brush").remove();

				str = [];
				// update brush masks
				File.brushes.map(brush => {
					let f = brush.frames[event.index];
					if (f) {
						let [x, y, r] = f;
						// translate / scale coordinate matrix
						r *= File.scale.toFixed(2);
						y = ((y * File.scale) + File.oY).toFixed(2);
						x = ((x * File.scale) + File.oX).toFixed(2);
						str.push(`<div class="brush" style="--bg: ${brush.color}; --top: ${y}px; --left: ${x}px; --radius: ${r}px;"></div>`);
					}
				});
				// add new brushes
				Self.els.area.append(str.join(""));
				break;
		}
	},
	move(event) {
		let APP = kalli,
			Self = APP.canvas,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file,
					el = $(event.target);

				switch (Self.tool) {
					case "move":
						if (el.hasClass("design")) return Self.pan(event);
						// else fall through
						break;
					case "resize": return Self.resize(event);
					case "zoom-in":
					case "zoom-out":
						let zoomY = event.layerY,
							zoomX = event.layerX,
							dir = Self.tool === "zoom-in" ? 1 : -1,
							val = +APP.navigator.els.zoomSlider.val(),
							index = Math.min(Math.max(val + dir, 0), ZOOM.length - 1),
							scale = ZOOM[index].level / 100;
						// dispatch event
						return File.dispatch({ type: "scale-at", zoomY, zoomX, scale });
				}

				let radius = +el.prop("offsetWidth") / 2,
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					click = {
						x: event.clientX - x,
						y: event.clientY - y,
					};
					
				Self.drag = {
					el,
					proj: Proj,
					file: File,
					brushIndex: File.cursorTop - 1,
					click,
					radius,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let top = event.clientY - Drag.click.y + Drag.radius,
					left = event.clientX - Drag.click.x + Drag.radius;
				// move dragged object
				Drag.el.css({ "--top": `${top}px`, "--left": `${left}px` });
				// save values for "mouseup"
				Drag.top = top;
				Drag.left = left;
				break;
			case "mouseup":
				let f = Drag.file.brushes[Drag.brushIndex].frames[Drag.file.frameIndex];
				f[0] = +((Drag.left - Drag.file.oX) / Drag.file.scale).toFixed(1); // left
				f[1] = +((Drag.top - Drag.file.oY) / Drag.file.scale).toFixed(1); // top

				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Drag.proj.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	resize(event) {
		let APP = kalli,
			Self = APP.canvas,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				let el = $(event.target);
				if (!el.hasClass("brush")) return;

				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file,
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					w = +el.prop("offsetWidth"),
					h = +el.prop("offsetHeight"),
					offset = { x, y, w, h },
					click = {
						y: event.clientY,
					};

				Self.drag = {
					el,
					proj: Proj,
					file: File,
					brushIndex: File.cursorTop - 1,
					click,
					offset,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let diff = event.clientY - Drag.click.y,
					radius = (Drag.offset.h - diff) * .5;
				// resize object
				Drag.el.css({
					"--radius": `${radius}px`,
				});
				// save values for "mouseup"
				Drag.radius = radius;
				break;
			case "mouseup":
				let f = Drag.file.brushes[Drag.brushIndex].frames[Drag.file.frameIndex];
				f[2] = +(Drag.radius / Drag.file.scale).toFixed(1);

				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Drag.proj.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	pan(event) {
		let APP = kalli,
			Self = APP.canvas,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file;
				// dont pan if image fits available area
				if (File.width <= Proj.aW && File.height <= Proj.aH) return;

				Self.drag = {
					clickX: event.clientX - (File.oX - Proj.cX + (File.width >> 1)),
					clickY: event.clientY - (File.oY - Proj.cY + (File.height >> 1)),
					min: {
						x: Proj.aX - Proj.cX + (File.width >> 1),
						y: Proj.aY - Proj.cY + (File.height >> 1),
					},
					max: {
						x: (Proj.cX - Proj.aX - (File.width >> 1)) + 1,
						y: (Proj.cY - Proj.aY - (File.height >> 1)) + 1,
					},
					_max: Math.max,
					_min: Math.min,
					proj: Proj,
					file: File,
					nav: APP.navigator,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				Drag.x = Drag._max(Drag._min(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x);
				Drag.y = Drag._max(Drag._min(event.clientY - Drag.clickY, Drag.min.y), Drag.max.y);
				// forward event to file
				Drag.file.dispatch({ ...Drag, type: "pan-canvas", noEmit: true });
				// dispatch event to sidebar navigator
				Drag.nav.dispatch({ ...Drag, type: "pan-view-rect" });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Drag.proj.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
}