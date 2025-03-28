import { login, logout } from "$lib/services/auth.services";
import {
  IconDarkMode,
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

export interface AlfredItem {
  id: string;
  type: "page" | "action";
  title: string;
  description: string;
  path?: string;
  action?: () => void;
  icon: Component;
  contextFilter?: (context: {
    isSignedIn: boolean;
    theme: ThemeStoreData;
  }) => boolean;
}

const alfredItems: AlfredItem[] = [
  {
    id: "home",
    type: "page",
    title: "Home",
    description: "View your investment portfolio",
    path: "/",
    icon: IconHome,
  },
  {
    id: "tokens",
    type: "page",
    title: "Tokens",
    description: "Manage your tokens and accounts",
    path: "/accounts",
    icon: IconTokens,
  },
  {
    id: "neurons",
    type: "page",
    title: "Neurons",
    description: "Manage your neurons",
    path: "/neurons",
    icon: IconNeurons,
  },
  {
    id: "voting",
    type: "page",
    title: "Voting",
    description: "Democracy",
    path: "/proposals",
    icon: IconVote,
  },
  {
    id: "launchpad",
    type: "page",
    title: "Launchpad",
    description: "SNS world",
    path: "/launchpad",
    icon: IconLaunchpad,
  },
  {
    id: "canisters",
    type: "page",
    title: "Canisters",
    description: "Manage your canisters",
    path: "/canisters",
    icon: IconLedger,
  },
  {
    id: "dark-theme",
    type: "action",
    title: "Dark Theme",
    description: "Set dark theme",
    icon: IconDarkMode,
    action: () => themeStore.select(Theme.DARK),
    contextFilter: (context) => context.theme === Theme.LIGHT,
  },
  {
    id: "light-theme",
    type: "action",
    title: "Light Theme",
    description: "Set light theme",
    icon: IconLightMode,
    action: () => themeStore.select(Theme.LIGHT),
    contextFilter: (context) => context.theme === Theme.DARK,
  },
  {
    id: "settings",
    type: "page",
    title: "Settings",
    description: "Adjust your preferences",
    path: "/settings",
    icon: IconSettings,
  },
  {
    id: "log-in",
    type: "action",
    title: "Log In",
    description: "Log in to your account",
    icon: IconLogin,
    action: login,
    contextFilter: (context) => !context.isSignedIn,
  },
  {
    id: "log-out",
    type: "action",
    title: "Log Out",
    description: "Log out of your account",
    icon: IconLogout,
    action: logout.bind(null, {}),
    contextFilter: (context) => context.isSignedIn,
  },
];

export const filterAlfredItems = (
  query: string,
  context: { isSignedIn: boolean; theme: ThemeStoreData }
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
