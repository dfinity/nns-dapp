const initWorker = () => {
	// TODO: sveltekit
	// const worker = new Worker("./build/worker.js", { type: "module" });
	//
	// worker.onmessage = async ({ data }: MessageEvent<PostMessageEventData>) => {
	//   const { msg } = data;
	//
	//   switch (msg) {
	//     case "nnsSignOut":
	//       await logout({
	//         msg: {
	//           labelKey: "warning.auth_sign_out",
	//           level: "warn",
	//         },
	//       });
	//
	//       return;
	//   }
	// };
	//
	// return {
	//   syncAuthIdle: async (auth: AuthStore) => {
	//     if (!auth.identity) {
	//       worker.postMessage({ msg: "nnsStopIdleTimer" });
	//       return;
	//     }
	//
	//     worker.postMessage({
	//       msg: "nnsStartIdleTimer",
	//     });
	//   },
	// };
};

export const worker = initWorker();
