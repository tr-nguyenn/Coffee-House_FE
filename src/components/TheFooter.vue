<template>
  <footer class="footer-premium bg-dark text-light pt-5 pb-3 mt-auto">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4 col-md-6">
          <AppLogo size="28" class="mb-3" />
          <p class="text-secondary lh-lg mb-4">
            Hơn cả một tách cà phê, chúng tôi mang đến một không gian số hóa hiện đại, nơi kết nối đam mê và
            sự tiện lợi cho mọi khách hàng.
          </p>
          <div class="social-links d-flex gap-3">
            <a href="#" class="social-icon" title="Facebook">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="social-icon" title="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="#" class="social-icon" title="Tiktok">
              <i class="bi bi-tiktok"></i>
            </a>
          </div>
        </div>

        <div class="col-lg-2 col-md-6">
          <h5 class="footer-title mb-4">Khám phá</h5>
          <ul class="list-unstyled footer-links">
            <li><router-link to="/">Trang chủ</router-link></li>
            <li><router-link to="/menu">Thực đơn</router-link></li>
            <li><a href="#">Khuyến mãi</a></li>
            <li><a href="#">Cửa hàng</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="footer-title mb-4">Liên hệ</h5>
          <ul class="list-unstyled contact-info">
            <li class="d-flex mb-3">
              <i class="bi bi-geo-alt-fill text-warning me-3"></i>
              <span>340 Tôn Đức Thắng, Quận Liên Chiểu, Đà Nẵng</span>
            </li>
            <li class="d-flex mb-3">
              <i class="bi bi-telephone-fill text-warning me-3"></i>
              <span>070 956 5352</span>
            </li>
            <li class="d-flex mb-3">
              <i class="bi bi-envelope-fill text-warning me-3"></i>
              <span>coffeehouse@gmail.com</span>
            </li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="footer-title mb-4">Giờ hoạt động</h5>
          <div class="opening-hours text-secondary">
            <div class="d-flex justify-content-between mb-2">
              <span>Thứ 2 - Thứ 6:</span>
              <span class="text-white">07:00 - 22:00</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Thứ 7 - Chủ Nhật:</span>
              <span class="text-white">08:00 - 23:00</span>
            </div>
            <p class="mt-3 small text-warning italic">* Mở cửa cả ngày lễ</p>
          </div>
        </div>
      </div>

      <hr class="border-secondary mt-5 mb-4 opacity-25" />

      <div
        class="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
      >
        <p class="mb-0 text-secondary small">
          &copy; 2026 <strong>Coffee House</strong>. Tất cả quyền được bảo lưu.
        </p>
        <p class="mb-0 text-secondary small">
          Designed with <i class="bi bi-heart-fill text-danger mx-1"></i> by
          <span class="text-warning fw-bold">{{ developerName }}</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import AppLogo from "./AppLogo.vue";
const developerName = "Nguyễn Trung Nguyên";
</script>

<style scoped>
.footer-premium {
  border-top: 3px solid #ffc107; /* Tạo dải màu vàng đặc trưng ở trên cùng */
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 10px;
}

.footer-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #ffc107;
}

/* Hiệu ứng cho Social Icons */
.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.social-icon:hover {
  background: #ffc107;
  color: #212529;
  transform: translateY(-5px);
}

/* Hiệu ứng cho các Link điều hướng */
.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #adb5bd;
  text-decoration: none;
  transition: 0.3s;
}

.footer-links a:hover {
  color: #ffc107;
  padding-left: 8px; /* Hiệu ứng trượt nhẹ khi hover */
}

.contact-info li i {
  font-size: 1.1rem;
}
</style>
