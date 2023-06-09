
// kalli.navigator

{
	init() {
		// fast references
		this.els = {
			wrapper: window.find(".area.navigator .body > div"),
			zoomRect: window.find(".area.navigator .body .view-rect"),
			zoomValue: window.find(".area.navigator .foot .value"),
			zoomSlider: window.find(".area.navigator .zoom-slider input"),
		};

		this.cvs = this.els.wrapper.find(".nav-cvs");
		this.ctx = this.cvs[0].getContext("2d", { willReadFrequently: true });
		
		// available height
		this.navHeight = this.els.wrapper.height() || 161;
		this.maxWidth = parseInt(this.els.wrapper.css("max-width"), 10);
		this.maxHeight = parseInt(this.els.wrapper.css("max-height"), 10);

		// bind event handlers
		this.els.zoomRect.on("mousedown", this.pan);
		this.els.zoomSlider.on("input", this.dispatch);

		// subscribe to events
		karaqu.on("file-parsed", this.dispatch);
		karaqu.on("projector-update", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.navigator,
			Proj = Projector,
			File = Proj.file,
			_round = Math.round,
			_max = Math.max,
			_min = Math.min,
			data = {},
			oX, oY,
			value,
			opt,
			width,
			height,
			top,
			left;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "file-parsed":
				// get file from event object, if not available
				if (!File) File = event.detail.file;
				// calc ratio
				Self.ratio = File.height / File.width;
				if (isNaN(Self.ratio)) return;

				// available width
				Self.navWidth = _round(Self.navHeight / Self.ratio);
				if (Self.navWidth > Self.maxWidth) {
					Self.navWidth = Self.maxWidth;
					Self.navHeight = _round(Self.ratio * Self.navWidth);
				}

				data.top = ((Proj.aY - File.oY) / File.height) * Self.navHeight;
				data.left = ((Proj.aX - File.oX) / File.width) * Self.navWidth;
				data.height = _min(((Proj.aH / File.height) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min(((Proj.aW / File.width) * Self.navWidth), Self.navWidth - data.left);

				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				// adjust zoom fields
				ZOOM.map((z, i) => {
					if (z.level === File.scale * 100) {
						Self.dispatch({ type: "file-initial-scale", value: i });
					}
				});

				for (let key in data) data[key] = _round(data[key]);
				Self.els.zoomRect.css(data);
				break;
			case "projector-update":
				if (!Self.navWidth) return;
				
				data = { width: Self.navWidth };
				if (Self.ratio < 1) data.top = (Self.maxHeight - Self.navHeight) >> 1;

				Self.els.wrapper.css(data);
				Self.cvs.prop({ width: Self.navWidth, height: Self.navHeight });
				if (!File.opaque) {
					// layer: checkers
					Proj.drawCheckers(Self.ctx, { w: Self.navWidth, h: Self.navHeight });
				} else {
					// file bg-color
					Self.ctx.fillStyle = File.bgColor;
					Self.ctx.fillRect(0, 0, Self.navWidth, Self.navHeight);
				}
				Self.ctx.drawImage(File.cvs[0], 0, 0, Self.navWidth, Self.navHeight);
				Self.els.wrapper.removeClass("hidden");
				break;

			// custom events
			case "pan-view-rect":
				oX = Proj.cX - (File.width >> 1) + event.x;
				oY = Proj.cY - (File.height >> 1) + event.y;
				data.top = ((Proj.aY - File.oY) / File.height) * Self.navHeight;
				data.left = ((Proj.aX - File.oX) / File.width) * Self.navWidth;
				data.height = _min(((Proj.aH / File.height) * Self.navHeight), Self.navHeight - data.top);
				data.width = _min(((Proj.aW / File.width) * Self.navWidth), Self.navWidth - data.left);

				if (data.top < 0) data.height = _min(data.height + data.top, data.height);
				if (data.left < 0) data.width = _min(data.width + data.left, data.width);
				data.top = _max(data.top, 0);
				data.left = _max(data.left, 0);

				Self.els.zoomRect.css(data);
				break;
			case "input":
			case "file-initial-scale":
				value = event.value || Self.els.zoomSlider.val();
				value = _max(_min(+value, ZOOM.length - 1), 0);

				Self.zoomValue = ZOOM[value].level;
				Self.els.zoomValue.html(Self.zoomValue);

				if (event.type === "input") {
					File.dispatch({ type: "set-scale", scale: Self.zoomValue / 100 });
				} else {
					Self.els.zoomSlider.val(event.value);
				}
				break;
			case "zoom-out":
				value = _max(+Self.els.zoomSlider.val() - 1, 0);
				Self.els.zoomSlider.val(value.toString()).trigger("input");
				break;
			case "zoom-in":
				value = _min(+Self.els.zoomSlider.val() + 1, ZOOM.length - 1);
				Self.els.zoomSlider.val(value).trigger("input");
				break;
			case "pan-canvas":
				top = _round((event.top / event.max.y) * event.max.h) + Proj.aY;
				left = _round((event.left / event.max.x) * event.max.w) + Proj.aX;
				//if (isNaN(top) || isNaN(left)) return;

				// forward event to canvas
				File.dispatch({ type: "pan-canvas", top, left, noEmit: true });
				break;
		}
	},
	pan(event) {
		let APP = kalli,
			Self = APP.navigator,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag object
				let el = $(event.target),
					Proj = Projector;
				// drag object
				Self.drag = {
					el,
					// file: Proj.file,
					clickX: +el.prop("offsetLeft") - event.clientX,
					clickY: +el.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.parent().prop("offsetWidth") - +el.prop("offsetWidth"),
						y: +el.parent().prop("offsetHeight") - +el.prop("offsetHeight"),
						w: Proj.aW - Proj.file.width,
						h: Proj.aH - Proj.file.height,
					},
					_max: Math.max,
					_min: Math.min,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.pan);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				// moves navigator view rectangle
				Drag.el.css({ top, left });
				// emit pan-event
				Self.dispatch({ ...Drag, type: "pan-canvas", top, left });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.pan);
				break;
		}
	}
}