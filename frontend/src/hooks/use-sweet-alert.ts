"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const THEME_CONFIG = {
  customClass: {
    popup:
      "!rounded-2xl !bg-white dark:!bg-[#0A1836] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] !border !border-neutral-200 dark:!border-white/10",
    title: "!text-neutral-900 dark:!text-white !font-sans",
    htmlContainer: "!text-neutral-600 dark:!text-neutral-300",
    confirmButton:
      "!bg-gradient-to-r !from-[#D4A017] !to-[#FBBF24] !text-[#0A1836] !font-semibold !rounded-xl !px-6 !py-2.5 !shadow-md hover:!shadow-[0_0_20px_rgba(212,160,23,0.3)] !border-0",
    cancelButton:
      "!bg-neutral-200 dark:!bg-neutral-700 !text-neutral-700 dark:!text-neutral-200 !rounded-xl !px-6 !py-2.5 !border-0",
    denyButton:
      "!bg-red-500 !text-white !rounded-xl !px-6 !py-2.5 !border-0",
  },
  buttonsStyling: false,
};

export function useSweetAlert() {
  const success = (title: string, text?: string) =>
    MySwal.fire({
      icon: "success",
      title,
      text,
      ...THEME_CONFIG,
      timer: 3000,
      showConfirmButton: false,
    });

  const error = (title: string, text?: string) =>
    MySwal.fire({ icon: "error", title, text, ...THEME_CONFIG });

  const confirm = (
    title: string,
    text: string,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) =>
    MySwal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      ...THEME_CONFIG,
    });

  const loading = (title: string) => {
    MySwal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      ...THEME_CONFIG,
    });
    return () => Swal.close();
  };

  const toast = (
    title: string,
    icon: "success" | "error" | "info" | "warning" = "success"
  ) =>
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "!rounded-xl !shadow-lg",
      },
    });

  return {
    success,
    error,
    confirm,
    loading,
    toast,
    fire: MySwal.fire.bind(MySwal),
  };
}
