import type { PostMessageEventData } from "./lib/types/post-messages";
import { startIdleTimer, stopIdleTimer } from "./lib/workers/auth.worker";

onmessage = ({ data }: MessageEvent<PostMessageEventData>) => {
  const { msg, data: authData } = data;

  switch (msg) {
    case "nnsStartIdleTimer":
      startIdleTimer(authData);
      return;
    case "nnsStopIdleTimer":
      stopIdleTimer();
      return;
  }
};
