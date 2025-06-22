/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Esto le dice a Tailwind dónde buscar clases para optimizar el CSS
  ],
  theme: {
    extend: {
      // Dejamos esta sección vacía. No vamos a definir colores aquí.
      // Nuestro centro de operaciones será styles.css
    },
  },
  plugins: [
    require('daisyui'), // ¡Aquí activamos la magia de DaisyUI!
  ],
};