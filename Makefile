pages := $(patsubst src/%.html,build/%.html,$(wildcard src/*.html))

default: clean site.tar.gz

clean:
	rm -rf src/index.html build site.tar.gz

src/index.html:
	curl https://raw.githubusercontent.com/levjj/esverify/master/README.md | tail -n +4 > index.md
	pandoc index.md -o src/index.html
	rm index.md

node_modules:
	npm install
	node_modules/.bin/jspm install

build:
	mkdir build
	cp static/* build

build/%.html: src/%.html src/header.thtml src/footer.thtml build
	cat src/header.thtml $< src/footer.thtml > $@

build/style.css: src/style.less node_modules
	npm run less

build/app.js: src/app.js src/config.js src/examples.js node_modules
	npm run build

site.tar.gz: node_modules build build/index.html $(pages) build/style.css build/app.js
	mv node_modules node_modules-bak
	mv package-lock.json package-lock.json.bak
	npm install --production
	tar -czf site.tar.gz node_modules build serve.js
	rm -rf node_modules
	mv node_modules-bak node_modules
	mv package-lock.json.bak package-lock.json

image: default
	sudo docker build --rm --tag livoris/esverify-web .

run:
	sudo docker run --rm -it --name esverify-web -p 8000:80 livoris/esverify-web
