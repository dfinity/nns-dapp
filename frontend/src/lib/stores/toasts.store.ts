/* eslint-disable no-console */
import { DEFAULT_TOAST_DURATION_MILLIS } from "$lib/constants/constants";
import type { ToastMsg } from "$lib/types/toast";
import { errorToString } from "$lib/utils/error.utils";
import type { I18nSubstitutions } from "$lib/utils/i18n.utils";
import { replacePlaceholders, translate } from "$lib/utils/i18n.utils";
import { toastsStore } from "@dfinity/gix-components";

const mapToastText = ({ labelKey, substitutions, detail }: ToastMsg): string =>
  `${replacePlaceholders(translate({ labelKey }), substitutions ?? {})}${
    detail !== undefined ? ` ${detail}` : ""
  }`;

/**
 * Toast messages.
 *
 * - toastsShow: display a message in toast component
 * - toastsSuccess: display a message of type "success" - something went really well ;)
 * - toastsError: display an error and print the issue in the console as well
 * - toastsHide: remove the toast message with that timestamp or the first one.
 * - toastsReset: reset toasts
 */

export const toastsShow = (msg: ToastMsg): symbol => {
  const { level, spinner, duration } = msg;

  return toastsStore.show({
    text: mapToastText(msg),
    level,
    spinner,
    duration,
  });
};

export const toastsSuccess = ({
  labelKey,
  substitutions,
}: Pick<ToastMsg, "labelKey" | "substitutions">) =>
  toastsShow({
    labelKey,
    substitutions,
    level: "success",
    duration: DEFAULT_TOAST_DURATION_MILLIS,
  });

export const toastsError = ({
  labelKey,
  err,
  substitutions,
}: {
  labelKey: string;
  err?: unknown;
  substitutions?: I18nSubstitutions;
}) => {
  toastsShow({
    labelKey,
    level: "error",
    detail: errorToString(err),
    substitutions,
  });

  if (err !== undefined) {
    console.error(err);
  }
};

export const toastsHide = (idToHide: symbol) => toastsStore.hide(idToHide);

export const toastsReset = () => toastsStore.reset();

export const toastsUpdate = ({
  id,
  content,
}: {
  id: symbol;
  content: ToastMsg;
}): void => {
  toastsStore.update({
    id,
    content: {
      id,
      ...content,
      text: mapToastText(content),
    },
  });
};
