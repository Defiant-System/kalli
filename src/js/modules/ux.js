
const UX = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("mousedown", ".knob", this.doKnob);
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

				} else {
					// clean up
					Self.menu.remove();
				}
				// unbind event handler
				Self.doc.off("mousedown", Self.dispatch);
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

				let isPan = el.hasClass("pan-knob") || el.hasClass("pan2"),
					rack = el.parents(`[data-rack]`),
					section = rack.parents(`[data-section]`),
					eType = el.data("change"),
					eFunc = section.length && rack.length
							? defjam[section.data("section")][rack.data("rack")].dispatch
							: e => {};

				// prepare drag object
				Self.drag = {
					el,
					value,
					eType,
					eFunc,
					sEl: el.parent().find("span"),
					prefix: el.data("prefix") || "",
					suffix: el.data("suffix") || "",
					vMin: +el.data("min"),
					vMax: +el.data("max"),
					step: +el.data("step"),
					clientY: event.clientY,
					clientX: event.clientX,
					min: isPan ? -50 : 0,
					max: isPan ? 50 : 100,
				};
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = (Drag.clientY - event.clientY) + Drag.value;
				value = Math.min(Math.max(value, Drag.min), Drag.max);
				value -= value % 2;
				Drag.el.data({ value });
				// update span element
				val = Math.round(((value / 100) * (Drag.vMax - Drag.vMin)) / Drag.step) * Drag.step;
				Drag.sEl.html(`${Drag.prefix} ${val} ${Drag.suffix}`);
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
