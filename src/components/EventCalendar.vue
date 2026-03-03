<template>
  <div class="p-4 h-auto relative">
    <n-card :segmented="true" size="small" class="shadow-sm rounded-lg">
      <n-collapse :default-expanded-names="['calendar']">
        <n-collapse-item name="calendar">
          <!-- Header -->
          <template #header>
            <div class="flex justify-between items-center w-full">
              <n-text strong>{{ $t('event_calendar') }}</n-text>
              <n-button size="tiny" tertiary @click.stop="handleToggleView">
                {{ viewMode === 'double' ? $t('single_month') : $t('double_month') }}
              </n-button>
            </div>
          </template>

          <!-- Calendar Container -->
          <div
            :class="[
              'relative flex flex-wrap justify-center items-center gap-4 mt-2',
              viewMode === 'double' ? 'flex-row' : 'flex-col',
              isDark ? 'calendar-dark' : 'calendar-light'
            ]"
          >
            <!-- 左箭头 -->
            <n-button
              quaternary
              circle
              size="small"
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 nav-arrow-left"
              @click.stop="handlePrevGlobal"
            >
              <n-icon><ChevronBackOutline /></n-icon>
            </n-button>

            <!-- Calendar(s) -->
            <div
              v-for="offset in (viewMode === 'double' ? [0, 1] : [0])"
              :key="offset"
              class="calendar-box rounded-lg shadow-sm p-4 border"
            >
              <div class="flex justify-center mb-2">
                <span class="font-semibold">
                  {{ $t(monthNames[getMonth(year, month + offset)]) }}
                  {{ getYear(year, month + offset) }}
                </span>
              </div>

              <!-- Week headers -->
              <div class="grid grid-cols-7 text-center text-sm font-semibold mb-1">
                <div v-for="w in weekDays" :key="w">{{ $t(w) }}</div>
              </div>

              <!-- Days -->
              <div class="calendar-grid text-xs">
                <div
                  v-for="(d, i) in getDaysInMonth(getYear(year, month + offset), getMonth(year, month + offset))"
                  :key="i"
                  class="calendar-day relative"
                  :class="{ today: d.isToday, 'not-current': !d.inCurrentMonth }"
                >
                  <!-- 🖥 桌面端 tooltip -->
                  <n-tooltip
                    v-if="!isMobile && getEventsForDate(d.date).length"
                    trigger="hover"
                    :delay="100"
                    placement="top"
                  >
                    <template #trigger>
                      <div
                        @click="showEvents(d.date)"
                        class="day-content flex items-center justify-center w-full h-full"
                      >
                        {{ d.day }}
                        <div
                          v-if="d.inCurrentMonth"
                          v-for="(ev, idx) in getEventsForDate(d.date)"
                          :key="idx"
                          class="absolute right-1 bottom-1 w-2 h-2 rounded-full event-dot"
                        ></div>
                      </div>
                    </template>
                    <div class="text-sm p-1 max-w-[200px]">
                      <div
                        v-for="(ev, idx) in getEventsForDate(d.date)"
                        :key="idx"
                        class="text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {{ ev.name }}  
                        <div class="text-xs opacity-70">{{ formatDate(ev.startAt) }} - {{ formatDate(ev.endAt) }}</div>
                      </div>
                    </div>
                  </n-tooltip>

                  <!-- 📱 手机版：直接点击打开 modal -->
                  <div
                    v-else
                    @click="showEvents(d.date)"
                    class="day-content flex items-center justify-center w-full h-full"
                  >
                    {{ d.day }}
                    <div
                      v-if="d.inCurrentMonth"
                      v-for="(ev, idx) in getEventsForDate(d.date)"
                      :key="idx"
                      class="absolute right-1 bottom-1 w-2 h-2 rounded-full event-dot"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右箭头 -->
            <n-button
              quaternary
              circle
              size="small"
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 nav-arrow-right"
              @click.stop="handleNextGlobal"
            >
              <n-icon><ChevronForwardOutline /></n-icon>
            </n-button>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <!-- 活动弹窗 -->
    <n-modal v-model:show="modalVisible" preset="card" :title="$t('event_details')" class="w-80">
      <div v-if="selectedEvents.length">
        <div
          v-for="(ev, index) in selectedEvents"
          :key="index"
          class="mb-2 p-2 rounded"
        >
          <n-text strong>{{ ev.name }}</n-text>
          <div class="text-xs text-gray-500">
            {{ formatDate(ev.startAt) }} - {{ formatDate(ev.endAt) }}
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-400">{{ $t('no_event') }}</div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { NCard, NCollapse, NCollapseItem, NText, NButton, NIcon, NModal, NTooltip } from 'naive-ui'
import { ChevronBackOutline, ChevronForwardOutline } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { useThemeStore } from '@/store/useThemeStore'

defineOptions({ name: 'EventCalendar' })
const { t } = useI18n()

// 🌗 主题与设备检测
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.darkMode)
const isMobile = computed(() => window.innerWidth < 768)

// Props
const props = defineProps({
  fetchEvents: Function,
  events: { type: Array, default: () => [] }
})

// Emits
const emit = defineEmits(['changeDate'])

//#region State
const viewMode = ref('double')
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const modalVisible = ref(false)
const selectedEvents = ref([])
const localEvents = ref([])
//#endregion

//#region Localization
const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const monthNames = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]
//#endregion

//#region Date & Event
const getMonth = (y, m) => ((m % 12) + 12) % 12
const getYear = (y, m) => y + Math.floor(m / 12)
const isToday = (d) => {
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}
const normalizeDate = (d) => {
  if (!d) return null
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}
const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')

const getDaysInMonth = (y, m) => {
  const days = []
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const offset = first.getDay()
  for (let i = 0; i < offset; i++) {
    days.push({ day: '', date: null, inCurrentMonth: false, isToday: false })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(y, m, d)
    days.push({ day: d, date, inCurrentMonth: true, isToday: isToday(date) })
  }
  while (days.length < 42) {
    days.push({ day: '', date: null, inCurrentMonth: false, isToday: false })
  }
  return days
}

const getEventsForDate = (date) => {
  if (!date) return []
  const target = normalizeDate(date)
  return localEvents.value.filter((e) => {
    const start = normalizeDate(e.startAt)
    const end = normalizeDate(e.endAt)
    return target >= start && target <= end
  })
}

const showEvents = (date) => {
  selectedEvents.value = getEventsForDate(date)
  if (selectedEvents.value.length) modalVisible.value = true
}
//#endregion

//#region Fetch Logic
const fetchCalendarEvents = async () => {
  const startMonth = month.value
  const endMonth = viewMode.value === 'double' ? month.value + 1 : month.value
  const startAt = dayjs(new Date(getYear(year.value, startMonth), getMonth(year.value, startMonth), 1)).format('YYYY-MM-DD')
  const endAt = dayjs(new Date(getYear(year.value, endMonth), getMonth(year.value, endMonth) + 1, 0)).format('YYYY-MM-DD')
  emit('changeDate', { startAt, endAt })
  if (props.fetchEvents) {
    const result = await props.fetchEvents({ startAt, endAt })
    if (Array.isArray(result)) localEvents.value = result
  } else {
    localEvents.value = props.events
  }
}
//#endregion

//#region Navigation
const handlePrevGlobal = () => {
  month.value -= viewMode.value === 'double' ? 2 : 1
  fetchCalendarEvents()
}
const handleNextGlobal = () => {
  month.value += viewMode.value === 'double' ? 2 : 1
  fetchCalendarEvents()
}
const handleToggleView = () => {
  viewMode.value = viewMode.value === 'double' ? 'single' : 'double'
  fetchCalendarEvents()
}
//#endregion

watch(() => props.events, (val) => {
  if (Array.isArray(val)) localEvents.value = val
}, { deep: true, immediate: true })

onMounted(fetchCalendarEvents)
</script>

<style scoped>
.calendar-box {
  width: 320px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 40px);
  text-align: center;
}
.calendar-day {
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}
.calendar-day.today {
  font-weight: 600;
  border: 1px solid #2080f0;
  background-color: #e6f0ff;
  color: #2080f0;
}
.calendar-day.not-current {
  color: transparent;
  pointer-events: none;
}
.calendar-light .calendar-day:hover {
  background-color: #f4f4f5;
  color: #1e1e1e;
  transform: scale(1.05);
}
.calendar-dark .calendar-day {
  color: #e5e5e5;
}
.calendar-dark .calendar-day.today {
  border-color: #63e2b7;
  background-color: rgba(99, 226, 183, 0.15);
  color: #63e2b7;
}
.calendar-dark .calendar-day:hover {
  background-color: rgba(99, 226, 183, 0.25);
  color: #63e2b7;
  transform: scale(1.05);
}
.calendar-day:hover {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.event-dot {
  background-color: rgb(var(--primary-color));
}

@media (max-width: 768px) {
  .nav-arrow-left,
  .nav-arrow-right {
    width: 44px !important;
    height: 44px !important;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background-color: white;
  }

  /* 左箭头稍微往外偏移 */
  .nav-arrow-left {
    left: -18px !important;
  }

  /* 右箭头稍微往外偏移 */
  .nav-arrow-right {
    right: -18px !important;
  }
}
</style>
