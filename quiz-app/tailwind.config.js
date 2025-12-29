/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lark: {
          primary: {
            DEFAULT: '#3370ff',
            hover: '#2957cc',
            active: '#2046a6',
            light: '#e1eaff',
            lighter: '#f0f4ff',
          },
          success: {
            DEFAULT: '#00b856',
            bg: '#e8ffe8',
          },
          warning: {
            DEFAULT: '#ff8800',
            bg: '#fff5e8',
          },
          error: {
            DEFAULT: '#ff4d4f',
            bg: '#ffe8e8',
          },
          gray: {
            1: '#f7f8fa', // 浅背景
            2: '#e5e6eb', // 边框线
            3: '#c9cdd4', // 禁用
            4: '#8f959e', // 辅助
            5: '#5f6672', // 次要
            6: '#43474e', // 正文
            7: '#1f2329', // 标题
          }
        }
      },
      borderRadius: {
        'lark-sm': '4px',
        'lark-md': '8px',
        'lark-lg': '12px',
        'lark-xl': '16px',
      },
      boxShadow: {
        'lark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'lark-base': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'lark-md': '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
        'lark-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
