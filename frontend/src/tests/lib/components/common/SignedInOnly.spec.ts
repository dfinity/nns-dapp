import SignedInOnlyTest from "$tests/lib/components/common/SignedInOnlyTest.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("SignedInOnly", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should not render slot", () => {
      const { getByTestId } = render(SignedInOnlyTest);
      expect(() => getByTestId("test-slot")).toThrow();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render slot", () => {
      const { getByTestId } = render(SignedInOnlyTest);
      expect(getByTestId("test-slot")).not.toBeNull();
    });
  });
});
