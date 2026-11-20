import Back from "$lib/gix/components/Back.svelte";
import Chip from "$lib/gix/components/Chip.svelte";
import Collapsible from "$lib/gix/components/Collapsible.svelte";
import Copy from "$lib/gix/components/Copy.svelte";
import KeyValuePairInfo from "$lib/gix/components/KeyValuePairInfo.svelte";
import Menu from "$lib/gix/components/Menu.svelte";
import MenuButton from "$lib/gix/components/MenuButton.svelte";
import Modal from "$lib/gix/components/Modal.svelte";
import Popover from "$lib/gix/components/Popover.svelte";
import ThemeToggleButton from "$lib/gix/components/ThemeToggleButton.svelte";
import Toast from "$lib/gix/components/Toast.svelte";
import FormTest from "$tests/lib/gix/components/FormTest.svelte";
import SegmentTest from "$tests/lib/gix/components/SegmentTest.svelte";
import { mockSnippet } from "$tests/lib/gix/mocks/snippet.mocks";
import { fireEvent, render } from "@testing-library/svelte";
import type { Component } from "svelte";

describe("Buttons", () => {
  beforeEach(() => {
    Object.assign(window.navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const components: {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Component<any>;
    props: Record<string, unknown>;
  }[] = [
    { name: "Back", component: Back, props: { onBack: vi.fn() } },
    {
      name: "Chip",
      component: Chip,
      props: { id: "chip", label: "Chip", selected: false, onClick: vi.fn() },
    },
    {
      name: "Collapsible",
      component: Collapsible,
      props: { header: mockSnippet, children: mockSnippet },
    },
    { name: "Copy", component: Copy, props: { value: "test-copy" } },
    {
      name: "KeyValuePairInfo",
      component: KeyValuePairInfo,
      props: { key: mockSnippet, value: mockSnippet, info: mockSnippet },
    },
    {
      name: "KeyValuePairInfo with the icon on the right",
      component: KeyValuePairInfo,
      props: {
        key: mockSnippet,
        value: mockSnippet,
        info: mockSnippet,
        alignIconRight: true,
      },
    },
    { name: "Menu", component: Menu, props: {} },
    { name: "MenuButton", component: MenuButton, props: {} },
    {
      name: "Modal",
      component: Modal,
      props: { title: mockSnippet, children: mockSnippet, onClose: vi.fn() },
    },
    {
      name: "Popover",
      component: Popover,
      props: { visible: true, closeButton: true },
    },
    {
      name: "SegmentButton",
      component: SegmentTest,
      props: {
        firstSegmentId: Symbol(),
        secondSegmentId: Symbol(),
        thirdSegmentId: Symbol(),
      },
    },
    { name: "ThemeToggleButton", component: ThemeToggleButton, props: {} },
    {
      name: "Toast",
      component: Toast,
      props: { msg: { id: Symbol(), text: "Toast", level: "success" } },
    },
  ];

  it.each(components)(
    "$name should not submit a parent form",
    async ({ component, props }) => {
      const onSubmit = vi.fn();

      const { container } = render(FormTest, {
        props: { component, props, onSubmit },
      });

      const buttons = Array.from(container.querySelectorAll("form button"));

      expect(buttons.length).toBeGreaterThan(0);

      for (const button of buttons) {
        expect(button).toHaveAttribute("type", "button");

        await fireEvent.click(button);
      }

      expect(onSubmit).not.toHaveBeenCalled();
    }
  );
});
