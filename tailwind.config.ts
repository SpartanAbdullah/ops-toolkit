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
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
        },
        primary: {
          50: "hsl(var(--primary-50))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          DEFAULT: "hsl(var(--primary-600))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 16px 32px -22px rgba(15, 23, 42, 0.16)",
        card: "0 10px 24px -18px rgba(15, 23, 42, 0.14)",
        glow: "0 0 0 1px rgba(37, 99, 235, 0.08), 0 14px 30px -20px rgba(37, 99, 235, 0.24)",
      },
      backgroundImage: {
        "app-radial":
          "radial-gradient(circle at top, rgba(37, 99, 235, 0.09), transparent 32%), linear-gradient(180deg, rgba(248, 250, 252, 1), rgba(255, 255, 255, 1))",
        "soft-grid":
          "linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px)",
      },
      fontFamily: {
        body: ["var(--font-inter)"],
        display: ["var(--font-inter)"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.64" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.65s ease-out both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

