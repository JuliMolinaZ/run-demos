import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Uploadthing puede usar UPLOADTHING_TOKEN o UPLOADTHING_SECRET
const uploadthingToken =
  process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  ...(uploadthingToken && {
    config: {
      token: uploadthingToken,
    },
  }),
});

