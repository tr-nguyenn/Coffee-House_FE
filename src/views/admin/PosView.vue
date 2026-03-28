<template>
  <div class="pos-layout container-fluid px-0 d-flex flex-column vh-100 overflow-hidden bg-light">
    <div class="row g-0 flex-grow-1 overflow-hidden">
      <!-- Left Column: Tables Map -->
      <div class="col-md-5 col-lg-4 h-100 border-end bg-white overflow-hidden shadow-sm z-1">
        <TableMap ref="tableMapRef" :selectedTableId="selectedTableId" @select-table="handleTableSelect" @select-takeaway="handleTakeawaySelect" />
      </div>
      
      <!-- Right Column: Operations -->
      <div class="col-md-7 col-lg-8 h-100 bg-light overflow-hidden">
         <OperationsArea :selectedTable="selectedTable" @order-success="handleOrderSuccess" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TableMap from '@/components/admin/pos/TableMap.vue';
import OperationsArea from '@/components/admin/pos/OperationsArea.vue';

// Using mock data matching TableStatusDto
export interface TableStatusDto {
  tableId: string;
  tableName: string;
  areaName: string;
  isInUse: boolean;
  activeOrderId: string | null;
}

const selectedTableId = ref<string | null>(null);
const selectedTable = ref<TableStatusDto | null>(null);
const tableMapRef = ref<any>(null);

const handleTableSelect = (table: TableStatusDto) => {
  selectedTableId.value = table.tableId;
  selectedTable.value = table;
};

const handleOrderSuccess = async (action?: string) => {
  if (tableMapRef.value) {
    await tableMapRef.value.fetchTables();
    
    if (action === 'checkout') {
      selectedTableId.value = null;
      selectedTable.value = null;
    } else if (action === 'create' || action === 'update') {
      const updatedTable = tableMapRef.value.tables.find((t: TableStatusDto) => t.tableId === selectedTableId.value);
      if (updatedTable) {
        selectedTable.value = { ...updatedTable };
      }
    } else {
      selectedTableId.value = null;
      selectedTable.value = null;
    }
  }
};

const handleTakeawaySelect = () => {
  selectedTableId.value = 'TAKEAWAY';
  // Tạo một "Bàn ảo" để OperationsArea không bị chửi là null
  selectedTable.value = {
    tableId: 'TAKEAWAY',
    tableName: 'KHÁCH MANG ĐI',
    areaName: 'Takeaway',
    isInUse: true, // Set true để lướt qua cái check "Mở bàn"
    activeOrderId: 'NEW_TAKEAWAY' // Cờ hiệu để biết đây là đơn mang đi mới
  };
};

</script>

<style scoped>
.pos-layout {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.letter-spacing {
  letter-spacing: 1px;
}
.z-1 { z-index: 1; }
</style>
