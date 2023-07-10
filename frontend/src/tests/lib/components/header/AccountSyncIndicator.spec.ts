import AccountSyncIndicator from "$lib/components/header/AccountSyncIndicator.svelte";
import { authStore } from "$lib/stores/auth.store";
import { syncStore } from "$lib/stores/sync.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

describe("AccountSyncIndicator", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeEach(() => {
    syncStore.reset();
  });

  describe("not signed in", () => {
    beforeEach(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render an indicator", () => {
      const { getByTestId } = render(AccountSyncIndicator);
      expect(() => getByTestId("sync-indicator")).toThrow();
    });

    it("should not render an indicator even if in progress", () => {
      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      const { getByTestId } = render(AccountSyncIndicator);
      expect(() => getByTestId("sync-indicator")).toThrow();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should not render an indicator if idle", () => {
      const { getByTestId } = render(AccountSyncIndicator);
      expect(() => getByTestId("sync-indicator")).toThrow();
    });

    it("should render an indicator if in progress", () => {
      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      const { getByTestId } = render(AccountSyncIndicator);
      expect(getByTestId("sync-indicator")).not.toBeNull();
    });

    it("should render an indicator if in error", () => {
      syncStore.setState({
        key: "balances",
        state: "error",
      });

      const { getByTestId } = render(AccountSyncIndicator);
      expect(getByTestId("sync-indicator")).not.toBeNull();
    });

    it("should render an indicator if state updates", async () => {
      const { getByTestId } = render(AccountSyncIndicator);
      expect(() => getByTestId("sync-indicator")).toThrow();

      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      await waitFor(() => expect(getByTestId("sync-indicator")).not.toBeNull());
    });

    it("should hide the indicator if state updates back to idle", async () => {
      const { getByTestId } = render(AccountSyncIndicator);
      expect(() => getByTestId("sync-indicator")).toThrow();

      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      await waitFor(() => expect(getByTestId("sync-indicator")).not.toBeNull());

      syncStore.setState({
        key: "balances",
        state: "idle",
      });

      await waitFor(() =>
        expect(() => getByTestId("sync-indicator")).toThrow()
      );
    });

    it("should render aria label for indicator in progress", () => {
      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      const { getByTestId } = render(AccountSyncIndicator);
      expect(getByTestId("sync-indicator").getAttribute("aria-label")).toEqual(
        en.sync.status_in_progress
      );
    });

    it("should render aria label for indicator in error", () => {
      syncStore.setState({
        key: "balances",
        state: "error",
      });

      const { getByTestId } = render(AccountSyncIndicator);
      expect(getByTestId("sync-indicator").getAttribute("aria-label")).toEqual(
        en.sync.status_error
      );
    });

    const testPopover = async (
      label: string
    ): Promise<RenderResult<SvelteComponent>> => {
      const result = render(AccountSyncIndicator);

      const { getByTestId, queryByRole, getByText } = result;

      await fireEvent.click(getByTestId("sync-indicator"));

      await waitFor(() => expect(queryByRole("menu")).not.toBeNull());

      expect(getByText(label)).toBeInTheDocument();

      return result;
    };

    it("should render a description in a popover for indicator in progress", async () => {
      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      await testPopover(en.sync.status_in_progress_detailed);
    });

    it("should render a description in a popover for indicator in error", async () => {
      syncStore.setState({
        key: "balances",
        state: "error",
      });

      await testPopover(en.sync.status_error_detailed);
    });

    it("should close popover if indicator becomes idle", async () => {
      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      const { queryByRole } = await testPopover(
        en.sync.status_in_progress_detailed
      );

      syncStore.setState({
        key: "balances",
        state: "idle",
      });

      await waitFor(() => expect(queryByRole("menu")).toBeNull());

      syncStore.setState({
        key: "balances",
        state: "in_progress",
      });

      expect(queryByRole("menu")).toBeNull();
    });
  });
});
