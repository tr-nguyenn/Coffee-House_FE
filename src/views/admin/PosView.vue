<template>
  <div
    class="pos-layout container-fluid px-0 d-flex flex-column overflow-hidden bg-light"
  >
    <div class="row g-0 flex-grow-1 overflow-hidden">
      <div
        class="col-md-5 col-lg-4 border-end bg-white overflow-hidden shadow-sm z-1"
      >
        <TableMap
          ref="tableMapRef"
          :selectedTableId="selectedTableId"
          @select-table="handleTableSelect"
          @select-takeaway="handleTakeawaySelect"
        />
      </div>

      <div class="col-md-7 col-lg-8 h-100 bg-light overflow-hidden">
        <OperationsArea
          :selectedTable="selectedTable"
          @order-success="handleOrderSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import TableMap from "@/components/admin/pos/TableMap.vue";
import OperationsArea from "@/components/admin/pos/OperationsArea.vue";
import type {TableStatusDto} from "@/models/Table";

const selectedTableId = ref<string | null>(null);
const selectedTable = ref<TableStatusDto | null>(null);
const tableMapRef = ref<any>(null);

const handleTableSelect = (table: TableStatusDto) => {
  selectedTableId.value = table.tableId;
  selectedTable.value = table;
};

const handleOrderSuccess = async (action?: string) => {
  if (!tableMapRef.value) return;

  await tableMapRef.value.fetchTables();

  if (action === "checkout") {
    selectedTableId.value = null;
    selectedTable.value = null;
  } else if (action === "create" || action === "update") {
    const updatedTable = tableMapRef.value.tables.find(
      (t: TableStatusDto) => t.tableId === selectedTableId.value
    );
    if (updatedTable) {
      selectedTable.value = {...updatedTable};
    }
  } else {
    selectedTableId.value = null;
    selectedTable.value = null;
  }
};

const handleTakeawaySelect = () => {
  selectedTableId.value = "TAKEAWAY";
  selectedTable.value = {
    tableId: "TAKEAWAY",
    tableName: "KHÁCH MANG ĐI",
    areaName: "Takeaway",
    isInUse: true,
    activeOrderId: "NEW_TAKEAWAY",
  } as TableStatusDto;
};
</script>

<style scoped>
.pos-layout {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  height: calc(100vh - 120px) !important;
}

.z-1 {
  z-index: 1;
}
</style>
