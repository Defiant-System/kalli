
// kalli.colorpicker

{
	init() {
		// fast references
		let el = window.find(".color-picker"),
			wrapper = el.find(".wrapper"),
			range = el.find(".range"),
			rgba = el.find(".rgba .color-group > div"),
			hsva = el.find(".hsva .color-group > div");
		this.els = {
			content: window.find("content"),
			palette: el.find(".palette"),
			el,
			wrapper,
			range,
			wheel: wrapper.find(".wheel"),
			wCursor: wrapper.find(".cursor"),
			rCursor: range.find(".cursor"),
			groupRGBA: {
				R: rgba.get(0),
				G: rgba.get(1),
				B: rgba.get(2),
				A: rgba.get(3),
			},
			groupHSVA: {
				H: hsva.get(0),
				S: hsva.get(1),
				V: hsva.get(2),
				A: hsva.get(3),
			},
		};
		// "settings"
		this.mode = "HSVA";  // palette RGBA HSVA
		this.radius = 74;
		this.origin = {};
		// click on the right "tab"
		this.els.el.find(`.group-head span[data-id="${this.mode}"]`).trigger("click");
		// bind event handlers
		this.els.el.on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.colorpicker,
			opacity,
			rgb, hsv,
			rad, sat, tau,
			top, left, height,
			name, value,
			pEl,
			el;
		// console.log(event);
		switch(event.type) {
			case "mousedown":
				// dispatch mousedown event
				el = $(event.target);
				pEl = event.el || (el.hasClass("field") ? el : el.parents(".field"));
				switch (true) {
					case el.hasClass("wrapper"): return Self.doWrapper(event);
					case el.hasClass("range"): return Self.doRange(event);
					case pEl.hasClass("number"): return Self.doField(event);
				}
				break;
			case "focus-color-field":
				// closes color picker first, if already opened
				if (Self.els.el.hasClass("show")) return;
				el = event.el;
				pEl = el.parents("[data-area]");
				// collect info about source / origin element
				Self.origin = {
					el,
					hex: el.cssProp("--color").trim(),
					opacity: +el.cssProp("--opacity").trim(),
					area: APP[pEl.data("area")],
					change: el.data("change"),
				};
				Self.origin.rgb = Color.hexToRgb(Self.origin.hex);
				Self.origin.hsv = Color.hexToHsv(Self.origin.hex);
				Self.dispatch({ type: `set-fields-${Self.mode}`, ...Self.origin });
				Self.dispatch({ type: "set-wheel-range", ...Self.origin });

				value = window.getBoundingClientRect(el[0]);
				top = value.top - (+Self.els.el.prop("offsetHeight") >> 1) + 12;
				left = value.left + 23;
				Self.els.el.css({ top, left }).addClass("show");

				let doc = $(document),
					func = event => {
						let el = $(event.target);
						if (el.hasClass("color-picker") || el.parents(".color-picker").length) return;
						Self.els.el
							.cssSequence("hide", "animationend", el =>
								el.css({ top: -1e3, left: -1e3 }).removeClass("show hide"));
						doc.unbind("mousedown", func);
					};
				// capture next mousedown - if outside color picker hide, color picker
				doc.bind("mousedown", func);
				break;
			case "update-origin-el":
				Self.origin.el.css({
					"--color": Self.origin.hex,
					"--opacity": Self.origin.opacity,
				});
				Self.origin.area.dispatch({
					type: Self.origin.change,
					el: Self.origin.el, 
					color: Self.origin.hex,
					opacity: Self.origin.opacity,
				});
				break;
			case "group-head":
				el = $(event.target);
				value = el.index();
				el.parent().find(".active").removeClass("active");
				el.addClass("active");
				// set mode
				Self.mode = el.data("id");
				// show right "body"
				el = el.parent().nextAll(".group-body:first");
				el.find("> div.active").removeClass("active");
				el.find(`> div:nth(${value})`).addClass("active");
				if (Self.origin.hex) {
					// update dialog UI
					Self.dispatch({ type: `set-fields-${Self.mode}`, ...Self.origin });
				}
				break;
			case "set-fields-HSVA":
				hsv = event.hsv || Self.origin.hsv;
				value = (hsv.h / 360).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupHSVA.H.data({ value }).css({ "--value": value });
				value = (hsv.s / 100).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupHSVA.S.data({ value }).css({ "--value": value });
				value = (hsv.v / 100).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupHSVA.V.data({ value }).css({ "--value": value });
				value = Self.origin.opacity.toFixed(3);
				Self.els.groupHSVA.A.data({ value }).css({ "--value": value });
				break;
			case "set-fields-RGBA":
				rgb = event.rgb || Self.origin.rgb;
				value = (rgb.r / 255).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupRGBA.R.data({ value }).css({ "--value": value });
				value = (rgb.g / 255).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupRGBA.G.data({ value }).css({ "--value": value });
				value = (rgb.b / 255).toFixed(3); // if (value < 0.005) value = "0.000";
				Self.els.groupRGBA.B.data({ value }).css({ "--value": value });
				value = Self.origin.opacity.toFixed(3);
				Self.els.groupRGBA.A.data({ value }).css({ "--value": value });
				break;
			case "set-fields-palette":
				value = event.hex || Self.origin.hex;
				el = Self.els.palette.find(`span[style="background: ${value};"]`);
				if (el.length) el.addClass("active");
				break;
			case "select-palette-color":
				el = $(event.target);
				if (el.prop("nodeName") !== "SPAN") return;
				Self.els.palette.find(".active").removeClass("active");
				Self.origin.hex = el.addClass("active").attr("style").match(/background: (#.+?);/i)[1];
				Self.origin.rgb = Color.hexToRgb(Self.origin.hex);
				Self.origin.hsv = Color.hexToHsv(Self.origin.hex);
				
				Self.dispatch({ type: "update-origin-el" });
				Self.dispatch({ type: "set-wheel-range" });
				break;
			case "set-wheel-range":
				hsv = event.hsv || Self.origin.hsv;
				height = +Self.els.range.prop("offsetHeight");
				// wheel cursor
				rad = hsv.h * (Math.PI / 180);
				sat = Self.radius * (hsv.s / 100);
				top = Math.round(Math.sin(rad) * sat + Self.radius);
				left = Math.round(Math.cos(rad) * sat + Self.radius);
				Self.els.wCursor.css({ top, left });
				// wheel darkness
				opacity = hsv.v / 100;
				Self.els.wheel.css({ opacity });
				// saturation cursor
				top = Math.round(height * (1-opacity));
				Self.els.rCursor.css({ top });
				break;
			case "set-rgba-R":
			case "set-rgba-G":
			case "set-rgba-B":
				Self.origin.rgb = {
					r: Math.round(+Self.els.groupRGBA.R.data("value") * 255),
					g: Math.round(+Self.els.groupRGBA.G.data("value") * 255),
					b: Math.round(+Self.els.groupRGBA.B.data("value") * 255),
				};
				Self.origin.hsv = Color.rgbToHsv(Self.origin.rgb);
				Self.origin.hex = Color.rgbToHex(Self.origin.rgb);
				Self.dispatch({ type: "set-wheel-range" });
				Self.dispatch({ type: "update-origin-el" });
				break;
			case "set-rgba-A":
				Self.origin.opacity = +Self.els.groupRGBA.A.data("value");
				Self.dispatch({ type: "update-origin-el" });
				break;
			case "set-hsva-H":
			case "set-hsva-S":
			case "set-hsva-V":
				Self.origin.hsv = {
					h: Math.round(+Self.els.groupHSVA.H.data("value") * 360),
					s: Math.round(+Self.els.groupHSVA.S.data("value") * 100),
					v: Math.round(+Self.els.groupHSVA.V.data("value") * 100),
				};
				Self.origin.rgb = Color.hsvToRgb(Self.origin.hsv);
				Self.origin.hex = Color.rgbToHex(Self.origin.rgb);
				Self.dispatch({ type: "set-wheel-range" });
				Self.dispatch({ type: "update-origin-el" });
				break;
			case "set-hsva-A":
				Self.origin.opacity = +Self.els.groupHSVA.A.data("value");
				Self.dispatch({ type: "update-origin-el" });
				break;
			case "update-RGBA":
			case "update-HSVA":
			case "update-palette":
				tau = Math.PI * 2;
				Self.origin.hsv = {
					h: Math.round(Self.mod(Math.atan2(-event.y, -event.x) * (360 / tau), 360)),
					s: Math.round(Math.min(Self.radius, Self.distance(event.left, event.top)) / Self.radius * 100),
					v: Math.round(event.value * 100),
				};
				Self.origin.rgb = Color.hsvToRgb(Self.origin.hsv);
				Self.origin.hex = Color.rgbToHex(Self.origin.rgb);
				name = event.type.split("-")[1];
				Self.dispatch({ type: "set-fields-"+ name });
				Self.dispatch({ type: "update-origin-el" });
				break;
		}
	},
	mod(a, n) {
		return (a % n + n) % n;
	},
	distance(left, top) {
		return Math.sqrt(Math.pow(left - this.radius, 2) + Math.pow(top - this.radius, 2));
	},
	doField(event) {
		let Self = kalli.colorpicker,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// info about DnD event
				let doc = $(document),
					el = $(event.target);
				// data for move event
				Self.drag = {
					el,
					changeType: el.data("change"),
					offset: +el.css("--value"),
					clickX: event.clientX,
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
					doc,
				};
				// cover APP UI
				APP.els.content.addClass("cover hideMouse");
				// bind event handlers
				Self.drag.doc.on("mousemove mouseup", Self.doField);
				break;
			case "mousemove":
				let step = 0.003,
					sVal = Drag.offset - ((Drag.clickX - event.clientX) * step),
					sValue = Drag._min(Drag._max(step * Drag._round(sVal / step), 0), 1),
					value = sValue.toFixed(3);
				Drag.el
					.data({ value })
					.css({ "--value": value });
				// forward value to dispatch
				Self.dispatch({ type: Drag.changeType, value });
				break;
			case "mouseup":
				// uncover APP UI
				APP.els.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.drag.doc.off("mousemove mouseup", Self.doField);
				break;
		}
	},
	doWrapper(event) {
		let Self = kalli.colorpicker,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// collect event info
				let doc = $(document),
					el = $(event.target).find(".cursor"),
					group = Self.els.groupHSVA,
					clientY = event.clientY,
					clientX = event.clientX,
					dim = {
						top: parseInt(Self.els.rCursor.css("top"), 10),
						height: parseInt(Self.els.range.css("height"), 10),
					},
					offset = {
						left: event.offsetX,
						top: event.offsetY,
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					};
				if (!event.isFake) {
					// remove "active" indicator from palette
					Self.els.palette.find(".active").removeClass("active");
				}
				// move cursor
				el.css(offset);
				// create drag
				Self.drag = {
					el,
					click,
					offset,
					group,
					value: (1-(dim.top / dim.height)),
					limit: (left, top) => {
						var dist = Self.distance(left, top),
							rad;
						if (dist <= Self.radius) return { left, top };
						else {
							left = left - Self.radius;
							top = top - Self.radius;
							rad = Math.atan2(top, left);
							return {
								left: Math.round(Math.cos(rad) * Self.radius + Self.radius),
								top: Math.round(Math.sin(rad) * Self.radius + Self.radius),
							}
						}
					},
					doc,
				};
				// trigger update
				Self.doWrapper({ type: "mousemove", clientY, clientX });
				if (!event.isFake) {
					// cover layout
					Self.els.content.addClass("cover hideMouse");
					// bind event
					Self.drag.doc.on("mousemove mouseup", Self.doWrapper);
				}
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.top - Drag.click.y,
					left = event.clientX + Drag.offset.left - Drag.click.x,
					limited = Drag.limit(left, top),
					x = Self.radius - limited.left,
					y = Self.radius - limited.top;
				// cursor position
				Drag.el.css(limited);
				// update fields
				Self.dispatch({ type: `update-${Self.mode}`, ...limited, x, y, value: Drag.value });
				break;
			case "mouseup":
				// uncover layout
				Self.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.drag.doc.off("mousemove mouseup", Self.doWrapper);
				// reset drag object
				delete Self.drag;
				break;
		}
	},
	doRange(event) {
		let Self = kalli.colorpicker,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.content.addClass("cover hideMouse");
				// collect event info
				let doc = $(document),
					el = $(event.target).find(".cursor"),
					group = Self.els.groupHSVA,
					target = Self.els.wheel,
					offset = { top: event.offsetY - 3 },
					clientY = event.clientY,
					click = { y: clientY },
					constrain = {
						minY: 0,
						maxY: +Self.els.range.prop("offsetHeight"),
					},
					wheel = {
						top: parseInt(Self.els.wCursor.css("top"), 10),
						left: parseInt(Self.els.wCursor.css("left"), 10),
					},
					_max = Math.max,
					_min = Math.min,
					mode = Self.mode;
				if (event.clientX !== 0 && clientY !== 0) {
					// remove "active" indicator from palette
					Self.els.palette.find(".active").removeClass("active");
				}
				// more calc
				wheel.x = Self.radius - wheel.left;
				wheel.y = Self.radius - wheel.top;
				// move cursor
				el.css(offset);
				// create drag
				Self.drag = { el, target, group, click, offset, constrain, wheel, _min, _max, doc };
				// trigger update
				Self.doRange({ type: "mousemove", clientY });
				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doRange);
				break;
			case "mousemove":
				let top = Drag._min(Drag._max(event.clientY + Drag.offset.top - Drag.click.y, Drag.constrain.minY), Drag.constrain.maxY),
					value = 1 - (top / Drag.constrain.maxY);
				// cursor position
				Drag.el.css({ top });
				// wheel opacity
				Drag.target.css({ opacity: value });
				// update fields
				Self.dispatch({ type: `update-${Self.mode}`, value, ...Drag.wheel });
				break;
			case "mouseup":
				// uncover layout
				Self.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.drag.doc.off("mousemove mouseup", Self.doRange);
				// reset drag object
				delete Self.drag;
				break;
		}
	}
}
