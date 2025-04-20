/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "current-line": "var(--current-line)",
        selection: "var(--selection)",
        foreground: "var(--foreground)",
        comment: "var(--comment)",
        cyan: "var(--cyan)",
        green: "var(--green)",
        orange: "var(--orange)",
        pink: "var(--pink)",
        purple: "var(--purple)",
        red: "var(--red)",
        yellow: "var(--yellow)",
      },
    },
  },
};
