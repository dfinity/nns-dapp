import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { projectsAccountsBalance } from "$lib/derived/projects-accounts-balance.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { get } from "svelte/store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../../mocks/accounts.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";

describe("projects-accounts-balance.derived", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(mockAccountsStoreSubscribe([], []));

  const rootCanisterId = mockSnsFullProject.rootCanisterId;

  beforeAll(() => {
    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should derive a balance of Nns accounts", () => {
    const balances = get(projectsAccountsBalance);
    expect(balances[OWN_CANISTER_ID_TEXT].balance.toE8s()).toEqual(
      mockMainAccount.balance.toE8s()
    );
  });

  it("should derive a balance of Sns accounts", () => {
    const balances = get(projectsAccountsBalance);
    expect(balances[rootCanisterId.toText()].balance.toE8s()).toEqual(
      mockSnsMainAccount.balance.toE8s()
    );
  });
});
