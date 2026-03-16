/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#050111',
        'canvas-soft': '#0b0620',
        panel: '#120b24',
        'panel-strong': '#181033',
        'panel-muted': '#201542',
        line: '#2a1f49',
        ink: '#f6f2ff',
        'ink-muted': '#a89bc9',
        'ink-soft': '#7e739a',
        violet: '#a855f7',
        'violet-soft': '#c084fc',
        cyan: '#22d3ee',
        blue: '#3b82f6',
        orange: '#fb923c',
        red: '#fb7185',
        green: '#4ade80',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top, rgba(168,85,247,0.18), transparent 42%), radial-gradient(circle at 20% 20%, rgba(34,211,238,0.1), transparent 24%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.08), transparent 28%), linear-gradient(180deg, rgba(5,1,17,0.96), rgba(5,1,17,1))',
        'panel-mesh':
          'radial-gradient(circle at top left, rgba(168,85,247,0.16), transparent 38%), radial-gradient(circle at bottom right, rgba(34,211,238,0.12), transparent 32%), linear-gradient(180deg, rgba(18,11,36,0.96), rgba(12,8,27,0.98))',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,85,247,0.16), 0 20px 50px rgba(8,4,21,0.62)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,0.16), 0 18px 45px rgba(4,11,24,0.62)',
        'glow-soft': '0 16px 40px rgba(6,2,18,0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
