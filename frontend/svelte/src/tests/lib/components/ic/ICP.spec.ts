/**
 * @jest-environment jsdom
 */

import type { ICP as ICPModel } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ICP from "../../../../lib/components/ic/ICP.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";

describe("ICP", () => {
  const props: { icp: ICPModel } = { icp: mockMainAccount.balance };

  it("should render an ICP value", () => {
    const { container } = render(ICP, {
      props,
    });

    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `${formatICP({value: mockMainAccount.balance.toE8s()})}`
    );
  });

  it("should render an ICP text", () => {
    const { getByText } = render(ICP, {
      props,
    });

    expect(getByText("ICP")).toBeInTheDocument();
  });

  it("should render + sign", () => {
    const { container } = render(ICP, {
      props: {
        ...props,
        sign: "+",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `+${formatICP({value: mockMainAccount.balance.toE8s()})}`
    );
    expect(container.querySelector(".plus-sign")).toBeInTheDocument();
  });

  it("should render - sign", () => {
    const { container } = render(ICP, {
      props: {
        ...props,
        sign: "-",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `-${formatICP({value: mockMainAccount.balance.toE8s()})}`
    );
  });
});
