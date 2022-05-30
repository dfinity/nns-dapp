/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CanisterDetail from "../../routes/CanisterDetail.svelte";
import en from "../mocks/i18n.mock";

describe("CanisterDetail", () => {
  it("should render title", () => {
    const { getByText } = render(CanisterDetail);

    expect(getByText(en.canister_detail.title)).toBeInTheDocument();
  });
});
