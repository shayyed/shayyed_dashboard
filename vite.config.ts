import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 5173 is often inside Windows excluded ranges (e.g. Hyper-V); ::1 can also fail on some setups.
  server: {
    host: '127.0.0.1',
    port: 5280,
    strictPort: false,
  },
})
