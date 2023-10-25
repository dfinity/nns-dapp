import type { Action } from "$lib/types/actions";

export const createActionEvent = ({ type, data }: Action) =>
  new CustomEvent("nnsAction", {
    detail: {
      type,
      data,
    },
    bubbles: true,
  });
