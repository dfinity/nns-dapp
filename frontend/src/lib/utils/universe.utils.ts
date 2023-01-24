import { AppPath } from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { isSelectedPath } from "$lib/utils/navigation.utils";

export const pathSupportsCkBTC = ({ path }: Page): boolean =>
  isSelectedPath({
    currentPath: path,
    paths: [AppPath.Accounts, AppPath.Wallet],
  });
