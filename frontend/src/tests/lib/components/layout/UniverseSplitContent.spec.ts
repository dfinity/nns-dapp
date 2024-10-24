import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("UniverseSplitContent", () => {
  beforeEach(() => {
    resetIdentity();

    layoutTitleStore.set({
      title: "the header",
    });
  });

  it("should render the universe nav", () => {
    const { getByTestId } = render(UniverseSplitContent);
    expect(getByTestId("select-universe-nav-title")).not.toBeNull();
  });

  it("should render a header", () => {
    const { getByText } = render(UniverseSplitContent);

    expect(getByText("the header")).toBeInTheDocument();
  });

  it("should render the login button in the header", () => {
    setNoIdentity();

    const { getByTestId } = render(UniverseSplitContent);
    expect(getByTestId("toolbar-login")).not.toBeNull();
  });

  it("should render the account menu", () => {
    resetIdentity();

    const { getByTestId } = render(UniverseSplitContent);
    expect(getByTestId("account-menu")).not.toBeNull();
  });
});
