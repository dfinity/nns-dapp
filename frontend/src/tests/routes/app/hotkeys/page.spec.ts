import * as governanceApi from "$lib/api/governance.api";
import HotkeysPage from "$routes/(app)/(nns)/hotkeys/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Hotkeys page", () => {
  beforeEach(() => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
  });

  it("should render sign-in if not logged in", () => {
    setNoIdentity();

    const { getByTestId } = render(HotkeysPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });

  it("should render the hotkeys page when signed in", () => {
    resetIdentity();

    const { getByTestId } = render(HotkeysPage);

    expect(getByTestId("hotkeys-content")).not.toBeNull();
  });
});
