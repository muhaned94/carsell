/**
 * Compresses an image file by resizing it and reducing quality.
 * @param file The original image file
 * @param maxWidth The maximum width of the output image (default 1920px)
 * @param quality The quality of the output JPEG (0 to 1, default 0.8)
 * @returns A Promise that resolves to the compressed Blob
 */
export async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Image compression failed"));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
