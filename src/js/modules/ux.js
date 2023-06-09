
const UX = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("mousedown", ".knob", this.doKnob);
		this.content.on("mousedown", ".bg-scrollbar", this.doScoll);
		this.content.on("wheel", "[data-scroll-hId], [data-scroll-vId]", this.doScoll);
		this.content.on("click", "[data-options]", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = UX,
			rect,
			top,
			left,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "click":
				el = $(this);
				value = el.data("options");

				// save reference to source element
				Self.srcEl = el.addClass("opened");
				// render menubox
				Self.menu = window.render({
						template: value,
						append: Self.content,
						match: el.data("match") || false,
					});

				// position menubox
				rect = this.getBoundingClientRect();
				top = rect.top - window.top - Self.menu[0].offsetHeight - 49;
				left = rect.left - window.left + (rect.width >> 1) - (Self.menu[0].offsetWidth >> 1);
				Self.menu.css({ top, left });

				// set inital value - by associated event handler
				Self[Self.menu.data("ui")]({ type: "set-initial-value", el });

				// event handler checks for clicks outside inline-menubox
				Self.doc.on("mousedown", Self.dispatch);
				break;
			case "mousedown":
				el = $(event.target);
				if (el.parents(".inline-menubox").length) {
					// allow UI inline box code to do what ever
				} else {
					// clean up
					Self.menu.remove();
					// unbind event handler
					Self.doc.off("mousedown", Self.dispatch);
				}
				break;
		}
	},
	doScoll(event) {
		let APP = kalli,
			Self = UX,
			Drag = Self.drag;
		switch (event.type) {
			case "wheel":
				// prevent default behaviour
				event.preventDefault();

				let scrEl = $(this),
					psEl = scrEl.parent().parent().parent(),
					left = scrEl.prop("scrollLeft") + (event.wheelDeltaX * -.7),
					top = scrEl.prop("scrollTop") + (event.wheelDeltaY * -.7),
					hId = scrEl.data("scroll-hId"),
					vId = scrEl.data("scroll-vId"),
					sEl, vLerp;
				// scroll DIVs
				psEl.find(`[data-scroll-hId="${hId}"]`).scrollTo(left, top);
				psEl.find(`[data-scroll-vId="${vId}"]`).scrollTo(left, top);

				// sync "play-head"
				APP.timeline.els.timeline.css({ "--sLeft": scrEl.prop("scrollLeft") });

				// sync scrollbars
				sEl = psEl.find(`.bg-scrollbar[data-scroll-target="${hId}"] .scroll-bar`);
				vLerp = Math.invLerp(0, scrEl.prop("scrollWidth") - scrEl.prop("offsetWidth"), scrEl.prop("scrollLeft"));
				left = Math.lerp(1, sEl.parent().prop("offsetWidth") - sEl.prop("offsetWidth") - 1, vLerp);
				sEl.css({ left });

				sEl = psEl.find(`.bg-scrollbar[data-scroll-target="${vId}"] .scroll-bar`);
				vLerp = Math.invLerp(0, scrEl.prop("scrollHeight") - scrEl.prop("offsetHeight"), scrEl.prop("scrollTop"));
				top = Math.lerp(1, sEl.parent().prop("offsetHeight") - sEl.prop("offsetHeight") - 1, vLerp);
				sEl.css({ top });
				break;
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// variables
				let el = $(event.target),
					track = el.hasClass("scroll-track") ? el : el.parent(),
					bar = el.hasClass("scroll-bar") ? el : el.find(".scroll-bar"),
					pEl = track.parent(),
					type = pEl.hasClass("horisontal") ? "horisontal" : "vertical",
					selector = type === "horisontal" ? `[data-scroll-hId="${pEl.data("scroll-target")}"]` : `[data-scroll-vId="${pEl.data("scroll-target")}"]`,
					target = pEl.parent().find(selector),
					bodyEl = target.get(target.length-1);
				// drag object
				Self.drag = {
					bar,
					type,
					target,
					clickX: +bar.prop("offsetLeft") - event.clientX,
					clickY: +bar.prop("offsetTop") - event.clientY,
					min: { x: 1, y: 1 },
					max: {
						x: track.prop("offsetWidth") - bar.prop("offsetWidth") - 1,
						y: track.prop("offsetHeight") - bar.prop("offsetHeight") - 1,
						tX: bodyEl.prop("scrollWidth") - bodyEl.prop("offsetWidth"),
						tY: bodyEl.prop("scrollHeight") - bodyEl.prop("offsetHeight"),
					},
					scroll: {
						top: bodyEl.prop("scrollTop"),
						left: bodyEl.prop("scrollLeft"),
					},
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
					_invLerp: Math.invLerp,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				APP.els.doc.on("mousemove mouseup", Self.doScoll);
				break;
			case "mousemove":
				if (Drag.type === "horisontal") {
					let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x);
					Drag.bar.css({ left });
					
					let perc = Drag._invLerp(Drag.min.x, Drag.max.x, left);
					Drag.target.scrollTo(Drag._round(Drag.max.tX * perc), Drag.scroll.top);
				} else {
					let top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
					Drag.bar.css({ top });
					
					let perc = Drag._invLerp(Drag.min.y, Drag.max.y, top);
					Drag.target.scrollTo(Drag.scroll.left, Drag._round(Drag.max.tY * perc));
				}
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				APP.els.doc.off("mousemove mouseup", Self.doScoll);
				break;
		}
	},
	doKnob(event) {
		let Self = UX,
			Drag = Self.drag,
			limit,
			value,
			val,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// variables
				el = $(event.target);
				value = +el.data("value");

				let area = Self.srcEl.parents(`[data-area]`),
					eType = Self.srcEl.data("change"),
					eFunc = area.length
							? kalli[area.data("area")].dispatch
							: e => {};
				// redirect to canvas object
				if (eType === "change-zoom") eFunc = kalli.canvas.dispatch;
				// prepare drag object
				Self.drag = {
					el,
					value,
					eType,
					eFunc,
					sEl: Self.srcEl.find("span.value"),
					prefix: Self.srcEl.data("prefix") || "",
					suffix: Self.srcEl.data("suffix") || "",
					vMin: +Self.srcEl.data("min"),
					vMax: +Self.srcEl.data("max"),
					step: +Self.srcEl.data("step"),
					clientY: event.clientY,
					clientX: event.clientX,
					min: 0,
					max: 100,
					_max: Math.max,
					_min: Math.min,
					_lerp: Math.lerp,
					_round: Math.round,
				};
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = (Drag.clientY - event.clientY) + Drag.value;
				value = Drag._min(Drag._max(value, Drag.min), Drag.max);
				value -= value % 2;
				Drag.el.data({ value });
				// update span element
				// val = Drag._round(((value / 100) * (Drag.vMax - Drag.vMin)) / Drag.step) * Drag.step;
				val = Drag._round(Drag._lerp(Drag.vMin, Drag.vMax, value / 100));
				Drag.sEl.html(`${Drag.prefix} ${val} ${Drag.suffix}`.trim());
				// prevents "too many" calls
				if (Drag.v !== val) {
					// call event handler
					Drag.eFunc({ type: Drag.eType, value: val });
					// save value
					Drag.v = val;
				}
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				limit = {
					min: +event.el.data("min"),
					max: +event.el.data("max"),
					v: +event.el.find(".value").text(),
				};
				value = Math.round(Math.invLerp(limit.min, limit.max, limit.v) * 100);
				Self.menu.find(".knob").data({ value });
				break;
		}
	}
};
