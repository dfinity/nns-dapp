import type { ActionType } from "$lib/types/actions";

export const createActionEvent = ({
  type,
  data,
}: {
  type: ActionType;
  data?: unknown;
}) =>
  new CustomEvent("nnsAction", {
    detail: {
      type,
      data,
    },
    bubbles: true,
  });
