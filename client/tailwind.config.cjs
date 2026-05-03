const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50:  "#E8F5EE",
              100: "#C8DDD0",
              200: "#A0C4B1",
              300: "#6EA88C",
              400: "#3D8C68",
              500: "#00563F",
              600: "#004D39",
              700: "#003D2B",
              800: "#002D1F",
              900: "#001A11",
              DEFAULT: "#00563F",
              foreground: "#FFFFFF",
            },
            secondary: {
              50:  "#FFFDE8",
              100: "#FFF9C4",
              200: "#FFF59D",
              300: "#FFF176",
              400: "#FFEE58",
              500: "#F5D130",
              600: "#CBA135",
              700: "#9E7A1C",
              800: "#6B5012",
              900: "#3A2A08",
              DEFAULT: "#F5D130",
              foreground: "#003D2B",
            },
          },
        },
      },
    }),
  ],
};
