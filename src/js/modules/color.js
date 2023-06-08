
let Color = {
	clamp: (num, min, max) => Math.min(Math.max(num, min), max),
	intToHex: i => i.toString(16).padStart(2, "0"),
	hexToHsv(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsv(rgb);
	},
	hexToRgb(hex) {
		if (hex.length === 4) {
			let [h,r,g,b] = hex.split("");
			hex = h+r+r+g+g+b+b;
		}
		let r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16) / 255;
		return { r, g, b, a };
	},
	parseRgb(str) {
		let s = str.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\.\d]+)\)$/);
		if (!s) s = str.match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
		let a = Math.round((+s[4] || 1) * 255);
		return {
			r: +s[1],
			g: +s[2],
			b: +s[3],
			a
		};
	},
	hsvToRgb(hsv) {
		let h = hsv.h / 60,
			s = hsv.s / 100,
			v = hsv.v / 100,
			i = Math.floor(h),
			f = h - i,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s),
			mod = i % 6,
			r = [v, q, p, p, t, v][mod],
			g = [t, v, v, q, p, p][mod],
			b = [p, p, t, v, v, q][mod];
		return {
			r: this.clamp(r * 255, 0, 255),
			g: this.clamp(g * 255, 0, 255),
			b: this.clamp(b * 255, 0, 255)
		};
	},
	rgbToHsl(rgb) {
		let hsv = this.rgbToHsv(rgb);
		return this.hsvToHsl(hsv);
	},
	rgbToHsv(rgb) {
		let r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			delta = max - min,
			hue = 0,
			value = max,
			saturation = max === 0 ? 0 : delta / max;
		switch (max) {
			case min: hue = 0; break; // achromatic
			case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
			case g: hue = (b - r) / delta + 2; break;
			case b: hue = (r - g) / delta + 4; break;
		}
		return {
			h: hue * 60 % 360,
			s: this.clamp(saturation * 100, 0, 100),
			v: this.clamp(value * 100, 0, 100)
		};
	},
	rgbToHex(rgb) {
		let d = "0123456789abcdef".split(""),
			hex = x => isNaN(x) ? "00" : d[(x-x%16)/16] + d[x%16],
			r = hex(Math.round(rgb.r)),
			g = hex(Math.round(rgb.g)),
			b = hex(Math.round(rgb.b));
		return `#${r}${g}${b}`;
	},
	hsvToHex(hsv) {
		let rgb = this.hsvToRgb(hsv);
		return this.rgbToHex(rgb);
	},
	hsvToHsl(hsv) {
		let s = hsv.s / 100,
			v = hsv.v / 100,
			l = (2 - s) * v,
			divisor = l <= 1 ? l : 2 - l, // Avoid division by zero when lightness is close to zer0
			saturation = divisor < 1e-9 ? 0 : s * v / divisor;
		return {
			h: hsv.h,
			s: this.clamp(saturation * 100, 0, 100),
			l: this.clamp(l * 50, 0, 100)
		};
	},
	hslToHsv(hsl) {
		let l = hsl.l * 2,
			s = hsl.s * (l <= 100 ? l : 200 - l) / 100, // Avoid division by zero when l + s is near 0
			saturation = l + s < 1e-9 ? 0 : 2 * s / (l + s);
		return {
			h: hsl.h,
			s: this.clamp(saturation * 100, 0, 100),
			v: this.clamp((l + s) / 2, 0, 100)
		}
	}
};
