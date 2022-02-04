/// <reference types="svelte" />

// The input event is neither defined in node types no in svelte.
// This extends the event with the currentTarget that is provided by the browser and that can be used to retrieve the input value.
type InputEventHandler = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};
