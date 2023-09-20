clean: 
	rm -rf build

build-ffmpeg:
	mkdir -p build
	# Get resources
	wget -P build https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
	wget -P build https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz.md5
	cd build && md5sum -c ffmpeg-release-amd64-static.tar.xz.md5
	tar -xvf build/ffmpeg-release-amd64-static.tar.xz -C build
	# Create layer
	mkdir -p build/ffmpeg/bin
	# Grab whatever ffmpeg binary is in the folder
	mv build/ffmpeg-6.0-amd64-static/ffmpeg build/ffmpeg/bin/
	mv build/ffmpeg-6.0-amd64-static/ffprobe build/ffmpeg/bin/
	cd build/ffmpeg && zip -r ../../ffmpeg.zip .




	