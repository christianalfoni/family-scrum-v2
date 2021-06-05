const colors = require("tailwindcss/colors");

module.exports = {
  purge: {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/overview-components/**/*.{js,ts,jsx,tsx}",
      "./src/app-components/**/*.{js,ts,jsx,tsx}",
      "./src/common-components/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // GroceryFilterButtons
        'border-red-600',
        'border-green-600',
        'border-yellow-600',
        'border-blue-600',
        'border-gray-600',
        'focus:border-red-600',
        'focus:border-green-600',
        'focus:border-yellow-600',
        'focus:border-blue-600',
        'focus:border-gray-600',
        'focus:ring-red-600',
        'focus:ring-green-600',
        'focus:ring-yellow-600',
        'focus:ring-blue-600',
        'focus:ring-gray-600',
      ]
    }
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "light-blue": colors.lightBlue,
        teal: colors.teal,
        cyan: colors.cyan,
        rose: colors.rose,
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
};
