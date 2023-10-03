export async function convertJpegToPng(src: string) {
	return new Promise<string>((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (ctx === null) {
				reject();
				return;
			}

			canvas.width = img.width;
			canvas.height = img.height;

			ctx.drawImage(img, 0, 0);
			resolve(canvas.toDataURL('image/png'));
		};

		img.src = src;
	});
}
