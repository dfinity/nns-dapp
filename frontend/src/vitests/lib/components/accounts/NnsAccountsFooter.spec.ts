import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
import * as accountsServices from "$lib/services/icp-accounts.services";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import AccountsTest from "$vitests/lib/pages/AccountsTest.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/icp-accounts.services", () => {
  return {
    syncAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

describe("NnsAccountsFooter", () => {
  const modalProps = {
    testComponent: NnsAccountsFooter,
  };

  it("should open receive modal", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-icp" });

    const { getByTestId } = result;

    expect(getByTestId("receive-modal")).not.toBeNull();
  });

  it("should sync accounts after finish receiving tokens", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-icp" });

    const { getByTestId, container } = result;

    await waitModalIntroEnd({ container, selector: modalToolbarSelector });

    await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());

    const spy = vi.spyOn(accountsServices, "syncAccounts");

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(spy).toBeCalledTimes(1));
  });
});
