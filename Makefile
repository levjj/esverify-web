pages := $(patsubst src/%.html,build/%.html,$(wildcard src/*.html))

default: clean site

clean:
	rm -rf src/index.html build site.tar.gz

src/index.html:
	curl https://raw.githubusercontent.com/levjj/esverify/master/README.md | tail -n +3 | pandoc -f markdown -o src/index.html

node_modules:
	npm install

src/jspm_packages: node_modules
	node_modules/.bin/jspm install

build:
	mkdir build
	cp static/* build

build/%.html: src/%.html build
	cat src/header.thtml $< src/footer.thtml > $@

build/style.css: node_modules src/jspm_packages
	npm run less

build/app.js: node_modules src/jspm_packages
	npm run build

site: node_modules build build/index.html $(pages) build/style.css build/app.js

