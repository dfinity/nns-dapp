/**
 * @jest-environment jsdom
 */

import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
import * as accountsServices from "$lib/services/sns-accounts.services";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";
import { snsAccountsStore } from "../../../../lib/stores/sns-accounts.store";
import { snsQueryStore } from "../../../../lib/stores/sns.store";
import { transactionsFeesStore } from "../../../../lib/stores/transaction-fees.store";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../../mocks/sns-accounts.mock";
import { snsResponseFor } from "../../../mocks/sns-response.mock";
import { testAccountsModal } from "../../../utils/accounts.test-utils";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
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

    const spy = jest.spyOn(accountsServices, "syncSnsAccounts");

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(spy).toBeCalledTimes(1));
  });
});
