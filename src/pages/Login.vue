<template>
  <div class="bg-svg">
    <div class="page" style="justify-content: center !important; position: relative;">
     
      <div class="z-index-10">
        <div class="container">
          <div class="row">
            <div class="col-xl-5 col-lg-6 col-md-8 col-sm-8 col-xs-10 py-4 justify-content-center mx-auto my-auto">
              <div class="card-sigin shadow">
                <div class="main-card-signin">
                  <div class="wd-100p">
                    <div class="d-flex align-items-center">
                    
                      <div class="ml-auto security-indicator">
                        <i class="fas fa-lock text-primary"></i>
                        <span class="text-sm">{{ $t('secure_login') }}</span>
                      </div>
                    </div>
                    <div class="mt-3">
                      <h2 class="text-medium text-primary">{{ $t('welcome_back') }}</h2>
                      <h6 class="fw-medium mb-4 text-dark">{{ $t('pls_signin') }}</h6>

                      <!-- Banking Tips Carousel -->
                      <div id="tips-carousel" class="carousel slide mb-3" data-ride="carousel">
                        <div class="carousel-inner">
                          <div class="carousel-item active">
                            <p class="carousel-text">{{ $t('tips1') }}</p>
                          </div>
                          <div class="carousel-item">
                            <p class="carousel-text">{{ $t('tips2') }}</p>
                          </div>
                          <div class="carousel-item">
                            <p class="carousel-text">{{ $t('tips3') }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="panel-body p-0">
                        <div class="tab-content mt-3">
                          <div class="tab-pane p-0 border-0 active" id="signinTab1">
                            <form @submit.prevent="handleLogin">
                              <div class="form-group mb-3">
                                <input v-model="username" class="form-control" :placeholder="$t('username')" type="text">
                              </div>
                              <div class="form-group mb-3">
                                <input v-model="password" class="form-control" :placeholder="$t('password')" type="password">
                                <small class="text-muted d-block mt-1">{{ $t('data_secured') }}</small>
                              </div>
                              <div class="d-flex align-items-center justify-content-between">
                                <button type="submit" class="btn btn-primary">{{ $t('log_in') }}</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '../store/authStore';

import { handleMessage } from '@/utils/notification';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n(); 
const router = useRouter();
const authStore = useAuthStore();
// Auto-filled credentials
const username = ref('superadmin');
const password = ref('123456');
       
const handleLogin = () => {
  // Simple local credential check, no API call
  if (username.value === 'superadmin' && password.value === '123456') {
    const fakeUser = {
      username: 'superadmin',
      accessPageIds: [],
      accessPageActionIds: [],
      accessPageFeatureIds: [],
    };

    authStore.login(fakeUser, 'dummy-token');
    router.push('/transactions');
    handleMessage(t, 'login_success', 'success');
  } else {
    handleMessage(t, 'invalid_credentials', 'error');
  }
};
</script>

<style scoped>
.card-sigin {
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.security-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}
.carousel-text {
  font-size: 14px;
  color: #6c757d;
}
</style>
