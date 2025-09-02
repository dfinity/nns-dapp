import { AppPath } from "$lib/constants/routes.constants";
import { login, logout } from "$lib/services/auth.services";
import {
  balancePrivacyOptionStore,
  type BalancePrivacyOptionData,
} from "$lib/stores/balance-privacy-option.store";
import { i18n } from "$lib/stores/i18n";
import { transactionMemoOptionStore } from "$lib/stores/transaction-memo-option.store";
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
      path: AppPath.Portfolio,
      icon: IconHome,
    },
    {
      id: "tokens",
      type: "page",
      title: alfred.tokens_title,
      description: alfred.tokens_description,
      path: AppPath.Accounts,
      icon: IconTokens,
    },
    {
      id: "neurons",
      type: "page",
      title: alfred.neurons_title,
      description: alfred.neurons_description,
      path: AppPath.Neurons,
      icon: IconNeurons,
    },
    {
      id: "voting",
      type: "page",
      title: alfred.voting_title,
      description: alfred.voting_description,
      path: AppPath.Proposals,
      icon: IconVote,
    },
    {
      id: "launchpad",
      type: "page",
      title: alfred.launchpad_title,
      description: alfred.launchpad_description,
      path: AppPath.Launchpad,
      icon: IconLaunchpad,
    },
    {
      id: "reporting",
      type: "page",
      title: alfred.reporting_title,
      description: alfred.reporting_description,
      path: AppPath.Reporting,
      icon: IconDocument,
    },
    {
      id: "canisters",
      type: "page",
      title: alfred.canisters_title,
      description: alfred.canisters_description,
      path: AppPath.Canisters,
      icon: IconLedger,
    },
    {
      id: "settings",
      type: "page",
      title: alfred.settings_title,
      description: alfred.settings_description,
      path: AppPath.Settings,
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
      contextFilter: (context) =>
        context.balancePrivacyOption === "show" && context.isSignedIn,
    },
    {
      id: "show-balance",
      type: "action",
      title: "Show Balance",
      description: "Display your balances",
      icon: IconEyeOpen,
      action: () => balancePrivacyOptionStore.set("show"),
      contextFilter: (context) =>
        context.balancePrivacyOption === "hide" && context.isSignedIn,
    },
    {
      id: "show-transaction-memo",
      type: "action",
      title: "Show transaction memo",
      description: "Display memo input in transaction forms",
      icon: IconDocument,
      action: () => transactionMemoOptionStore.set("show"),
    },
    {
      id: "hide-transaction-memo",
      type: "action",
      title: "Hide transaction memo",
      description: "Hide memo input in transaction forms",
      icon: IconDocument,
      action: () => transactionMemoOptionStore.set("hide"),
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
