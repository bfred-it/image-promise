'use strict';

const EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

function load(src) {
	// if more than one argument, treat as
	// load('1.jpg', '2.jpg')
	if (typeof arguments[1] === 'string') {
		src = Array.apply(null, arguments);
	}

	// if first argument is an array, treat as
	// load(['1.jpg', '2.jpg'])
	if (src.map) {
		return Promise.all(src.map(load));
	}

	const image = new Image(); // putting this outside the condition avoids an IIFE in babel
	if (!load[src]) {
		load[src] = new Promise((resolve, reject) => {
			image.addEventListener('load', resolve.bind(null, image));
			image.addEventListener('error', reject.bind(null, image));
			image.src = src;

			if (image.complete) {
				resolve(image);
			}
		});
		load[src].image = image;
	}
	return load[src];
}

load.unload = function (src) {
	// if more than one argument, treat as
	// load('1.jpg', '2.jpg')
	if (typeof arguments[1] === 'string') {
		src = Array.apply(null, arguments);
	}

	// if first argument is an array, treat as
	// load(['1.jpg', '2.jpg'])
	if (src.map) {
		return Promise.all(src.map(load.unload));
	}

	if (load[src]) {
		return load[src].catch(() => {}).then(image => {
			// GC, http://www.fngtps.com/2010/mobile-safari-image-resource-limit-workaround/
			image.src = EMPTY_IMAGE;
			delete load[src];
		});
	}
	return Promise.resolve();
};

export default load;
