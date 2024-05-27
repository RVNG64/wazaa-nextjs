// public/legacy.js

// Polyfills pour les fonctionnalités modernes non supportées par les anciens navigateurs
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);
    var len = o.length >>> 0;

    if (len === 0) {
      return false;
    }

    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (o[k] === searchElement) {
        return true;
      }
      k++;
    }

    return false;
  };
}

// Utilisation de syntaxes compatibles avec les anciens navigateurs
function LegacyFeature() {
  this.name = "Legacy Feature";
}

LegacyFeature.prototype.greet = function() {
  console.log("Hello from " + this.name + "!");
};

// Exécution d'un exemple avec des fonctionnalités compatibles
var feature = new LegacyFeature();
feature.greet();

// Utilisation de DOM de manière compatible (si nécessaire)
document.addEventListener("DOMContentLoaded", function() {
  var div = document.createElement("div");
  div.textContent = "This is a legacy feature";
  div.style.backgroundColor = "lightcoral";
  document.body.appendChild(div);
});
