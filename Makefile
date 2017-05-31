pages := $(patsubst src/%.html,build/%.html,$(wildcard src/*.html))

default: clean site.tar.gz

clean:
	rm -rf src/index.html build site.tar.gz

src/index.html:
	git clone https://github.com/levjj/esverify.git
	tail -n +4 esverify/README.md > esverify/index.md
	pandoc ./esverify/index.md -o src/index.html
	rm -rf esverify

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
	sudo docker run --rm -it --name esverify-web -p 3000:3000 livoris/esverify-web
