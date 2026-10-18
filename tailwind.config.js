/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}", "./js/**/*.{js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          // 現代瀏覽器優先：直接匹配系統最優字體（iOS=蘋方, Android=思源, Windows=正黑體）
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          // 舊瀏覽器 fallback（不支援 system-ui 時的保底策略）
          '"PingFang HK"',
          '"Noto Sans TC"',
          '"Microsoft JhengHei"',
          'sans-serif',
        ],
      },
      // 保持 spacing 擴展以保留使用 top-safe-top 等定位工具類的彈性
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
