import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Use value defined in dfx.json (.networks.local.bind)
const REPLICA_HOST = "http://localhost:8080";

// Use value defined in .dfx/local/canister_ids.json (.nns-dapp.local) as
// canister ID
const canistersToPorts: any = {
  "rwlgt-iiaaa-aaaaa-aaaaa-cai": 8086,
};

const mkApp = (port: number, canisterId: string) => {
  const app = express();

  // could use morgan's .token() thingy but really not worth it here
  app.use(
    morgan((_, req, res) => {
      let color = (rc: number) => {
        if (rc >= 200 && rc < 300) {
          return 32; // GREEN
        } else if (rc >= 300 && rc < 400) {
          return 34; // BLUE
        } else if (rc >= 400 && rc < 500) {
          return 33; // YELLOW
        } else {
          return 35; // RED
        }
      };

      //console.log(req);
      return `${canisterId} (${port}) \x1b[${color(res.statusCode)}m${
        res.statusCode
      }\x1b[0m ${req.method} ${req.originalUrl} -> ${req.url} `;
    })
  );

  app.all(
    "*",
    createProxyMiddleware({
      target: REPLICA_HOST,
      pathRewrite: (pathAndParams, req) => {
        let queryParamsString = "?";

        let [path, params] = pathAndParams.split("?");

        // TODO: check for existing canisterID param?
        if (params === undefined) {
          queryParamsString = `?canisterId=${canisterId}`;
        } else {
          queryParamsString = `?${params}&canisterId=${canisterId}`;
        }

        return (path += queryParamsString);
      },
    })
  );

  app.listen(port, "localhost", () => {
    console.log(
      `Canister ${canisterId} is listening on http://localhost:${port}`
    );
  });
};

for (let canisterId in canistersToPorts) {
  let port = canistersToPorts[canisterId];
  mkApp(port, canisterId);
}
