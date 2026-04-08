<template>
  <div class="ai-chat-container">
    <button class="btn-chat-toggle shadow-lg" @click="isOpen = !isOpen" :class="{'active': isOpen}">
      <i class="bi bi-robot fs-4"></i>
    </button>

    <div v-if="isOpen" class="chat-window shadow-xl rounded-4 overflow-hidden">
      <div class="chat-header bg-dark text-white p-3 d-flex align-items-center">
        <i class="bi bi-stars text-warning me-2 fs-5"></i>
        <h6 class="mb-0 fw-bold">Trợ lý AI Quản trị</h6>
      </div>

      <div class="chat-body p-3" ref="chatBody">
        <div v-for="(msg, index) in messages" :key="index" 
             class="msg-bubble" :class="msg.role === 'user' ? 'msg-user' : 'msg-ai'">
          {{ msg.content }}
        </div>
        
        <div v-if="isLoading" class="msg-bubble msg-ai typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="chat-footer p-2 border-top bg-white">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input v-model="userInput" type="text" class="form-control rounded-pill bg-light border-0 px-3" 
                 placeholder="Hỏi AI về doanh thu, tồn kho..." :disabled="isLoading">
          <button type="submit" class="btn btn-warning rounded-circle px-3" :disabled="!userInput || isLoading">
            <i class="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import apiClient from '@/api/axiosInstance'; // Đảm bảo đường dẫn đúng

const isOpen = ref(false);
const userInput = ref('');
const isLoading = ref(false);
const chatBody = ref<HTMLElement | null>(null);

const messages = ref<{role: string, content: string}[]>([
  { role: 'ai', content: 'Chào sếp! Sếp muốn em báo cáo số liệu gì hôm nay ạ?' }
]);

const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const question = userInput.value;
  messages.value.push({ role: 'user', content: question });
  userInput.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const response = await apiClient.post('/chatbot/ask', { question });
    messages.value.push({ role: 'ai', content: response.data.answer });
  } catch (error) {
    messages.value.push({ role: 'ai', content: 'Xin lỗi sếp, hệ thống AI đang bị gián đoạn kết nối!' });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}
.btn-chat-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e1e2d, #2b2b40);
  color: #ffc107;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-chat-toggle:hover, .btn-chat-toggle.active {
  transform: scale(1.1);
  box-shadow: 0 10px 20px rgba(255, 193, 7, 0.4) !important;
}
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap; /* Giữ nguyên xuống dòng của AI */
  word-wrap: break-word; /* Tránh tràn chữ */
}
.msg-user {
  background: #1e1e2d;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}
.msg-ai {
  background: #e9ecef;
  color: #212529;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}
/* Hiệu ứng gõ chữ (typing indicator) */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 14px 16px;
  min-height: 40px;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #adb5bd;
  border-radius: 50%;
  animation: typing 1s infinite;
}
.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>