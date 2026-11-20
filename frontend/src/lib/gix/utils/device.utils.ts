import { isNode } from "$lib/gix/utils/env.utils";
import { nonNullish } from "@dfinity/utils";

export const isPortrait = (): boolean => {
  if (isNode()) {
    return false;
  }

  return (
    window.matchMedia && window.matchMedia("(orientation: portrait)").matches
  );
};

export const isIOS = (): boolean => {
  if (isNode()) {
    return false;
  }

  const agent = userAgent();

  return /iPhone|iPod/i.test(agent) || isIPad();
};

export const isIPad = (): boolean => {
  if (isNode()) {
    return false;
  }

  const agent = userAgent();

  // iOS 12 and below
  if (/iPad/i.test(agent)) {
    return true;
  }

  // iOS 13+
  return /Macintosh/i.test(agent) && isMobile();
};

export const isAndroid = (): boolean => {
  if (isNode()) {
    return false;
  }

  const a = userAgent();

  return /android|sink/i.test(a);
};

export const isAndroidTablet = (): boolean => {
  if (isNode()) {
    return false;
  }

  const a = userAgent();

  return isAndroid() && !/mobile/i.test(a);
};

/**
 * Current loophole (Feb 2024):
 * - Firefox used on a desktop with touch screen will be identified as a mobile device.
 */
export const isMobile = (): boolean => {
  if (isNode()) {
    return false;
  }

  // Available in Chrome on any devices (Feb 2024)
  // https://caniuse.com/mdn-api_navigator_useragentdata
  const { userAgentData } = navigator as Navigator & {
    userAgentData?: { mobile: boolean };
  };
  if (nonNullish(userAgentData)) {
    return userAgentData.mobile;
  }

  // Legacy
  const isTouchScreen = window.matchMedia("(any-pointer:coarse)").matches;

  return isTouchScreen;
};

export const isDesktop = (): boolean => !isMobile();

const userAgent = (): string => navigator.userAgent;
