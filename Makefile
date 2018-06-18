pages := $(patsubst public/%.html,build/%.html,$(wildcard public/*.html))

default: clean site

clean:
	rm -rf node_modules public/index.html build esverify site.tar.gz

esverify:
	git clone https://github.com/levjj/esverify.git

public/index.html: esverify
	cat esverify/README.md | tail -n +3 | pandoc -f markdown -o $@

node_modules:
	npm install

build:
	mkdir build
	cp static/* build

build/ide.html: public/ide.html build
	head -n -1 templates/header.html | sed s/grid-lg/grid-xl/ | cat - $< templates/footer.html > $@

build/%.html: public/%.html build
	cat templates/header.html $< templates/footer.html > $@

build/style.css: node_modules
	node_modules/.bin/lessc src/style.less build/style.css

build/app.js: node_modules esverify
	npm run prod

dev: node_modules esverify $(pages) build/style.css
	npm run dev
	npm run serve

prod: build/index.html $(pages) build/style.css build/app.js
