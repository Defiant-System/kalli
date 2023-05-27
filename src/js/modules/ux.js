
const UX = {
	init() {
		// fast references
		this.doc = $(document);
		this.workarea = window.find(".workarea");

		// bind event handlers
		this.workarea.on("mousedown change", ".knob", this.doKnob);
	},
	doKnob(event) {
		let Self = UX,
			Drag = Self.drag,
			value,
			val,
			el;
		switch (event.type) {
			case "change":
				el = $(event.target);
				value = +el.data("value");
				// calculations
				let prefix = el.data("prefix") || "",
					suffix = el.data("suffix") || "",
					min = +el.data("min"),
					max = +el.data("max"),
					step = +el.data("step");
				// update sibling span value
				val = Math.round(((value / 100) * (max - min)) / step) * step;
				el.parent().find("span").html(`${prefix} ${val} ${suffix}`);
				break;
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
				Self.workarea.addClass("no-cursor");
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
				Self.workarea.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				break;
		}
	}
};
