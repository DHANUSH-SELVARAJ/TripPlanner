export const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Resize image to avatar size
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);

            // Compress to 70% quality
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            callback(compressedBase64);
        };
    };
};