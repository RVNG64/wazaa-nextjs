// public/modern.js

// Utilisation des fonctionnalités modernes de JavaScript
class ModernFeature {
  constructor() {
    this.name = "Modern Feature";
  }

  greet() {
    console.log(`Hello from ${this.name}!`);
  }
}

// Exécution d'un exemple avec des fonctionnalités modernes
const feature = new ModernFeature();
feature.greet();

// Utilisation des fonctionnalités modernes de DOM (si nécessaire)
document.addEventListener("DOMContentLoaded", () => {
  const div = document.createElement("div");
  div.textContent = "This is a modern feature";
  div.style.backgroundColor = "lightblue";
  document.body.appendChild(div);
});
