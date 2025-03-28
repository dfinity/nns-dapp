import { login, logout } from "$lib/services/auth.services";
import { Theme, themeStore } from "@dfinity/gix-components";

export interface AlfredItem {
  id: string;
  type: "page" | "action";
  title: string;
  description: string;
  path?: string;
  action?: () => void;
  icon?: string;
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
    icon: "wallet",
  },
  {
    id: "neurons",
    type: "page",
    title: "Neurons",
    description: "Manage your neurons",
    path: "/neurons",
    icon: "brain",
  },
  {
    id: "canisters",
    type: "page",
    title: "Canisters",
    description: "Manage your canisters",
    path: "/canisters",
    icon: "box",
  },
  {
    id: "accounts",
    type: "page",
    title: "Accounts",
    description: "Manage your accounts",
    path: "/accounts",
    icon: "creditCard",
  },
  {
    id: "settings",
    type: "page",
    title: "Settings",
    description: "Adjust your preferences",
    path: "/settings",
    icon: "settings",
  },
  {
    id: "toggle-theme",
    type: "action",
    title: "Toggle Theme",
    description: "Switch between light and dark mode",
    icon: "theme",
    action: toggleTheme,
  },
  {
    id: "log-in",
    type: "action",
    title: "Log In",
    description: "Log in to your account",
    icon: "logIn",
    action: login,
    contextFilter: (context) => !context.isSignedIn,
  },
  {
    id: "log-out",
    type: "action",
    title: "Log Out",
    description: "Log out of your account",
    icon: "logOut",
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
