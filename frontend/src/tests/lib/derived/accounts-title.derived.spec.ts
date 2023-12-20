import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { accountsTitleStore } from "$lib/derived/accounts-title.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("accountsTitleStore", () => {
  beforeEach(() => {
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: OWN_CANISTER_ID_TEXT },
    });
    tokensStore.reset();
  });

  it("returns 'My Tokens' if no token is found", () => {
    // the ICP token is hardcoded in the `tokensStore`, so it will always be found
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: rootCanisterIdMock.toText() },
    });

    expect(get(accountsTitleStore)).toEqual("My Tokens");
  });

  it("returns the ICP in the title", () => {
    expect(get(accountsTitleStore)).toEqual("My ICP Tokens");
  });

  it("returns the token of the universe in the title", () => {
    // the ICP token is hardcoded in the `tokensStore`, so it will always be found
    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: rootCanisterIdMock.toText() },
    });

    tokensStore.setToken({
      canisterId: rootCanisterIdMock,
      token: {
        ...mockSnsToken,
        symbol: "TTRS",
      },
    });

    expect(get(accountsTitleStore)).toEqual("My TTRS Tokens");
  });
});
