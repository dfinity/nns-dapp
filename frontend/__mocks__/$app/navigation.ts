import { pageStore } from "../../src/lib/stores/page.store";

export const goto = async (
  url: string | URL,
  opts?: {
    replaceState?: boolean;
    noscroll?: boolean;
    keepfocus?: boolean;
    state?: any;
  }
): Promise<void> => {
  const { searchParams } =
    url instanceof URL ? url : new URL(`http://localhost:8080${url}`);
  pageStore.load({
    universe: searchParams.get("u"),
  });
};
