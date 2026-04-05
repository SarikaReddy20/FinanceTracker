export const TRANSACTIONS_UPDATED_EVENT = "spendsmart:transactions-updated";

export function notifyTransactionsUpdated() {
  window.dispatchEvent(new CustomEvent(TRANSACTIONS_UPDATED_EVENT));
}

export function subscribeToTransactionsUpdated(callback) {
  window.addEventListener(TRANSACTIONS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, callback);
  };
}
