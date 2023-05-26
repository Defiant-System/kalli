
// kalli.work

{
	init() {
		// fast references
		this.els = {
			workArea: window.find(".column-canvas > .area"),
		};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.work,
			el;
		// console.log(event);
		switch (event.type) {
			case "switch-view":
				// update buttons
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");
				// updat work area
				Self.els.workArea
					.removeClass("show-canvas show-preview show-code")
					.addClass(`show-${event.el.data("arg")}`);
				break;
		}
	}
}