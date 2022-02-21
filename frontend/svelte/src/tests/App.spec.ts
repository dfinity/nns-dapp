/**
 * @jest-environment jsdom
 */

import { LedgerCanister } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import App from "../App.svelte";
import { authStore } from "../lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "./mocks/auth.store.mock";
import { MockLedgerCanister } from "./mocks/ledger.canister.mock";

describe("App", () => {
  let spyLedger;
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    spyLedger = jest.spyOn(mockLedgerCanister, "accountBalance");
  });

  it("should synchronize the accounts after sign in", async () => {
    render(App);

    expect(spyLedger).toHaveBeenCalledTimes(0);

    authStoreMock.next({
      identity: mockIdentity,
    });

    await tick();

    expect(spyLedger).toHaveBeenCalledTimes(1);
  });
});
