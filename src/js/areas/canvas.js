
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
				break;
			case "switch-exit-event":
				// remeber view info
				Self.view.scale = File.scale;
				Self.view.top = File.oY;
				Self.view.left = File.oX;
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
						str.push(`<div class="brush" style="--bg: ${brush.color}; --top: ${y-r}px; --left: ${x-r}px; --radius: ${r*2}px;"></div>`);
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

				let el = $(event.target);
				switch (true) {
					// pan canvas
					case el.hasClass("design"): return Self.pan(event);
					// resize brush
					case el.hasClass("brush") && event.shiftKey: return Self.resize(event);
					// move brush; handled in this function
					default:
				}

				let Proj = Projector,
					File = Proj.file,
					radius = +el.prop("offsetWidth") / 2,
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
					click,
					radius,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Proj.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let top = event.clientY - Drag.click.y,
					left = event.clientX - Drag.click.x;
				// move dragged object
				Drag.el.css({ "--top": `${top}px`, "--left": `${left}px` });
				// save values for "mouseup"
				Drag.top = top;
				Drag.left = left;
				break;
			case "mouseup":
				let f = Drag.file.brushes[0].frames[Drag.file.frameIndex];
				f[0] = (Drag.left + Drag.radius - Drag.file.oX) / Drag.file.scale; // left
				f[1] = (Drag.top + Drag.radius - Drag.file.oY) / Drag.file.scale; // top

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
				// prevent default behaviour
				event.preventDefault();

				let Proj = Projector,
					File = Proj.file,
					el = $(event.target),
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
					hd = diff >> 1,
					top = Drag.offset.y + hd,
					left = Drag.offset.x + hd,
					radius = Drag.offset.h - diff;
				// resize object
				Drag.el.css({
					"--top": `${top}px`,
					"--left": `${left}px`,
					"--radius": `${radius}px`,
				});
				break;
			case "mouseup":
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