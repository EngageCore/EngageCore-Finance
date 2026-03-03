<template>
  <div class="p-4 h-auto w-full">
    <div class="max-w-full mx-auto w-full">
      <n-card
        :title="$t(title)"
        size="small"
        class="shadow-sm rounded-lg overflow-auto w-full"
        bordered
      >
        <!-- 描述 -->
        <template v-if="description">
          <n-text depth="3" class="text-sm mb-4 block -mt-2">
            {{ $t(description) }}
          </n-text>
        </template>

        <!-- Responsive Grid Based on Actual Width -->
        <div ref="containerRef" class="w-full">
          <n-grid :cols="cols" x-gap="32" y-gap="20">
            <n-gi v-for="(item, index) in items" :key="index">
              <div class="flex items-center gap-4 w-full">
                
                <!-- label -->
                <n-tag
                  size="small"
                  :type="item.tagType || 'info'"
                  :class="item.labelClass"
                  :style="item.labelStyle"
                >
                  {{ $t(item.label) }}
                </n-tag>

                <!-- value -->
                <n-text strong>
                  {{ item.isAmount ? formatAmount(item.value) : formatAmount(item.value, true) }}
                </n-text>

              </div>
            </n-gi>
          </n-grid>
        </div>

      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { NCard, NText, NTag, NGrid, NGi } from "naive-ui"
import { useI18n } from "vue-i18n"
import { formatAmount } from "@/utils/common"

const { t } = useI18n()

const props = defineProps({
  title: String,
  description: String,
  items: {
    type: Array,
    default: () => []
  }
})

/* --------------------------------------
   Responsive Columns (Actual Width)
--------------------------------------- */
const containerRef = ref(null)
const cols = ref(1)

const updateCols = () => {
  const width = containerRef.value?.offsetWidth || 0

  if (width >= 1200) cols.value = 4       // desktop large
  else if (width >= 900) cols.value = 3   // desktop small / tablet landscape
  else if (width >= 600) cols.value = 2   // tablet portrait / big phone
  else cols.value = 1                     // normal phone
}

onMounted(() => {
  updateCols()
  window.addEventListener("resize", updateCols)
})

onUnmounted(() => {
  window.removeEventListener("resize", updateCols)
})
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>
