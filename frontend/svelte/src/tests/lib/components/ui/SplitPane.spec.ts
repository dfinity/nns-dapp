/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Menu from "../../../../lib/components/header/MenuButton.svelte";
import MenuButtonTest from "./SplitPaneTest.svelte";
import SplitPaneTest from './SplitPaneTest.svelte';

describe("SplitPane", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(SplitPaneTest);

    expect(getByTestId("split-pane-test-slot")).not.toBeNull();
    expect(getByTestId("split-pane-test-menu-slot")).not.toBeNull();
    expect(getByTestId("split-pane-test-header-slot")).not.toBeNull();
  });

});
