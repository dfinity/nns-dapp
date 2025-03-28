import { login, logout } from "$lib/services/auth.services";
import {
  IconAccountsPage,
  IconCanistersPage,
  IconHome,
  IconLogin,
  IconLogout,
  IconNeuronsPage,
  IconSettings,
  Theme,
  themeStore,
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
  contextFilter?: (context: { isSignedIn: boolean }) => boolean;
}

const toggleTheme = () =>
  themeStore.select(
    document.querySelector("html")?.getAttribute("theme") === "light"
      ? Theme.DARK
      : Theme.LIGHT
  );

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
    id: "neurons",
    type: "page",
    title: "Neurons",
    description: "Manage your neurons",
    path: "/neurons",
    icon: IconNeuronsPage,
  },
  {
    id: "canisters",
    type: "page",
    title: "Canisters",
    description: "Manage your canisters",
    path: "/canisters",
    icon: IconCanistersPage,
  },
  {
    id: "accounts",
    type: "page",
    title: "Accounts",
    description: "Manage your accounts",
    path: "/accounts",
    icon: IconAccountsPage,
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
    id: "toggle-theme",
    type: "action",
    title: "Toggle Theme",
    description: "Switch between light and dark mode",
    icon: IconSettings,
    action: toggleTheme,
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
  context: { isSignedIn: boolean }
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
