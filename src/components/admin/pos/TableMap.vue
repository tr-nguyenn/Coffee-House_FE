<template>
  <div class="d-flex flex-column h-100 bg-white">
    
    <div class="p-3 border-bottom bg-light flex-shrink-0 shadow-sm z-1">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="fs-5 fw-bold text-dark"><i class="bi bi-grid-fill me-2 text-primary"></i>Sơ đồ bàn</span>
        <button class="btn btn-sm btn-outline-secondary rounded-circle" title="Làm mới" @click="fetchTables">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div class="d-flex overflow-auto custom-scrollbar pb-1 gap-2" style="white-space: nowrap;">
        <button 
          class="btn btn-sm rounded-pill fw-bold transition-all" 
          :class="selectedArea === 'All' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="selectedArea = 'All'">
          Tất cả
        </button>
        <button 
          v-for="area in uniqueAreas" :key="area"
          class="btn btn-sm rounded-pill fw-bold transition-all"
          :class="selectedArea === area ? 'btn-primary' : 'btn-outline-secondary'"
          @click="selectedArea = area">
          {{ area }}
        </button>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto p-3 custom-scrollbar" style="background-color: #f4f6f9;">
      <div class="mb-4">
        <div 
          class="card text-center cursor-pointer transition-all border-0 rounded-4 shadow-sm takeaway-card"
          :class="{'ring-3 ring-warning transform-active': selectedTableId === 'TAKEAWAY'}"
          @click="selectTakeaway">
          <div class="card-body p-3 d-flex align-items-center justify-content-center gap-3" style="background: linear-gradient(135deg, #2b2b40, #1e1e2d);">
            <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="bi bi-bag-check-fill text-dark fs-5"></i>
            </div>
            <div class="text-start">
              <h6 class="fw-bold text-white mb-0 text-uppercase letter-spacing-1">Khách Mua Mang Đi</h6>
              <small class="text-secondary">Không cần bàn</small>
            </div>
            <i class="bi bi-chevron-right text-secondary ms-auto fs-5"></i>
          </div>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      
      <div v-else>
        <div v-for="(group, areaName) in filteredGroupedTables" :key="areaName" class="mb-4">
          
          <div class="d-flex align-items-center mb-3">
             <div class="bg-primary rounded-pill me-2" style="width: 6px; height: 24px;"></div>
             <h6 class="fw-bold text-secondary text-uppercase mb-0">{{ areaName }}</h6>
             <span class="badge bg-white text-dark ms-2 border shadow-sm">{{ group.length }} bàn</span>
          </div>

          <div class="row row-cols-3 row-cols-sm-4 row-cols-md-3 row-cols-xl-4 g-3">
            <div class="col" v-for="table in group" :key="table.tableId">
               <div class="card h-100 text-center cursor-pointer transition-all border-2 rounded-4 shadow-sm select-none table-card"
                    :class="[
                      table.isInUse ? 'border-danger table-card-danger' : 'border-success table-card-success',
                      selectedTableId === table.tableId ? 'shadow-lg ring-3 ring-primary transform-active' : ''
                    ]"
                    @click="onSelect(table)">
                 
                 <div class="card-body p-2 d-flex flex-column justify-content-center align-items-center position-relative">
                    
                    <div class="position-absolute top-0 end-0 mt-2 me-2">
                      <i class="bi" :class="table.isInUse ? 'bi-cup-hot-fill text-danger' : 'bi-check-circle-fill text-success'" style="font-size: 1rem;"></i>
                    </div>

                    <h5 class="fw-bold mt-3 mb-1" :class="table.isInUse ? 'text-danger' : 'text-success'">
                      {{ table.tableName }}
                    </h5>
                    
                    <span class="badge rounded-pill mb-2 px-3 py-1" 
                          :class="table.isInUse ? 'bg-danger text-white' : 'bg-success text-white'" 
                          style="font-size: 0.7rem; font-weight: 600;">
                      {{ table.isInUse ? 'Có Khách' : 'Trống' }}
                    </span>
                 </div>
               </div>
            </div>
            
            <div v-if="group.length === 0" class="col-12 py-2 text-muted fst-italic small">Không có bàn ở khu vực này.</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { tableService } from '@/services/TableService'; 
import { toast } from '@/utils/toast';
import type { TableStatusDto } from '@/models/Table';



const props = defineProps<{ selectedTableId: string | null }>();
const emit = defineEmits(['select-table', 'select-takeaway']);

const loading = ref(false);
const tables = ref<TableStatusDto[]>([]);
const selectedArea = ref<string>('All');

const uniqueAreas = computed(() => {
  const areas = tables.value.map(t => t.areaName);
  return [...new Set(areas)].sort();
});

const filteredGroupedTables = computed(() => {
  const groups: Record<string, TableStatusDto[]> = {};
  
  tables.value.forEach(t => {
    if (selectedArea.value === 'All' || selectedArea.value === t.areaName) {
      const area = t.areaName || 'Khác';
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area]!.push(t);
    }
  });
  
  return groups;
});

const fetchTables = async () => {
  loading.value = true;
  try {
    const response = await tableService.getTablesWithStatus();
    tables.value = response;
  } catch (error) {
    console.error(error);
    toast.error('Lỗi khi tải danh sách bàn. Vui lòng thử lại!');
  } finally {
    loading.value = false;
  }
};

const onSelect = (table: TableStatusDto) => {
  emit('select-table', table);
};

const selectTakeaway = () => {
  emit('select-takeaway'); 
};

onMounted(() => {
  fetchTables();
});

defineExpose({ fetchTables, tables });
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); }
.select-none { user-select: none; }
.letter-spacing-1 { letter-spacing: 0.5px; }

.table-card { background-color: #ffffff; overflow: hidden; }

.table-card-success { border-color: rgba(25, 135, 84, 0.3) !important; }
.table-card-success:hover { background-color: #f2fdf6; border-color: #198754 !important; transform: translateY(-3px); }

.table-card-danger { border-color: rgba(220, 53, 69, 0.3) !important; background-color: #fffafb; }
.table-card-danger:hover { background-color: #fff0f2; border-color: #dc3545 !important; transform: translateY(-3px); }

.takeaway-card { overflow: hidden; border: 1px solid transparent; }
.takeaway-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; }

.ring-3 { box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.5) !important; }
.ring-warning { box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.6) !important; }
.transform-active { transform: translateY(-3px) scale(1.02); }

.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
</style>