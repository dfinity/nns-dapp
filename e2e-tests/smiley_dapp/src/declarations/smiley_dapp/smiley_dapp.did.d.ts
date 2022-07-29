import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'getBackgroundColor' : ActorMethod<[], string>,
  'getSmileyChar' : ActorMethod<[], string>,
  'setBackgroundColor' : ActorMethod<[string], undefined>,
  'setSmileyChar' : ActorMethod<[string], undefined>,
}
