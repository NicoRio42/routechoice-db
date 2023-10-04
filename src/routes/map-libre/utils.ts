export async function resizeImageIfNedded(src: string) {
	return new Promise<string>((resolve, reject) => {
		const canvas2 = document.createElement('canvas');
		const gl = canvas2.getContext('webgl');
		const maxTextureSize: number | null = gl !== null ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null;

		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		img.onload = () => {
			if (ctx === null) {
				reject();
				return;
			}

			const [width, height] =
				maxTextureSize === null
					? [img.width, img.height]
					: computeResizedWidthHeight(img.width, img.height, maxTextureSize);

			console.log([width, height]);
			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL());
		};

		img.src = src;
	});
}

function computeResizedWidthHeight(
	imageWidth: number,
	imageHeight: number,
	maxTextureSize: number
): [number, number] {
	if (imageWidth <= maxTextureSize && imageHeight <= maxTextureSize) {
		return [imageWidth, imageHeight];
	}

	if (imageWidth > maxTextureSize && imageHeight > maxTextureSize) {
		if (imageWidth > imageHeight) {
			return [maxTextureSize, (maxTextureSize * imageHeight) / imageWidth];
		} else {
			return [(maxTextureSize * imageWidth) / imageHeight, maxTextureSize];
		}
	}

	if (imageWidth > maxTextureSize) {
		return [maxTextureSize, (maxTextureSize * imageHeight) / imageWidth];
	}

	// if imageHeight > maxTextureSize
	return [(maxTextureSize * imageWidth) / imageHeight, maxTextureSize];
}
