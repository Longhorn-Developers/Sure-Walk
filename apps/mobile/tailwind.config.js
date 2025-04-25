/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { // NOTE: Add your custom Tailwind colors here
        'ut-burntorange': "##BF5700",
      },
    }
  },
  plugins: [],
}