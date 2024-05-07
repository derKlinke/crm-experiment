/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ground: "var(--ground)",
        accent: "var(--accent)",
        secondary: "var(--secondary)",
        text: "var(--text)",
        primary: "var(--primary)",
        black: "var(--text)",
        white: "var(--ground)",
        highlight: "var(--highlight)",
      },
      fontFamily: {
        sans: ["config-variable", "sans-serif"],
        mono: ["fira-code", "monospace"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: "var(--text)",
            a: {
              color: "var(--highlight)",
            },
            strong: {
              color: "var(--primary)",
            },
            h1: {
              color: "var(--primary)",
              fontSize: theme("fontSize.7xl"),
              marginTop: theme("spacing.10"),
              marginBottom: theme("spacing.4"),
            },
            h2: {
              color: "var(--primary)",
              marginBottom: theme("spacing.1"),
            },
            h3: {
              color: "var(--primary)",
              marginBottom: theme("spacing.1"),
            },
            h4: {
              color: "var(--primary)",
              marginBottom: theme("spacing.1"),
            },
            h5: {
              color: "var(--primary)",
              marginBottom: theme("spacing.1"),
            },
            h6: {
              color: "var(--primary)",
              marginBottom: theme("spacing.1"),
            },
            tr: {
              color: "var(--black)",
              borderColor: "var(--accent)",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
