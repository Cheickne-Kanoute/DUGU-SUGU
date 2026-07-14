/** @type {import('tailwindcss').Config} */
// Tailwind v4 : la configuration principale se fait dans src/index.css via @theme
// Ce fichier garde uniquement darkMode et content pour la compatibilité
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
}
