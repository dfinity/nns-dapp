/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import ConfirmActionScreenTest from "./ConfirmActionScreenTest.svelte";

describe("ConfirmActionScreen", () => {
  it("should render main information", () => {
    const { queryByTestId } = render(ConfirmActionScreenTest);

    const element = queryByTestId("test-main-info");
    expect(element).toBeInTheDocument();
  });

  it("should render confirmation button", () => {
    const { queryByTestId } = render(ConfirmActionScreenTest);

    const element = queryByTestId("confirm-action-button");
    expect(element).toBeInTheDocument();
  });

  it("should trigger nnsConfirm event on click button", async () => {
    const spy = jest.fn();
    const { queryByTestId } = render(ConfirmActionScreenTest, {
      props: { spy },
    });

    const element = queryByTestId("confirm-action-button");
    expect(element).toBeInTheDocument();

    element && (await fireEvent.click(element));
    expect(spy).toBeCalled();
  });
});
