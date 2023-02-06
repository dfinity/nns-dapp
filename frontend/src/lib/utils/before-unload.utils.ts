import { browser } from "$app/environment";

const onBeforeUnload = ($event: BeforeUnloadEvent) => {
  $event.preventDefault();
  return ($event.returnValue = "Are you sure you want to exit?");
};

const addSyncBeforeUnload = () => {
  window.addEventListener("beforeunload", onBeforeUnload, { capture: true });
};

const removeSyncBeforeUnload = () => {
  window.removeEventListener("beforeunload", onBeforeUnload, { capture: true });
};

export const syncBeforeUnload = (dirty: boolean) => {
  if (!browser) {
    return;
  }

  if (dirty) {
    addSyncBeforeUnload();
  } else {
    removeSyncBeforeUnload();
  }
};
