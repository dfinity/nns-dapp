import { toastsStore } from "@dfinity/gix-components";
import { DEFAULT_TOAST_DURATION_MILLIS } from "../constants/constants";
import type { ToastMsg } from "../types/toast";
import { errorToString } from "../utils/error.utils";
import type { I18nSubstitutions } from "../utils/i18n.utils";
import { replacePlaceholders, translate } from "../utils/i18n.utils";

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
