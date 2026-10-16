/* Reads text out of a photo or screenshot, in the browser. Uses the open source Tesseract.js, loaded on first use.
   The picture is never uploaded. Only the OCR engine and its English language file are downloaded. */
(function () {
  var SRC = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js", lib = null;
  function load() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (lib) return lib;
    lib = new Promise(function (ok, bad) { var s = document.createElement("script"); s.src = SRC; s.onload = function () { ok(window.Tesseract); }; s.onerror = function () { lib = null; bad(new Error("Could not load the text reader. Check your connection and try again.")); }; document.head.appendChild(s); });
    return lib;
  }
  function toImage(file) { return new Promise(function (ok, bad) { var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { URL.revokeObjectURL(u); ok(i); }; i.onerror = function () { bad(new Error("That file is not a picture I can open.")); }; i.src = u; }); }
  // Two looks at the same picture. "photo": the lowest of red, green, blue, flipped, which turns light text on a dark
  // or coloured screen (also selected text) into dark text on white. "screen": plain grayscale, for normal dark on light text.
  function prepare(img, mode) {
    var w = img.naturalWidth, h = img.naturalHeight, scale = w < 1000 ? 2 : w < 2200 ? 1.5 : 1;
    if (w * scale > 3000) scale = 3000 / w;
    var cv = document.createElement("canvas"); cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
    var x = cv.getContext("2d"); x.drawImage(img, 0, 0, cv.width, cv.height);
    var d = x.getImageData(0, 0, cv.width, cv.height), p = d.data, n = p.length / 4, i, v;
    for (i = 0; i < n; i++) { v = mode === "photo" ? 255 - Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]) : 0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2]; p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255; }
    x.putImageData(d, 0, 0); return cv;
  }
  // Tesseract often reads 0 as O and 1 as l inside hex values like 0xC0000005
  function tidy(t) {
    return t.replace(/\r/g, "").replace(/(^|[^A-Za-z0-9])([0Oo@]x)([0-9A-Za-z@|]{3,})/g, function (m, pre, x, rest) { return pre + "0x" + rest.replace(/[Oo@]/g, "0").replace(/[lI|]/g, "1"); })
      .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function score(t) { return (t.match(/[A-Za-z0-9]{3,}/g) || []).length + 6 * (t.match(/0x[0-9a-f]{6,}|\.(exe|dll|asi)\b|exception|fault|error/gi) || []).length; }
  function read(file, onProgress) {
    return Promise.all([load(), toImage(file)]).then(function (r) {
      var T = r[0], img = r[1], modes = ["photo", "screen"], best = "", i = 0, worker;
      return T.createWorker("eng", 1, { logger: function (l) { if (onProgress && l.status) onProgress(l.status, (i - 1 + (l.progress || 0)) / modes.length); } }).then(function (w) {
        worker = w; return w.setParameters({ tessedit_pageseg_mode: "6" });
      }).then(function () {
        function next() {
          if (i >= modes.length) return Promise.resolve(best);
          var m = modes[i++];
          return worker.recognize(prepare(img, m)).then(function (res) { var t = tidy(res.data.text || ""); if (score(t) > score(best)) best = t; return next(); });
        }
        return next();
      }).then(function (t) { return worker.terminate().then(function () { return t; }); });
    });
  }
  window.OCR = { read: read, tidy: tidy };
})();
