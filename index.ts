type Input = string | HTMLImageElement;
type Output = HTMLImageElement;
type Attributes = Record<string, string>;

type ImagePromise = Promise<HTMLImageElement> & {
	image: HTMLImageElement;
};

function isArrayLike(input: any): input is ArrayLike<Input> {
	return input.length !== undefined;
}

function loadSingleImage(image: HTMLImageElement): ImagePromise {
	const promise = new Promise<HTMLImageElement>((resolve, reject) => {
		if (!image.complete) {
			image.addEventListener('load', fulfill);
			image.addEventListener('error', fulfill);
		} else if (image.naturalWidth) {
			// If the image is complete but the naturalWidth is 0px it is probably broken
			resolve(image);
		} else {
			reject(image);
		}

		function fulfill(): void {
			if (image.naturalWidth) {
				resolve(image);
			} else {
				reject(image);
			}

			image.removeEventListener('load', fulfill);
			image.removeEventListener('error', fulfill);
		}
	});

	return Object.assign(promise, {image});
}

function loadImages(input: Input, attributes?: Attributes): ImagePromise;
function loadImages(input: ArrayLike<Input>, attributes?: Attributes): Promise<Output[]>;
function loadImages(input: Input | ArrayLike<Input>, attributes: Attributes = {}): ImagePromise | Promise<Output[]> {
	if (input instanceof HTMLImageElement) {
		return loadSingleImage(input);
	}

	if (typeof input === 'string') {
		/* Create a <img> from a string */
		const src = input;
		const image = new Image();
		Object.keys(attributes).forEach(
			name => image.setAttribute(name, attributes[name])
		);
		image.src = src;
		return loadSingleImage(image);
	}

	if (isArrayLike(input)) {
		// Momentarily ignore errors
		const reflect = (img: Input): Promise<HTMLImageElement | Error> => loadImages(img, attributes).catch((error: Error) => error);
		const reflected = [].map.call(input, reflect) as Array<HTMLImageElement | Error>;
		const tsFix = Promise.all(reflected).then((results: Array<HTMLImageElement | Error>) => {
			const loaded = results.filter((x: any): x is HTMLImageElement => x.naturalWidth);
			if (loaded.length === results.length) {
				return loaded;
			}

			return Promise.reject({
				loaded,
				errored: results.filter((x: any): x is Error => !x.naturalWidth)
			});
		});

		// Variables named `tsFix` are only here because TypeScript hates Promise-returning functions.
		return tsFix;
	}

	const tsFix = Promise.reject(new TypeError('input is not an image, a URL string, or an array of them.'));
	return tsFix;
}

export default loadImages;
