/// <reference types="svelte" />

type InputEventHandler = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};
