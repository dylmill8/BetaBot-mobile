import "dotenv/config";

import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BetaBot",
  slug: "betabot",
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
