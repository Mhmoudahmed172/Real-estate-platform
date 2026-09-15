import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
        },
        header: "hsl(var(--header))",
        "primary-soft": "hsl(var(--primary-soft))",
        "secondary-soft": "hsl(var(--secondary-soft))",
        "tertiary-soft": "hsl(var(--tertiary-soft))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        popover: "var(--shadow-popover)",
      },
      spacing: {
        header: "var(--header-height)",
        sidebar: "var(--sidebar-width)",
      },
      width: {
        sidebar: "var(--sidebar-width)",
      },
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", "Inter", "system-ui", "sans-serif"],
        numeric: ["Inter", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        fast: "150ms",
        base: "220ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
