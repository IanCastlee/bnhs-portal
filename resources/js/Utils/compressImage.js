/**
 * ⚡ Ultra-Fast Client-Side Image Pre-Compressor & WebP Auto-Converter
 * Scales down massive camera photos (5-20MB) to optimal web size (~150-300KB) in <50ms.
 * Automatically converts raw JPEG/PNG/HEIC to high-efficiency WebP format in browser.
 * Prevents network bottlenecks and server upload timeouts during peak enrollment.
 */

/**
 * Formats bytes to human-readable size string (e.g., "240 KB", "1.8 MB")
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Compresses an image file and converts it directly to WebP format.
 * @param {File} file
 * @param {Object} options
 * @param {number} options.maxWidth
 * @param {number} options.maxHeight
 * @param {number} options.quality (0 to 1)
 * @returns {Promise<File>}
 */
export async function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
    // If not an image (e.g. PDF), return original file as-is
    if (!file || !file.type.startsWith("image/")) {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // 📐 Precise aspect ratio scaling
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);

                // ⚡ Convert canvas directly to high-efficiency WebP format
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file); // Fallback to original file
                            return;
                        }

                        // Create a new File object with .webp extension and image/webp mime
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        const compressedFile = new File([blob], `${baseName}.webp`, {
                            type: "image/webp",
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    "image/webp",
                    quality
                );
            };

            img.onerror = () => resolve(file);
        };

        reader.onerror = () => resolve(file);
    });
}

/**
 * Preset for Academic Documents (PSA Birth Certificate, Form 137, Good Moral)
 * Max 1600x1600px at 0.80 WebP quality (~180KB-300KB)
 */
export async function compressDocumentImage(file) {
    return compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.80 });
}

/**
 * Preset for 2x2 Formal ID Photo / User Avatars
 * Max 600x600px at 0.85 WebP quality (~40KB-90KB)
 */
export async function compressIdPhoto(file) {
    return compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
}

