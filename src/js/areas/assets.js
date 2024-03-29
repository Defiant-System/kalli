
// kalli.assets

{
	init() {
		// fast references
		this.els = {
			listBody: window.find(".area.assets .body"),
			scrTrack: window.find(".area.assets .bg-scrollbar.right .scroll-track"),
			scrBar: window.find(".area.assets .bg-scrollbar.right .scroll-bar"),
		};

		// subscribe to internal events
		window.on("file-parsed", this.dispatch);
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.assets,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "file-parsed":
				// render asset list
				window.render({
					template: "assets",
					match: `//assets`,
					target: Self.els.listBody,
					data: event.detail.file._file.data,
				});
				// calculate scrollbars
				Self.dispatch({ type: "update-scrollbars" });
				break;
			// custom events
			case "window.resize":
			case "update-scrollbars":
				let oH = Self.els.listBody.prop("offsetHeight"),
					sH = Self.els.listBody.prop("scrollHeight"),
					hScroll = Self.els.scrTrack.prop("offsetHeight"),
					height = (oH / sH) * hScroll;
				Self.els.scrBar.css({ height }).toggleClass("hidden", hScroll !== height);
				break;
		}
	}
}