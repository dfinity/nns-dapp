/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import PrincipalInputTest from "./PrincipalInputTest.svelte";

describe("PrincipalInput", () => {
  const props = { name: "name", placeholderLabelKey: "test.placeholder" };

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
});
