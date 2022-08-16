/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Toast from "../../../../lib/components/ui/Toast.svelte";
import type { ToastMsg } from "../../../../lib/types/toast";

describe("Toast", () => {
  const props: { msg: ToastMsg } = {
    msg: { labelKey: "core.close", level: "success", detail: "more details" },
  };

  it("should render a text", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("Close");
  });

  it("should render a close button", async () => {
    const { container } = render(Toast, {
      props,
    });

    const button = container.querySelector("button.close");

    expect(button).toBeInTheDocument();
  });

  it("should render details", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("more details");
  });

  it("should render substitutions for success", async () => {
    const canisterId = "aaaaa-aa";
    const { container } = render(Toast, {
      props: {
        msg: {
          labelKey: "canisters.create_canister_success",
          level: "success",
          substitutions: {
            $canisterId: canisterId,
          },
        },
      },
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain(canisterId);
  });

  it("should render substitutions for errors", async () => {
    const { container } = render(Toast, {
      props: {
        msg: {
          labelKey: "error__account.subaccount_not_found",
          level: "error",
          substitutions: {
            $account_identifier: "testtesttest",
          },
        },
      },
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("testtesttest");
  });
});
