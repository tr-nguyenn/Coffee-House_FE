<template>
  <section class="hero-section d-flex align-items-center text-center text-white position-relative">
    <div class="hero-overlay position-absolute w-100 h-100 top-0 start-0"></div>
    <div class="container position-relative z-1">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h1 class="display-3 fw-bold mb-4 animate-fade-in-up">Thưởng thức hương vị <span class="text-warning">Cà phê đích thực</span></h1>
          <p class="lead mb-5 text-light-50 animate-fade-in-up delay-1">
            Tại Coffee House, chúng tôi không chỉ bán cà phê, chúng tôi mang đến trải nghiệm số hóa hiện đại giúp bạn tận hưởng từng phút giây thư
            giãn.
          </p>
          <div class="d-grid gap-3 d-sm-flex justify-content-sm-center animate-fade-in-up delay-2">
            <router-link to="/menu" class="btn btn-warning btn-lg px-5 fw-bold rounded-pill shadow-sm hover-lift">Xem thực đơn</router-link>
            <button class="btn btn-outline-light btn-lg px-5 rounded-pill hover-lift">Về chúng tôi</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80");
  background-size: cover;
  background-attachment: fixed; /* Parallax effect */
  background-position: center;
  min-height: 85vh;
}

.hero-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.text-light-50 {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Animations & Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
