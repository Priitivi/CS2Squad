module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transform: ['group-hover'],
      rotate: ['group-hover'],
      perspective: {
        '1000': '1000px',
      },
      transformStyle: {
        preserve3d: 'preserve-3d',
      },
    },
  },
  plugins: [],
}
