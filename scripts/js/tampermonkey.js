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


/**
 * Waits for an element satisfying selector to exist, then resolves promise with the element.
 * Useful for resolving race conditions.
 * Source: https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
 *
 * @param selector
 * @returns {Promise}
 */
function elementReady(selector) {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {resolve(el);}
    new MutationObserver((mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        //Once we have resolved we don't need the observer anymore.
        observer.disconnect();
      });
    })
      .observe(document.documentElement, {
        childList: true,
        subtree: true
      });
  });
}
