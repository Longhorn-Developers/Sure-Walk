/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "ut-burntorange": "##BF5700",
      },
      fontFamily: {
        thin: ["Geist_100Thin"],
        extralight: ["Geist_200ExtraLight"],
        light: ["Geist_300Light"],
        regular: ["Geist_400Regular"],
        medium: ["Geist_500Medium"],
        semibold: ["Geist_600SemiBold"],
        bold: ["Geist_700Bold"],
        extrabold: ["Geist_800ExtraBold"],
        black: ["Geist_900Black"],
      },
    },
  },
  plugins: [],
};
