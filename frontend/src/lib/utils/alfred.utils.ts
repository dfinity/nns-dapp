import { login, logout } from "$lib/services/auth.services";
import {
  balancePrivacyOptionStore,
  type BalancePrivacyOptionData,
} from "$lib/stores/balance-privacy-option.store";
import { i18n } from "$lib/stores/i18n";
import {
  IconCopy,
  IconDarkMode,
  IconDocument,
  IconEyeClosed,
  IconEyeOpen,
  IconHome,
  IconLaunchpad,
  IconLedger,
  IconLightMode,
  IconLogin,
  IconLogout,
  IconNeurons,
  IconSettings,
  IconTokens,
  IconVote,
  Theme,
  themeStore,
  type ThemeStoreData,
} from "@dfinity/gix-components";
import type { Component } from "svelte";
import { get } from "svelte/store";

interface AlfredItemBase {
  id: string;
  type: "page" | "action";
  title: string;
  description: string;
  icon: Component;
  contextFilter?: (context: {
    isSignedIn: boolean;
    theme: ThemeStoreData;
    balancePrivacyOption: BalancePrivacyOptionData;
  }) => boolean;
}

interface AlfredItemPage extends AlfredItemBase {
  type: "page";
  path: string;
}

interface AlfredItemAction extends AlfredItemBase {
  type: "action";
  action: (payload: { copyToClipboardValue?: string }) => void;
}

export type AlfredItem = AlfredItemPage | AlfredItemAction;

const getAlfredItems = (): AlfredItem[] => {
  const i18nObj = get(i18n);
  const alfred = i18nObj.alfred;

  return [
    {
      id: "home",
      type: "page",
      title: alfred.home_title,
      description: alfred.home_description,
      path: "/",
      icon: IconHome,
    },
    {
      id: "tokens",
      type: "page",
      title: alfred.tokens_title,
      description: alfred.tokens_description,
      path: "/accounts",
      icon: IconTokens,
    },
    {
      id: "neurons",
      type: "page",
      title: alfred.neurons_title,
      description: alfred.neurons_description,
      path: "/neurons",
      icon: IconNeurons,
    },
    {
      id: "voting",
      type: "page",
      title: alfred.voting_title,
      description: alfred.voting_description,
      path: "/proposals",
      icon: IconVote,
    },
    {
      id: "launchpad",
      type: "page",
      title: alfred.launchpad_title,
      description: alfred.launchpad_description,
      path: "/launchpad",
      icon: IconLaunchpad,
    },
    {
      id: "reporting",
      type: "page",
      title: alfred.reporting_title,
      description: alfred.reporting_description,
      path: "/reporting",
      icon: IconDocument,
    },
    {
      id: "canisters",
      type: "page",
      title: alfred.canisters_title,
      description: alfred.canisters_description,
      path: "/canisters",
      icon: IconLedger,
    },
    {
      id: "settings",
      type: "page",
      title: alfred.settings_title,
      description: alfred.settings_description,
      path: "/settings",
      icon: IconSettings,
    },
    {
      id: "principalId",
      type: "action",
      title: alfred.principalId_title,
      description: alfred.principalId_description,
      icon: IconCopy,
      action: ({ copyToClipboardValue }) =>
        copyToClipboardValue && copyToClipboard(copyToClipboardValue),
      contextFilter: (context) => context.isSignedIn,
    },
    {
      id: "dark-theme",
      type: "action",
      title: alfred.dark_theme_title,
      description: alfred.dark_theme_description,
      icon: IconDarkMode,
      action: () => themeStore.select(Theme.DARK),
      contextFilter: (context) => context.theme === Theme.LIGHT,
    },
    {
      id: "light-theme",
      type: "action",
      title: alfred.light_theme_title,
      description: alfred.light_theme_description,
      icon: IconLightMode,
      action: () => themeStore.select(Theme.LIGHT),
      contextFilter: (context) => context.theme === Theme.DARK,
    },
    {
      id: "hide-balance",
      type: "action",
      title: "Hide Balance",
      description: "Privacy mode for your balance",
      icon: IconEyeClosed,
      action: () => balancePrivacyOptionStore.set("hide"),
      contextFilter: (context) => context.balancePrivacyOption === "show",
    },
    {
      id: "show-balance",
      type: "action",
      title: "Show Balance",
      description: "Display your balances",
      icon: IconEyeOpen,
      action: () => balancePrivacyOptionStore.set("show"),
      contextFilter: (context) => context.balancePrivacyOption === "hide",
    },
    {
      id: "log-in",
      type: "action",
      title: alfred.log_in_title,
      description: alfred.log_in_description,
      icon: IconLogin,
      action: login,
      contextFilter: (context) => !context.isSignedIn,
    },
    {
      id: "log-out",
      type: "action",
      title: alfred.log_out_title,
      description: alfred.log_out_description,
      icon: IconLogout,
      action: logout.bind(null, {}),
      contextFilter: (context) => context.isSignedIn,
    },
  ];
};

const alfredItems = getAlfredItems();

const copyToClipboard = async (value: string) =>
  await navigator.clipboard.writeText(value);

export const filterAlfredItems = (
  query: string,
  context: {
    isSignedIn: boolean;
    theme: ThemeStoreData;
    balancePrivacyOption: BalancePrivacyOptionData;
  }
): AlfredItem[] => {
  const items = alfredItems.filter(
    ({ contextFilter }) => contextFilter?.(context) ?? true
  );

  if (!query.trim()) return items;

  const lowercaseQuery = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
  );
};
