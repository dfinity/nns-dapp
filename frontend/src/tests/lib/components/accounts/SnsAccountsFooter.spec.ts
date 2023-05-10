import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
import * as accountsServices from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";
import { page } from "../../../../../__mocks__/$app/stores";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

describe("SnsAccountsFooter", () => {
  const responses = snsResponseFor({
    principal: mockPrincipal,
    lifecycle: SnsSwapLifecycle.Committed,
  });

  const rootCanisterIdText = responses[0][0].rootCanisterId;
  const rootCanisterId = Principal.fromText(rootCanisterIdText);

  beforeEach(() => {
    snsQueryStore.reset();
    snsAccountsStore.reset();
    transactionsFeesStore.reset();
    snsQueryStore.setData(responses);
    transactionsFeesStore.setFee({
      rootCanisterId,
      fee: BigInt(10_000),
      certified: true,
    });

    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });

    page.mock({ data: { universe: rootCanisterIdText } });
  });

  const modalProps = {
    testComponent: SnsAccountsFooter,
  };

  it("should open receive modal", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-sns" });

    const { getByTestId } = result;

    await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());
  });

  it("should sync accounts after finish receiving tokens", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-sns" });

    const { getByTestId, container } = result;

    await waitModalIntroEnd({ container, selector: modalToolbarSelector });

    await waitFor(expect(getByTestId("receive-modal")).not.toBeNull);

    const spy = vi.spyOn(accountsServices, "syncSnsAccounts");

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(spy).toBeCalledTimes(1));
  });
});
