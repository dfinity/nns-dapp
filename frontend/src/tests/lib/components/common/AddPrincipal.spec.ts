/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import AddPrincipal from "../../../../lib/components/common/AddPrincipal.svelte";
import { mockIdentity } from "../../../mocks/auth.store.mock";

describe("PrincipalInput", () => {
  it("should render an input and a button", () => {
    const { getByTestId } = render(AddPrincipal, {
      props: { principal: undefined },
    });

    expect(getByTestId("add-principal-button")).toBeInTheDocument();
    expect(getByTestId("input-ui-element")).toBeInTheDocument();
  });

  it("should render an disabled button if principal is not correct", async () => {
    const { getByTestId } = render(AddPrincipal, {
      props: { principal: undefined },
    });

    const inputElement = getByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    await fireEvent.input(inputElement, { target: { value: "not-valid" } });
    await fireEvent.blur(inputElement);

    const buttonElement = getByTestId("add-principal-button");

    await waitFor(() =>
      expect(buttonElement.hasAttribute("disabled")).toBeTruthy()
    );
  });

  it("should enable button when principal is valid", async () => {
    const { getByTestId } = render(AddPrincipal, {
      props: { principal: undefined },
    });

    const inputElement = getByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    await fireEvent.input(inputElement, {
      target: { value: mockIdentity.getPrincipal().toText() },
    });
    await fireEvent.blur(inputElement);

    const buttonElement = getByTestId("add-principal-button");

    await waitFor(() =>
      expect(buttonElement.hasAttribute("disabled")).toBeFalsy()
    );
  });
});
