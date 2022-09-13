import type { PostMessageEventData } from "./lib/types/post-messages";
import { startIdleTimer, stopIdleTimer } from "./lib/workers/auth.worker";

onmessage = ({ data }: MessageEvent<PostMessageEventData>) => {
  const { msg } = data;

  switch (msg) {
    case "nnsStartIdleTimer":
      startIdleTimer();
      return;
    case "nnsStopIdleTimer":
      stopIdleTimer();
      return;
  }
};
