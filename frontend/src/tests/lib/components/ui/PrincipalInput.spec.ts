import PrincipalInputTest from "$tests/lib/components/ui/PrincipalInputTest.svelte";
import en from "$tests/mocks/i18n.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

describe("PrincipalInput", () => {
  const props = {
    name: "name",
    placeholderLabelKey: "test.placeholder",
    disabled: undefined,
  };

  it("should render an input", () => {
    const { getByTestId } = render(PrincipalInputTest, {
      props,
    });

    expect(getByTestId("input-ui-element")).toBeInTheDocument();
  });

  it("should render an error message on blur", async () => {
    const { getByText, getByTestId } = render(PrincipalInputTest, {
      props,
    });

    const inputElement = getByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    await fireEvent.input(inputElement, { target: { value: "not-valid" } });
    await fireEvent.blur(inputElement);

    await waitFor(() =>
      expect(getByText(en.error.principal_not_valid)).toBeInTheDocument()
    );
  });

  it("should be not disabled by default", async () => {
    const { getByTestId } = render(PrincipalInputTest, {
      props: {
        ...props,
      },
    });
    expect(getByTestId("input-ui-element").getAttribute("disabled")).toBeNull();
  });

  it("should provide disable state", async () => {
    const { getByTestId: getByTestId2 } = render(PrincipalInputTest, {
      props: {
        ...props,
        disabled: true,
      },
    });
    expect(
      getByTestId2("input-ui-element").getAttribute("disabled")
    ).not.toBeNull();
  });
});
