/**
 * @jest-environment jsdom
 */

import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
import * as accountsServices from "$lib/services/accounts.services";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

jest.mock("$lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("NnsAccountsFooter", () => {
  const modalProps = {
    testComponent: NnsAccountsFooter,
  };

  const testModal = async ({
    result,
    testId,
  }: {
    result: RenderResult<SvelteComponent>;
    testId: string;
  }) => {
    const { container, getByTestId } = result;

    const button = getByTestId(testId) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  };

  it("should open receive modal", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testModal({ result, testId: "receive-icp" });

    const { getByTestId } = result;

    expect(getByTestId("receive-modal")).not.toBeNull();
  });

  it("should sync accounts after finish receiving tokens", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testModal({ result, testId: "receive-icp" });

    const { getByTestId, container } = result;

    await waitModalIntroEnd({ container, selector: modalToolbarSelector });

    await waitFor(expect(getByTestId("receive-modal")).not.toBeNull);

    const spy = jest.spyOn(accountsServices, "syncAccounts");

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(spy).toBeCalledTimes(1));
  });
});
