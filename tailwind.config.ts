import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: '#ef6824',
  			'primary-dim': '#FFE3D4',
  			'primary-variant': '#d95f21',
  			'primary-green': '#37582A',
  			'primary-green-dim': '#CFE298',
  			'primary-light-blue': '#F1F5F9',
  			'primary-member-blue': '#64B5DA',
  			'primary-gray': '#283C43',
  			'primary-teal': '#2b9365',
			// Typography
  			default: '#0f172a',
  			label: '#64748b',
  			'label-dark': '#94a3b8'
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
  plugins: [require('tailwindcss-animate')]
}
export default config
