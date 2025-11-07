import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"

const config: Config = {
  theme: {
    extend: {
      colors: {
        "status-dispatched": {
          100: colors.yellow[100],
          200: colors.yellow[200],
          300: colors.yellow[300],
          400: colors.yellow[400],
          500: colors.yellow[500],
          600: colors.yellow[600],
        },
        "status-loaded": {
          100: colors.green[100],
          200: colors.green[200],
          300: colors.green[300],
          400: colors.green[400],
          500: colors.green[500],
          600: colors.green[600],
        },
        "status-notified": colors.emerald[600],
        "status-delayed": {
          100: colors.orange[100],
          200: colors.orange[200],
          300: colors.orange[300],
          400: colors.orange[400],
          500: colors.orange[500],
          600: colors.orange[600],
        },
        "status-cancelled": {
          100: colors.red[100],
          200: colors.red[200],
          300: colors.red[300],
          400: colors.red[400],
          500: colors.red[500],
          600: colors.red[600],
        },
        "status-delivered": {
          100: colors.gray[100],
          200: colors.gray[200],
          300: colors.gray[300],
          400: colors.gray[400],
        },
      },
    },
  },
}

export default config
