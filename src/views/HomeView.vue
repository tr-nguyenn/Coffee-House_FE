<template>
  <div class="home">
    <section class="hero-section d-flex align-items-center text-center text-white">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h1 class="display-3 fw-bold mb-4">Thưởng thức hương vị <span class="text-warning">Cà phê đích thực</span></h1>
            <p class="lead mb-5 text-light-50">
              Tại Coffee House, chúng tôi không chỉ bán cà phê, chúng tôi mang đến trải nghiệm số hóa hiện đại giúp bạn tận hưởng từng phút giây thư
              giãn.
            </p>
            <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <router-link to="/menu" class="btn btn-warning btn-lg px-5 fw-bold">Xem thực đơn</router-link>
              <button class="btn btn-outline-light btn-lg px-5">Về chúng tôi</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  /* Bạn có thể thay link ảnh này bằng ảnh thật của quán trong thư mục assets sau */
  background:
    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070");
  background-size: cover;
  background-position: center;
  min-height: 80vh;
}

.text-light-50 {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>
