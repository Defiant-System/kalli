
// kalli.code

{
	init() {
		// fast references
		this.els = {
			codeArea: window.find(`.column-canvas .body[data-area="code"] code`),
		};
	},
	dispatch(event) {
		let APP = kalli,
			Self = APP.code,
			code,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "switch-enter-event":
				code = window.find(".embed-code").html().slice(4,-4);
				value = hljs.highlight(code, { language: "xml" }).value;
				Self.els.codeArea.html(value);
				// ensable toolbar
				APP.toolbar.dispatch({ type: "enable-toolbar" });
				break;
			case "switch-exit-event":
				// disable toolbar
				APP.toolbar.dispatch({ type: "disable-toolbar" });
				break;
		}
	}
}