export default function load(image) {
	if (typeof image === 'string') {
		// If image is a string, "convert" it to an <img>
		const src = image;
		image = new Image();
		image.src = src;
	} else if (image.length !== undefined) {
		// If image is Array-like, treat as
		// load(['1.jpg', '2.jpg'])
		return Promise.all([].map.call(image, load));
	}

	const promise = new Promise((resolve, reject) => {
		function fullfill(e) {
			image.removeEventListener('load', fullfill);
			image.removeEventListener('error', fullfill);
			if (e.type === 'load') {
				resolve(image);
			} else {
				reject(image);
			}
		}
		if (image.complete) {
			resolve(image);
		} else {
			image.addEventListener('load', fullfill);
			image.addEventListener('error', fullfill);
		}
	});
	promise.image = image;
	return promise;
}
