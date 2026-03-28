import Swal from "sweetalert2";

export const confirmDelete = async (title = "Xác nhận xóa?", text = "Hành động này không thể hoàn tác!") => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#e5e7eb",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy bỏ",
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
