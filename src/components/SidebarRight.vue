<template>
  <div class="sidebar offcanvas offcanvas-end custom-sidebar" :class="{ 'show': playerStore.isSidebarOpen }"
    tabindex="-1" id="sidebar-right">
    <div class="offcanvas-header custom-header">
      <h5 class="offcanvas-title">{{ $t('message') }}</h5>
      <div v-if="selectedMember" class="translate-container">
        <i class="ri ri-translate me-4" @click.stop="toggleLanguageDropdown"></i>
        <div v-if="showLanguageDropdown" class="language-dropdown">
          <ul>
            <li @click="selectLanguage('English')">English</li>
            <li @click="selectLanguage('中文')">中文</li>
          </ul>
        </div>
      </div>
      <button type="button" class="btn-close text-white" data-bs-dismiss="offcanvas" aria-label="Close"
        @click="close"></button>
    </div>
    <div class="offcanvas-body custom-body" style="overflow: visible !important;">
      <div class="search-bar mb-3">
        <vue-multiselect v-model="selectedMember" label="username" value="id" :options="members"
          :placeholder="$t('search_member')" class="custom-multiselect custom-multiselect2"
          @search-change="debouncedLoadMembers" @select="selectMember" />
        <button type="button" class="btn btn-primary search-btn" @click="fetchPlayersMessageTemplates">{{ $t('search')
          }}</button>
      </div>
      <div class="messages-container">
        <div v-if="messages.length === 0" class="placeholder">
          <p>{{ $t('no_messages_found') }}</p>
        </div>
        <div v-else>
          <div v-for="(message, index) in messages" :key="index" class="message-box"
            @click="copyMessage(message.original)">
            <div class="timeline-panel card custom-card">
              <div class="card-body P-3">

                <div class="timeline-body">
                  <div class="text-muted mb-0" v-html="message.formatted"></div>
                </div>
                <div class="timeline-footer d-flex align-items-center justify-content-end flex-wrap">
                  <div class="d-sm-flex">
                    <a href="javascript:void(0);" class="btn btn-light btn-sm rounded-pill text-muted me-2 my-1">
                      <i class="ri ri-file-copy-2-line d-inline-block me-2"></i>{{ $t('copy_to_clipboard') }}
                    </a>
                  </div>
                </div>
                <div class="timeline-header">
                  <strong>{{ message.playerUsername }}</strong> &nbsp;
                  <small class="text-muted">{{ dateFormat(message.createdAt) }}</small>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Swal from "sweetalert2";
import VueMultiselect from 'vue-multiselect';
import { useCallApi } from "@/hooks/useCallApi";
import { usePlayerStore } from "@/store/playerStore";
import { useDebounceFn } from '@/composables/useDebounceFn';
import { useI18n } from "vue-i18n";
import { dateFormat } from "../utils/common";

const { t, locale } = useI18n();
const { callApi } = useCallApi();
const playerStore = usePlayerStore();
const messages = ref([]);
const selectedMember = ref(null);
const members = ref([]);
const showLanguageDropdown = ref(false);
const selectedLanguage = ref('English');
const { selectedPlayerId, setSelectedPlayerId } = playerStore;

function copyMessage(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccessMessage(text);
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      showCopySuccessMessage(text);
    } else {
      Swal.fire({
        icon: "error",
        title: t('copy_failed'),
        text: t('browser_no_support'),
      });
    }
  } catch (err) {
    console.error("Fallback copy error:", err);
  }

  document.body.removeChild(textArea);
}



function toggleLanguageDropdown() {
  showLanguageDropdown.value = !showLanguageDropdown.value;
}

function closeLanguageDropdown(event) {
  const dropdown = document.querySelector('.language-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showLanguageDropdown.value = false;
  }
}

function showCopySuccessMessage(text) {
  Swal.fire({
    icon: "success",
    title: t("copied_to_clipboard"),
    toast: true,
    showConfirmButton: false,
    timer: 2000,
  });
}

async function selectLanguage(language) {
  selectedLanguage.value = language;
  showLanguageDropdown.value = false;
  await callApi(`/player/${selectedMember.value.id}/language/`, 'PATCH', { languageId: language === 'English' ? 1 : 2 }, null);
  Swal.fire({
    icon: "success",
    title: t('lang_selected'),
    text: t('you_selected', { lang: language }),
    toast: true,
    showConfirmButton: false,
    timer: 2000,
    customClass: {
      popup: 'swal-large-popup',
      title: 'swal-large-title',
      content: 'swal-large-content'
    },
  });

  fetchPlayersMessageTemplates();
}


const loadMemberQuery = async (value) => {

  if (value) {
    loadMembers(value);
  } else {
    fetchPlayersMessageTemplates();
  }
};

const debouncedLoadMembers = useDebounceFn((query) => {
  loadMemberQuery(query)
})

const loadMembers = async (query) => {
  try {
    const params = {
      limit: 5,
      username: query
    };

    if (selectedMember.value) {
      params.id = selectedMember.value.id;
    }

    const response = await callApi('/players', 'GET', null, params, false);
    members.value = response.playerList.map((player) => ({
      id: player.id,
      username: player.username + ` (${player.brandCode}) `,
    }));
  } catch (error) {
    console.error('Error loading member list:', error.response ? error.response.data.message : error.message);
  }
};

const fetchPlayersMessageTemplates = async () => {
  try {
    const params = {};

    if (selectedMember.value) {
      params.playerId = selectedMember.value.id;
    }

    const resp = await callApi("/playerMessage", "GET", null, params, false);

    if (resp && resp.playerMessageList) {
      messages.value = resp.playerMessageList
        .filter(msg => msg.message.trim() !== "") // Remove empty messages
        .map(msg => ({
          original: msg.message,
          formatted: msg.message.replace(/\n/g, "<br>"), // Convert line breaks for HTML display
          playerUsername: msg.playerUsername,
          createdAt: new Date(msg.createdAt).toLocaleString() // Format timestamp
        }));
    }
  } catch (error) {
    console.error(
      "Error fetching player messages:",
      error.response ? error.response.data.message : error.message
    );
  }
};

onMounted(() => {
  const sidebar = document.getElementById('sidebar-right')
  
  // 监听关闭
  sidebar.addEventListener('hidden.bs.offcanvas', () => {
    document.body.classList.remove('no-scroll');
  })
})

onBeforeUnmount(() => {
  const sidebar = document.getElementById('sidebar-right')
  if (sidebar) {
    sidebar.removeEventListener('hidden.bs.offcanvas', () => {})
  }
})

const close = () => {
  document.body.classList.remove('no-scroll');
  selectedMember.value = null;
  playerStore.toggleSidebar(false);
};


function closeSidebarOnOutsideClick(event) {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && !sidebar.contains(event.target)) {
    playerStore.toggleSidebar(false);
    selectedMember.value = null;
  }
}

watch(
  () => playerStore.isSidebarOpen,
  (isOpen) => {
    if (isOpen) {
      fetchPlayersMessageTemplates();
    }
  }
);

watch(
  () => playerStore.selectedPlayerId,
  (newPlayerId) => {
    if (newPlayerId) {
      loadMembers();
      const member = members.value.find((m) => m.id == newPlayerId);
      if (member) {
        selectedMember.value = member;
      }
      fetchPlayersMessageTemplates();
    }
  }
);

function selectMember(member) {
  setSelectedPlayerId(member.id); // Update the store's selected player ID
}

onMounted(() => {
  fetchPlayersMessageTemplates();
  loadMembers();
  if (selectedPlayerId) {
    selectedMember.value = members.value.find((member) => member.id === selectedPlayerId);
  }
  document.addEventListener("click", closeLanguageDropdown);
  document.addEventListener("click", closeSidebarOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", closeLanguageDropdown);
  document.removeEventListener("click", closeSidebarOnOutsideClick);
});
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  color: black;
}

.search-btn {
  padding: 10px 20px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.translate-container {
  position: relative;
  font-size: 1rem;
  margin: 0 1rem;

  >i {
    cursor: pointer;
  }
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  border-radius: 5px;
  z-index: 1000;
  background: var(--main-gradient-bg);
  border: 1px solid var(--default-border);
}

.language-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.language-dropdown ul li {
  padding: 10px 15px;
  cursor: pointer;
}

.placeholder {
  text-align: center;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 20px;
  border: 2px dashed var(--default-border);
  border-radius: 10px;
}
</style>
