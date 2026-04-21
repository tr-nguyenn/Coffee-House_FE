import Swal from "sweetalert2";

export const confirmDelete = async (title = "Xác nhận xóa?", text = "Hành động này không thể hoàn tác!") => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#f3f4f6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    background: "#ffffff",
    color: "#1f2937",
    customClass: {
      popup: "swal-light-popup",
      title: "swal-light-title",
      confirmButton: "swal-btn-confirm",
      cancelButton: "swal-btn-cancel",
    },
  });
};

export const confirmAction = async (title: string, text: string, icon: "warning" | "error" | "success" | "info" | "question" = "question") => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#f3f4f6",
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    background: "#ffffff",
    color: "#1f2937",
    customClass: {
      popup: "swal-light-popup",
      title: "swal-light-title",
      confirmButton: "swal-btn-confirm",
      cancelButton: "swal-btn-cancel",
    },
  });
};

export const notifySuccess = (title: string) => {
  Swal.fire({
    icon: "success",
    title: title,
    showConfirmButton: false,
    timer: 1500,
    background: "#ffffff",
    color: "#1f2937",
    customClass: {
      popup: "swal-light-popup",
    },
  });
};
