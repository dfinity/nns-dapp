#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";

const copyIndex = () => {
  const buffer = readFileSync("./src/index.html");
  const content = buffer.toString("utf-8");

  // Specifies where the svelte app is loaded (typically "/" in local development and "/v2" in production)
  const updatedContent = content.replace(
    "<!-- BASE_HREF -->",
    `<base href="${process.env.BASE_HREF || "/v2/"}" />`
  );

  writeFileSync("./public/index.html", updatedContent);
};

copyIndex();
