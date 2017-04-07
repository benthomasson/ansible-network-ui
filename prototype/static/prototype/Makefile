.PHONY: all main lint lessc

all: clean lessc lint main istanbul

clean:
	rm -rf src-instrumented
	rm -f js/bundle.js
	rm -f css/style.css

main:
	browserify src/main.js  --standalone main -o js/bundle.js
	cp vendor/*.js js/

lint:
	jshint --verbose src/*js

lessc:
	lessc src/style.less css/style.css

istanbul:
	istanbul instrument --output src-instrumented src
	browserify src-instrumented/main.js  --standalone main -o js/bundle-instrumented.js
	cp index.html index-instrumented.html
	sed -i "" "s/bundle.js/bundle-instrumented.js/g" index-instrumented.html
	cp vendor/*.js js/
