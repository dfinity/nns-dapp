import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import SignInGuardTest from "$tests/lib/components/common/SignInGuardTest.svelte";

describe("SignInGuard", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should not render slot", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(() => getByTestId("test-slot")).toThrow();
    });

    it("should render sign-in", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render slot", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(getByTestId("test-slot")).not.toBeNull();
    });

    it("should not render sign-in", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(() => getByTestId("login-button")).toThrow();
    });
  });
});
