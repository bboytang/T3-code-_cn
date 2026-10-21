// Configure EAS profiles from repository Actions variables (never hardcode upstream IDs).
import { readFileSync, writeFileSync } from "node:fs";

const owner = process.env.T3CN_EXPO_OWNER?.trim();
const projectId = process.env.T3CN_EXPO_PROJECT_ID?.trim();
const bundleId = (process.env.T3CN_IOS_BUNDLE_ID || "com.bboytang.t3codecn").trim();
if (!owner || !projectId) {
  throw new Error("Set Actions variables EXPO_OWNER and EXPO_PROJECT_ID in your own Expo account.");
}
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
  throw new Error("EXPO_PROJECT_ID must be a UUID from your own Expo EAS project.");
}
if (!/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(bundleId)) {
  throw new Error("IOS_BUNDLE_ID must be an Apple reverse-DNS identifier.");
}
const path = "apps/mobile/eas.json";
const data = JSON.parse(readFileSync(path, "utf8"));
for (const name of ["t3cn", "t3cn-simulator"]) {
  if (!data.build[name]) throw new Error("Missing EAS build profile: " + name);
  data.build[name].env = {
    ...data.build[name].env,
    T3CN_EXPO_OWNER: owner,
    T3CN_EXPO_PROJECT_ID: projectId,
    T3CN_IOS_BUNDLE_ID: bundleId,
    T3CODE_IOS_PERSONAL_TEAM_BUNDLE_ID: bundleId,
  };
}
writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("EAS settings ready for owner " + owner + ", app " + bundleId + ".");
