import { defineCliConfig } from "sanity/cli";

// Het project-ID en de dataset zijn openbaar: de inhoud komt toch op de website.
export default defineCliConfig({
  api: {
    projectId: "qgoawz7m",
    dataset: "production",
  },
  // Online op https://signup-reclame.sanity.studio (npm run deploy).
  deployment: {
    appId: "ttmgqr67wxte72g9fn6fegh8",
    autoUpdates: false,
  },
});
