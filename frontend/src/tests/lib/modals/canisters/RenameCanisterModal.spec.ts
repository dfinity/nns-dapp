import * as canisterApi from "$lib/api/canisters.api";
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import { authStore } from "$lib/stores/auth.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId, mockCanisters } from "$tests/mocks/canisters.mock";
import { RenameCanisterModalPo } from "$tests/page-objects/RenameCanisterModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import RenameCanisterModalTest from "./RenameCanisterModalTest.svelte";

vi.mock("$lib/api/canisters.api");

describe("RenameCanisterModal", () => {
  blockAllCallsTo(["$lib/api/canisters.api"]);

  beforeEach(() => {
    vi.spyOn(canisterApi, "renameCanister").mockResolvedValue(undefined);
    vi.spyOn(canisterApi, "queryCanisters").mockResolvedValue(mockCanisters);
    authStore.setForTesting(mockIdentity);
  });

  const renderComponent = ({ canisterId, name }) => {
    const { container } = render(RenameCanisterModalTest, {
      props: { canisterId, name },
    });

    return RenameCanisterModalPo.under(new JestPageObjectElement(container));
  };

  it("calls the canister api to rename canister", async () => {
    const newName = "new name";
    const po = renderComponent({ canisterId: mockCanisterId, name: "name" });

    po.enterName(newName);

    po.clickRenameButton();

    await runResolvedPromises();

    expect(canisterApi.renameCanister).toBeCalledWith({
      canisterId: mockCanisterId,
      name: newName,
      identity: mockIdentity,
    });
    expect(canisterApi.renameCanister).toBeCalledTimes(1);
  });

  it("shows enabled button when input is empty", async () => {
    const po = renderComponent({ canisterId: mockCanisterId, name: "name" });

    po.enterName("");

    await runResolvedPromises();

    expect(await po.getRenameButton().isDisabled()).toBe(false);
  });

  it("shows disabled button when input is longer than 24 characters", async () => {
    const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH + 1);
    const po = renderComponent({ canisterId: mockCanisterId, name: "name" });

    po.enterName(longName);

    await runResolvedPromises();

    expect(await po.getRenameButton().isDisabled()).toBe(true);
  });
});
