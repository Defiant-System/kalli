
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
				code = `
<img id="hello" src="/res/images/hello_white.png" alt=""/>
<script type="text/javascript">
// Generated with Longscript - Hakan Bilgin (c) 2023
// Website: http://www.longscript.com
var LS={O:{e:/MSIE [678]/i.test(navigator.userAgent),z:0,r:0,S:20,p:false,g:Math.PI*2},I:function(o){if(this.O.p||this.O.e)return;this.X(this.O,o);var c=this,q=function(n){return document.createElement(n);},y=function(n){return document.getElementById(n);},v=y(c.O.id),i=new Image();c.l=q('canvas');c.t=c.l.getContext('2d');c.o=v.parentNode.insertBefore(q('canvas'),v.nextSibling);c.n=c.o.getContext('2d');c.f=q('canvas');c.m=c.f.getContext('2d');c.o.style.position='absolute';c.o.style.top=v.offsetTop+'px';c.o.style.left=v.offsetLeft+'px';v.style.opacity=0;i.onload=function(){var t=c;t.o.width=t.l.width=t.f.width=this.width;t.o.height=t.l.height=t.f.height=this.height;t.O.img=this;t.P();};i.src=c.O.Q||c.O.src;},P:function(){var a=LS,s=a.O,l=a.l,t=a.t;if(s.b){s.b=false;}else{t.clearRect(0,0,l.width,l.height);s.z=0;}s.p=true;a.D();},D:function(){var a=LS,s=a.O,fI=s.z,u=s.F[fI],PI2=s.g,o=a.o,n=a.n,l=a.l,t=a.t,f=a.f,m=a.m,w=f.width,h=f.height,h,w;if(!u||s.z > s.F.length){if(s.complete){s.complete();}s.b=true;s.p=false;clearTimeout(s.d);return;}m.clearRect(0,0,w,h);n.clearRect(0,0,w,h);for(var j=0,jl=u.length;j<jl;j++){h=u[j];t.beginPath();t.arc(h[0],h[1],h[2],0,PI2,false);t.fill();}m.globalCompositeOperation='source-over';m.drawImage(a.l,0,0);m.globalCompositeOperation='source-in';m.drawImage(s.img,0,0);n.drawImage(f,0,0);if(s.step)s.step(s.z+1);s.z++;s.d=setTimeout(a.D,s.S);},X:function(o,e){for(var c in e){if(!o[c]||typeof(e[c])!=='object'){o[c]=e[c];}else{this.X(o[c],e[c]);}}}};
LS.I({
	id: 'hello',
	S: 20,
	F: [[[0,0,1],[0,0,2],[0,0,3]]]
});
</script>`;
				value = hljs.highlight(code, { language: "xml" }).value;
				Self.els.codeArea.html(value);
				break;
			case "switch-exit-event":
				break;
		}
	}
}