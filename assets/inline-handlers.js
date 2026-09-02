/*!
 * inline-handlers.js
 * Menggantikan atribut event inline (onclick / onkeydown) di index.html.
 * HTML kini hanya memakai data-onclick="..." dan data-onkeydown="...",
 * lalu file ini yang memasangkan event listener-nya saat halaman siap.
 */
(function () {
  "use strict";

  var EVENTS = ["click", "keydown"];
  var ATTR_PREFIX = "data-on";
  var BOUND_FLAG = "__inlineHandlersBound";

  function compile(code) {
    try {
      /* eslint-disable no-new-func */
      return new Function("event", code);
    } catch (err) {
      console.error("Gagal mengompilasi handler inline:", code, err);
      return null;
    }
  }

  function bind(el, type) {
    var attr = ATTR_PREFIX + type;
    var code = el.getAttribute(attr);
    if (!code) return;

    var flag = BOUND_FLAG + type;
    if (el[flag]) return;
    el[flag] = true;

    var fn = compile(code);
    if (!fn) return;

    el.addEventListener(type, function (event) {
      var result = fn.call(el, event);
      if (result === false) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  function bindAll(root) {
    var scope = root || document;
    EVENTS.forEach(function (type) {
      var nodes = scope.querySelectorAll("[" + ATTR_PREFIX + type + "]");
      Array.prototype.forEach.call(nodes, function (el) {
        bind(el, type);
      });
    });
  }

  function init() {
    bindAll(document);

    // Tetap pasang handler untuk elemen yang ditambahkan secara dinamis.
    if (typeof MutationObserver === "function") {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (node) {
            if (node.nodeType !== 1) return;
            EVENTS.forEach(function (type) {
              if (node.hasAttribute(ATTR_PREFIX + type)) bind(node, type);
            });
            bindAll(node);
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
