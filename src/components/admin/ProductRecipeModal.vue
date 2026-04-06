<template>
  <div v-if="show" class="modal fade show d-block modal-backdrop-custom">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4">
        
        <div class="modal-header border-bottom pb-3 bg-light rounded-top-4">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-1">Cài đặt Định lượng</h5>
            <p class="text-secondary small mb-0">
              Sản phẩm: <span class="fw-bold text-primary">{{ product?.name }}</span>
            </p>
          </div>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body p-4 bg-white">
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-secondary mt-2 small">Đang tải công thức...</p>
          </div>
          
          <div v-else>
            <div class="table-responsive mb-3">
              <table class="table table-bordered align-middle">
                <thead class="table-light text-secondary small uppercase">
                  <tr>
                    <th width="50%">Nguyên liệu / Vật tư</th>
                    <th width="30%">Lượng tiêu hao</th>
                    <th width="20%" class="text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="recipeItems.length === 0">
                    <td colspan="3" class="text-center text-muted py-4 small">
                      Chưa có định lượng nào. Món này khi bán sẽ KHÔNG trừ kho.
                    </td>
                  </tr>
                  <tr v-for="(item, index) in recipeItems" :key="index">
                    <td>
                      <select v-model="item.materialId" class="form-select border-secondary border-opacity-25 shadow-none" required>
                        <option value="" disabled>-- Chọn vật tư --</option>
                        <option v-for="mat in materials" :key="mat.id" :value="mat.id">
                          {{ mat.name }} ({{ mat.unit }})
                        </option>
                      </select>
                    </td>
                    <td>
                      <div class="input-group">
                        <input v-model="item.quantity" type="number" step="0.01" min="0.01" class="form-control border-secondary border-opacity-25 shadow-none" required>
                        <span class="input-group-text bg-light text-secondary small">
                          {{ getUnit(item.materialId) }}
                        </span>
                      </div>
                    </td>
                    <td class="text-center">
                      <button type="button" class="btn btn-sm btn-outline-danger border-0" @click="removeRow(index)">
                        <i class="bi bi-trash3-fill"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="button" class="btn btn-sm btn-outline-primary fw-bold" @click="addRow">
              <i class="bi bi-plus-circle me-1"></i> Thêm nguyên liệu
            </button>
          </div>
        </div>

        <div class="modal-footer border-top bg-light rounded-bottom-4">
          <button type="button" class="btn btn-secondary px-4" @click="closeModal">Hủy</button>
          <button type="button" class="btn btn-warning fw-bold px-4 text-dark" :disabled="isLoading || isSaving" @click="saveRecipe">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            LƯU ĐỊNH LƯỢNG
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { inventoryService } from '@/services/InventoryService';
import { toast } from '@/utils/toast';

const props = defineProps<{
  show: boolean;
  product: any; // Object chứa thông tin sản phẩm (id, name)
}>();

const emit = defineEmits(['close']);

const isLoading = ref(false);
const isSaving = ref(false);
const materials = ref<any[]>([]);
const recipeItems = ref<any[]>([]);

// Khi Modal mở lên, lập tức load Danh sách Vật tư kho và Công thức cũ của món này
watch(() => props.show, async (newVal) => {
  if (newVal && props.product) {
    await loadData();
  }
});

const loadData = async () => {
  isLoading.value = true;
  try {
    // 1. Lấy danh sách toàn bộ vật tư trong kho để nhét vào thẻ <select>
    materials.value = await inventoryService.getMaterials();
    
    // 2. Lấy công thức hiện tại của sản phẩm này từ DB
    const currentRecipes = await inventoryService.getRecipes(props.product.id);
    
    // Gắn vào biến để hiển thị lên bảng
    recipeItems.value = currentRecipes.map((r: any) => ({
      materialId: r.materialId,
      quantity: r.quantity
    }));
  } catch (error) {
    toast.error("Không thể tải dữ liệu định lượng.");
  } finally {
    isLoading.value = false;
  }
};

// Hàm tiện ích: Lấy tên đơn vị dựa vào Material ID để hiển thị bên cạnh ô input
const getUnit = (materialId: string) => {
  if (!materialId) return 'đơn vị';
  const mat = materials.value.find(m => m.id === materialId);
  return mat ? mat.unit : 'đơn vị';
};

const addRow = () => {
  recipeItems.value.push({ materialId: '', quantity: 1 });
};

const removeRow = (index: number) => {
  recipeItems.value.splice(index, 1);
};

const saveRecipe = async () => {
  // Validate sơ bộ
  const invalidItem = recipeItems.value.find(i => !i.materialId || i.quantity <= 0);
  if (invalidItem) {
    toast.warning("Vui lòng chọn vật tư và nhập số lượng hợp lệ (> 0).");
    return;
  }

  isSaving.value = true;
  try {
    const data = {
      productId: props.product.id,
      items: recipeItems.value.map(i => ({
        materialId: i.materialId,
        quantity: i.quantity
      }))
    };
    
    await inventoryService.setRecipes(data);
    toast.success("Đã cập nhật định lượng thành công!");
    closeModal();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Lỗi khi lưu định lượng.");
  } finally {
    isSaving.value = false;
  }
};

const closeModal = () => {
  recipeItems.value = []; // Reset form
  emit('close');
};
</script>

<style scoped>
.modal-backdrop-custom {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 1050;
}
.uppercase {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>