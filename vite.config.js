import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ["src/components"],
      dts: true,
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vuex",
        "vue-i18n",
        {
          vuex: ["useStore"],
          "vue-router": ["useRouter", "useRoute"],
          "vue-i18n": ["useI18n"],
          "@/utils/common": [
            // Optimized path alias
            "numberFormat",
            "dateFormat",
            "convertToUTC",
            "setToken",
            "getToken",
            "removeToken",
          ],
        },
      ],
      dts: "./auto-imports.d.ts",
      eslintrc: {
        enabled: true,
        filepath: "./.eslintrc-auto-import.json",
        globalsPropValue: true,
      },
    }),
  ],
  server: {
    port: 5174,
    host: true,
    watch: {
      // Ignore icon-fonts directory to reduce file watchers
      ignored: ['**/src/assets/icon-fonts/**', '**/node_modules/**']
    }
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    "process.env": process.env,
  }
});
