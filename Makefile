pages := $(patsubst public/%.html,build/%.html,$(wildcard public/*.html))

default: clean prod

clean:
	rm -rf node_modules public/index.html build esverify site.tar.gz

esverify:
	git clone https://github.com/levjj/esverify.git

public/index.html: esverify
	cat esverify/README.md | tail -n +3 | pandoc -f markdown -o $@

node_modules:
	npm install

build: node_modules
	mkdir build
	cp -r static/* build
	cp node_modules/mathjax/MathJax.js build
	mkdir -p build/jax/input
	cp -av node_modules/mathjax/jax/input/TeX build/jax/input
	mkdir -p build/jax/element/mml
	cp -av node_modules/mathjax/jax/element/mml/jax.js build/jax/element/mml
	mkdir -p build/jax/output
	cp -av node_modules/mathjax/jax/output/SVG build/jax/output
	cp -av node_modules/mathjax/jax/output/PreviewHTML build/jax/output
	mkdir -p build/extensions
	cp node_modules/mathjax/extensions/MathEvents.js build/extensions
	cp node_modules/mathjax/extensions/MathMenu.js build/extensions
	cp node_modules/mathjax/extensions/MathZoom.js build/extensions
	cp node_modules/mathjax/extensions/tex2jax.js build/extensions
	cp -av node_modules/mathjax/extensions/TeX build/extensions

build/idve.html: public/idve.html build
	head -n -1 templates/header.html | sed s/grid-lg/grid-xl/ | cat - $< templates/footer.html > $@

build/%.html: public/%.html build
	cat templates/header.html $< templates/footer.html > $@

build/style.css: node_modules
	node_modules/.bin/lessc src/style.less build/style.css

build/app.js: node_modules esverify
	npm run prod

build/tsembed.js: node_modules esverify
	npm run tsembed

build/vembed.js: node_modules esverify
	npm run vembed

dev: build/index.html node_modules esverify $(pages) build/style.css
	npm run tsembed
	npm run vembed
	npm run dev
	npm run serve

prod: build/index.html $(pages) build/style.css build/app.js build/tsembed.js build/vembed.js
