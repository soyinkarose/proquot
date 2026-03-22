
// Simple include loader: fetches HTML fragments and inserts them into elements with data-include
async function loadIncludes(){
	const nodes = document.querySelectorAll('[data-include]');
	const cache = {};
	await Promise.all(Array.from(nodes).map(async node => {
		let spec = node.getAttribute('data-include');
		let url = spec;
		let selector = null;
		if(spec.includes('#')){
			[url, selector] = spec.split('#');
			selector = '#' + selector;
		}

		try{
			let html;
			if(cache[url]){
				html = cache[url];
			}else{
				const res = await fetch(url);
				if(!res.ok) throw new Error('Not found');
				html = await res.text();
				cache[url] = html;
			}

			if(selector){
				const tmp = document.createElement('div');
				tmp.innerHTML = html;
				const frag = tmp.querySelector(selector);
				if(frag) node.innerHTML = frag.innerHTML;
				else node.innerHTML = '';
			}else{
				node.innerHTML = html;
			}

			const yearEl = document.getElementById('year');
			if(yearEl) yearEl.textContent = new Date().getFullYear();
		}catch(e){
			console.warn('Include failed:', url, e);
			// Fallback: if running from file:// where fetch is blocked, inject simple header/footer templates
			try{
				if(spec.includes('#header') || spec.endsWith('#header')){
					node.innerHTML = `
						<div class="site-header">
							<div class="header-inner container">
								<a class="brand" href="index.html"><img src="assets/proquot-logo.png" alt="Proquot" class="logo"></a>
								<nav class="main-nav">
									<a href="index.html">Home</a>
									<a href="index.html#services">Services</a>
									<a href="about.html">About</a>
									<a href="Contact.html">Contact</a>
								</nav>
							</div>
						</div>
					`;
				}else if(spec.includes('#footer') || spec.endsWith('#footer')){
					node.innerHTML = `
						<div class="site-footer">
							<div class="footer-inner container">
								<p>© <span id="year"></span> Proquot — Enterprise Solutions</p>
								<nav class="footer-nav">
									<a href="#">Privacy</a>
									<a href="#">Terms</a>
								</nav>
							</div>
						</div>
					`;
				}
				const yearEl = document.getElementById('year');
				if(yearEl) yearEl.textContent = new Date().getFullYear();
			}catch(f){
				console.warn('Fallback include failed', f);
			}
		}
	}));
}

document.addEventListener('DOMContentLoaded', ()=>{
	loadIncludes();
});
