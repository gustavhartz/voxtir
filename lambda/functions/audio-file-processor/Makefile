build:
	cd src && zip -r build.zip .
	cd src && pip install --target ./package -r requirements.txt
	cd src/package && zip -r ../build.zip .
	mv src/build.zip build.zip
	rm -rf src/package
	rm -rf build