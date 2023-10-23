import { fireEvent, render } from "@testing-library/svelte";
import NeuronConfirmActionScreenTest from "./NeuronConfirmActionScreenTest.svelte";

describe("NeuronConfirmActionScreen", () => {
  it("should render main information", () => {
    const { queryByTestId } = render(NeuronConfirmActionScreenTest);

    const element = queryByTestId("test-main-info");
    expect(element).toBeInTheDocument();
  });

  it("should render confirmation button", () => {
    const { queryByTestId } = render(NeuronConfirmActionScreenTest);

    const element = queryByTestId("confirm-action-button");
    expect(element).toBeInTheDocument();
  });

  it("should render custom edit button", () => {
    const editLabel = "CUSTOM-EDIT-BUTTON";
    const { getByText } = render(NeuronConfirmActionScreenTest, {
      props: { editLabel },
    });

    expect(getByText(editLabel)).toBeInTheDocument();
  });

  it("should render default edit button label when not provided", () => {
    const { getByText } = render(NeuronConfirmActionScreenTest);

    expect(getByText("Edit percentage")).toBeInTheDocument();
  });

  it("should trigger nnsConfirm event on click button", async () => {
    const spy = vi.fn();
    const { queryByTestId } = render(NeuronConfirmActionScreenTest, {
      props: { spy },
    });

    const element = queryByTestId("confirm-action-button");
    expect(element).toBeInTheDocument();

    element && (await fireEvent.click(element));
    expect(spy).toBeCalled();
  });
});
