/**
 * @jest-environment jsdom
 */

import { mockMainAccount } from "../../mocks/accounts.store.mock";
import type { ICP as ICPModel } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { formatICP } from "../../../lib/utils/icp.utils";
import ICP from "../../../lib/components/ICP.svelte";

describe("ICP", () => {
  const props: { icp: ICPModel } = { icp: mockMainAccount.balance };

  it("should render an ICP value", () => {
    const { container } = render(ICP, {
      props,
    });

    const value = container.querySelector("span:first-of-type");

    expect(value.textContent).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())}`
    );
  });

  it("should render an ICP text", () => {
    const { getByText } = render(ICP, {
      props,
    });

    expect(getByText("ICP")).toBeInTheDocument();
  });
});
