import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        app: {
          background: "hsl(var(--app-background))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          raised: "hsl(var(--surface-raised))",
          muted: "hsl(var(--surface-muted))",
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
        },
        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          DEFAULT: "hsl(var(--primary-600))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          50: "hsl(var(--accent-50))",
          100: "hsl(var(--accent-100))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          DEFAULT: "hsl(var(--accent-500))",
          foreground: "hsl(var(--accent-foreground))",
        },
        mint: {
          50: "hsl(var(--mint-50))",
          100: "hsl(var(--mint-100))",
          500: "hsl(var(--mint-500))",
          600: "hsl(var(--mint-600))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          50: "hsl(var(--success-50))",
          600: "hsl(var(--success-600))",
          DEFAULT: "hsl(var(--success-600))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          50: "hsl(var(--warning-50))",
          600: "hsl(var(--warning-600))",
          DEFAULT: "hsl(var(--warning-600))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          50: "hsl(var(--danger-50))",
          600: "hsl(var(--danger-600))",
          DEFAULT: "hsl(var(--danger-600))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 12px 32px -20px rgba(15, 23, 42, 0.18)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -18px rgba(15, 23, 42, 0.10)",
        elevated: "0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 18px 40px -24px rgba(15, 23, 42, 0.24)",
        focus: "0 0 0 4px hsla(36, 92%, 50%, 0.18)",
        fab: "0 10px 28px -8px rgba(15, 23, 42, 0.35), 0 4px 10px -2px rgba(15, 23, 42, 0.18)",
      },
      fontFamily: {
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
