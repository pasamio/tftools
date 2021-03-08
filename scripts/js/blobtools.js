const fetchAsBlob = url => fetch(url)
.then(response => response.blob());

const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
const reader = new FileReader;
reader.onerror = reject;
reader.onload = () => {
    resolve(reader.result);
};
reader.readAsDataURL(blob);
});
