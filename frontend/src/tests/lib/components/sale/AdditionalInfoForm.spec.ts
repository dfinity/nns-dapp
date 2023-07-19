import { AdditionalInfoFormPo } from "$tests/page-objects/AdditionalInfoForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get, writable, type Writable } from "svelte/store";
import AdditionalInfoFormTest from "./AdditionalInfoFormTest.svelte";

const renderComponent = ({
  conditionsToAccept,
  areConditionsAcceptedStore,
}: {
  conditionsToAccept: string | undefined;
  areConditionsAcceptedStore?: Writable<boolean> | undefined;
}): AdditionalInfoFormPo => {
  const { container } = render(AdditionalInfoFormTest, {
    conditionsToAccept,
    areConditionsAcceptedStore,
  });
  return AdditionalInfoFormPo.under(new JestPageObjectElement(container));
};

describe("AdditionalInfoForm", () => {
  it("should render conditions if present", async () => {
    const conditionsToAccept = "I agree to sell my soul";
    const po = renderComponent({ conditionsToAccept });
    expect(await po.hasConditions()).toBe(true);
    expect(await po.getConditions()).toBe(conditionsToAccept);
  });

  it("should not render conditions if not present", async () => {
    const conditionsToAccept = undefined;
    const po = renderComponent({ conditionsToAccept });
    expect(await po.hasConditions()).toBe(false);
  });

  it("should export the checkbox state", async () => {
    const conditionsToAccept = "I agree to sell my soul";
    const areConditionsAcceptedStore = writable<boolean>(false);
    const po = renderComponent({
      conditionsToAccept,
      areConditionsAcceptedStore,
    });
    expect(get(areConditionsAcceptedStore)).toBe(false);
    await po.toggleConditionsAccepted();
    expect(get(areConditionsAcceptedStore)).toBe(true);
    await po.toggleConditionsAccepted();
    expect(get(areConditionsAcceptedStore)).toBe(false);
  });
});
