const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@thirdweb-dev/react/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#8b5cf6',
          foreground: '#ffffff'
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          DEFAULT: '#d946ef',
          foreground: '#ffffff'
        }
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#8b5cf6',
              foreground: '#ffffff'
            },
            secondary: {
              DEFAULT: '#d946ef',
              foreground: '#ffffff'
            }
          }
        }
      }
    })
  ],
  // Important: add this
  safelist: [
    {
      pattern: /^(bg|text|border)-(purple|pink|secondary|primary)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ]
}