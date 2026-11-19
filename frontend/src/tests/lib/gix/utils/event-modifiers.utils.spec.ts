import {
  preventDefault,
  stopPropagation,
} from "$lib/gix/utils/event-modifiers.utils";
import { fireEvent, render } from "@testing-library/svelte";
import PreventDefaultTest from "./PreventDefaultTest.svelte";
import StopPropagationTest from "./StopPropagationTest.svelte";

describe("event-modifiers-utils", () => {
  describe("stopPropagation", () => {
    const stopPropagationMock = vi.fn();
    const callbackMock = vi.fn();

    const mockEvent = {
      stopPropagation: stopPropagationMock,
      currentTarget: {} as EventTarget & HTMLButtonElement,
    } as unknown as MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement;
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should stop event propagation", async () => {
      const handler = stopPropagation(callbackMock);

      await handler(mockEvent);

      expect(stopPropagationMock).toHaveBeenCalledOnce();
    });

    it("should call the callback", async () => {
      const handler = stopPropagation(callbackMock);

      await handler(mockEvent);

      expect(callbackMock).toHaveBeenCalledExactlyOnceWith(mockEvent);
    });

    it("should handle nullish events", async () => {
      const handler = stopPropagation(callbackMock);

      await handler(undefined);

      expect(callbackMock).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it("should throw if callback throws an error", async () => {
      const error = new Error("Test error");
      const handler = stopPropagation(() => {
        throw error;
      });

      await expect(handler(mockEvent)).rejects.toThrow(error);
    });

    it("should not throw if callback is not a function", async () => {
      const handler1 = stopPropagation(undefined);

      await expect(handler1(mockEvent)).resolves.not.toThrow();

      const handler2 = stopPropagation(null);

      await expect(handler2(mockEvent)).resolves.not.toThrow();
    });

    it("should call only the child handler and stop propagation to parent", async () => {
      const onParentClick = vi.fn();
      const onChildClick = vi.fn();
      const childTestId = "child-button";

      const { getByTestId } = render(StopPropagationTest, {
        props: { onParentClick, onChildClick, childTestId },
      });

      const button = getByTestId(childTestId);
      await fireEvent.click(button);

      expect(onChildClick).toHaveBeenCalledOnce();
      expect(onParentClick).not.toHaveBeenCalled();
    });

    it("should stop propagation to parent even if the child callback is not provided", async () => {
      const onParentClick = vi.fn();
      const childTestId = "child-button";

      const { getByTestId } = render(StopPropagationTest, {
        props: { onParentClick, childTestId },
      });

      const button = getByTestId(childTestId);
      await fireEvent.click(button);

      expect(onParentClick).not.toHaveBeenCalled();
    });
  });

  describe("preventDefault", () => {
    const preventDefaultMock = vi.fn();
    const callbackMock = vi.fn();

    const mockEvent = {
      preventDefault: preventDefaultMock,
      currentTarget: {} as EventTarget & HTMLButtonElement,
    } as unknown as MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement;
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should prevent default event behavior", async () => {
      const handler = preventDefault(callbackMock);

      await handler(mockEvent);

      expect(preventDefaultMock).toHaveBeenCalledOnce();
    });

    it("should call the callback", async () => {
      const handler = preventDefault(callbackMock);

      await handler(mockEvent);

      expect(callbackMock).toHaveBeenCalledExactlyOnceWith(mockEvent);
    });

    it("should handle nullish events", async () => {
      const handler = preventDefault(callbackMock);

      await handler(undefined);

      expect(callbackMock).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it("should throw if callback throws an error", async () => {
      const error = new Error("Test error");
      const handler = preventDefault(() => {
        throw error;
      });

      await expect(handler(mockEvent)).rejects.toThrow(error);
    });

    it("should not throw if callback is nullish", async () => {
      const handler1 = preventDefault(undefined);

      await expect(handler1(mockEvent)).resolves.not.toThrow();

      const handler2 = preventDefault(null);

      await expect(handler2(mockEvent)).resolves.not.toThrow();
    });

    it("should call only the child handler and prevent default form submission", async () => {
      const onSubmit = vi.fn();
      const onButtonClick = vi.fn();
      const childTestId = "submit-button";

      const { getByTestId } = render(PreventDefaultTest, {
        props: { onSubmit, onButtonClick, childTestId },
      });

      const button = getByTestId(childTestId);
      await fireEvent.click(button);

      expect(onButtonClick).toHaveBeenCalledOnce();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should prevent default form submission even if the child callback is not provided", async () => {
      const onSubmit = vi.fn();
      const childTestId = "submit-button";

      const { getByTestId } = render(PreventDefaultTest, {
        props: { onSubmit, childTestId },
      });

      const button = getByTestId(childTestId);
      await fireEvent.click(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
