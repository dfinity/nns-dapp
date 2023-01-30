import { page } from "$app/stores";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { CKBTC_UNIVERSE } from "$lib/derived/selectable-universes.derived";
import { goToWallet } from "$lib/utils/navigation.accounts.utils";
import { page as pageMock } from "$mocks/$app/stores";
import { get } from "svelte/store";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";

describe("navigation.accounts.utils.ts", () => {
  it("should navigate to wallet", async () => {
    pageMock.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    await goToWallet({
      account: mockCkBTCMainAccount,
      universe: CKBTC_UNIVERSE.canisterId.toString(),
    });

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Wallet);

    const { data } = get(page);
    expect(data).toEqual({
      universe: CKBTC_UNIVERSE.canisterId.toString(),
      account: mockCkBTCMainAccount.identifier,
    });
  });
});
