default: site.tar.gz

clean:
	rm -rf src/index.html node_modules build site.tar.gz

node_modules:
	npm install

src/index.html:
	git clone https://github.com/levjj/esverify.git
	pandoc ./esverify/README.md -o src/index.html
	rm -rf esverify

build: src/index.html node_modules
	npm run build

site.tar.gz: build
	rm -rf node_modules
	npm install --production
	tar -czf site.tar.gz node_modules build serve.js
	npm install

image: default
	sudo docker build --rm --tag livoris/esverify-web .

run:
	sudo docker run --rm -it --name esverify-web -p 3000:3000 livoris/esverify-web
