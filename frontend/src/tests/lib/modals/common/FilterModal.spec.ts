import FilterModal from "$lib/modals/common/FilterModal.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import FilterModalTest from "./FilterModalTest.svelte";

describe("FilterModal", () => {
  const filters = [
    { id: "1", name: "test", value: 1, checked: false },
    { id: "2", name: "test-2", value: 2, checked: true },
  ];
  const props = {
    filters,
  };

  it("should display modal", () => {
    const { container } = render(FilterModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const title = "Test title";
    const { getByText } = render(FilterModalTest, { props: { title } });

    expect(getByText(title)).toBeInTheDocument();
  });

  it("should render checkboxes", () => {
    const { container } = render(FilterModal, {
      props,
    });

    expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(
      filters.length
    );
  });

  it("should forward close modal event", (done) => {
    const { queryByTestId, component } = render(FilterModal, {
      props,
    });

    component.$on("nnsClose", () => {
      done();
    });

    const button = queryByTestId("close");
    button && fireEvent.click(button);
  });

  it("should trigger nnsChange event when checkbox is clicked", (done) => {
    const { container, component } = render(FilterModal, {
      props,
    });

    component.$on("nnsChange", () => {
      done();
    });

    const checkboxes = container.querySelectorAll("input[type=checkbox]");
    checkboxes[0] && fireEvent.click(checkboxes[0]);
  });

  it("should trigger nnsConfirm event when primary button is clicked", (done) => {
    const { queryByTestId, component } = render(FilterModal, {
      props,
    });

    component.$on("nnsConfirm", () => {
      done();
    });

    const button = queryByTestId("apply-filters");
    button && fireEvent.click(button);
  });
});
