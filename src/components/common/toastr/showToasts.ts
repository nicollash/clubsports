import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  autoClose: 5000,
  hideProgressBar: true,
  position: toast.POSITION.TOP_CENTER,
};

const infoToast = (message: string) =>
  toast(message, { ...defaultOptions, type: 'info' });

const successToast = (message: string) =>
  toast(message, { ...defaultOptions, type: 'success' });

const errorToast = (message: string) =>
  toast(message, { ...defaultOptions, type: 'error' });

const warningToast = (message: string) =>
  toast(message, { ...defaultOptions, type: 'warning' });

export { infoToast, successToast, errorToast, warningToast };
