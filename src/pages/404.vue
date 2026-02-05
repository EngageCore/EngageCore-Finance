<template>
  <div class="bg-svg">
    <div class="page" style="justify-content: center !important;">
      <div class="square-box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="bg-svg svg-5">
        <div class="page error-bg" id="content">
          <canvas class="error-basic-background" width="1920" height="543" style="width: 100%; height: 100%;"></canvas>
          <!-- Start::error-page -->
          <div class="error-page">
            <div class="container">
              <div class="text-center p-5 my-auto">
                <div class="row align-items-center justify-content-center h-100 text-error-color">
                  <div class="col-xl-7">
                    <p class="error-text mb-sm-0 mb-2 fw-bold">404</p>
                    <p class="fs-24 fw-semibold mb-3">Oopps! The page you were looking for doesn't exist.</p>
                    <div class="row justify-content-center mb-2">
                      <div class="col-xl-6">
                        <p class="mb-0 op-7">You may have mistyped the address or the page may have moved.</p>
                      </div>
                    </div>
                    <!-- Use router-link for navigation -->
                    <router-link to="/" class="btn btn-secondary">
                      <i class="ri-arrow-left-line align-middle me-1 d-inline-block"></i>BACK TO HOME
                    </router-link>
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
