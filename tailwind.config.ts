
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					"50": "#eff8ff",
					"100": "#dbeefe",
					"200": "#bee1fd",
					"300": "#91cefb",
					"400": "#5db2f7",
					"500": "#3994f2",
					"600": "#2577e7",
					"700": "#1f63d3",
					"800": "#2051ab",
					"900": "#1e4689",
					"950": "#172b53",
				},
				success: {
					"50": "#eefbf3",
					"100": "#d7f4e1",
					"200": "#b3e7c9",
					"300": "#82d4a8",
					"400": "#4eb981",
					"500": "#36a266",
					"600": "#268050",
					"700": "#286744",
					"800": "#26513a",
					"900": "#224432",
					"950": "#10261a",
				},
				warning: {
					"50": "#fff9ec",
					"100": "#ffefd1",
					"200": "#ffdca2",
					"300": "#ffc166",
					"400": "#ffa035",
					"500": "#ff870f",
					"600": "#fb6b06",
					"700": "#cd5004",
					"800": "#a13e09",
					"900": "#83330d",
					"950": "#461903",
				},
				danger: {
					"50": "#fff1f2",
					"100": "#ffe1e3",
					"200": "#ffc8cd",
					"300": "#ffa3ad",
					"400": "#ff7a8a",
					"500": "#fb4c61",
					"600": "#e52c43",
					"700": "#c11a31",
					"800": "#a1182b",
					"900": "#861829",
					"950": "#490812",
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
