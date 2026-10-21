// Keep personal translation builds independent of upstream Expo/Apple identities.
import { readFileSync, writeFileSync } from "node:fs";

const path = "apps/mobile/app.config.ts";
let content = readFileSync(path, "utf8");
const changes = [
  [
    'const iosBundleIdentifier = isIosPersonalTeamBuild\n  ? personalTeamBundleIdentifier!\n  : variant.iosBundleIdentifier;',
    'const iosBundleIdentifier =\n  repoEnv.T3CN_IOS_BUNDLE_ID?.trim() ||\n  (isIosPersonalTeamBuild ? personalTeamBundleIdentifier! : "com.bboytang.t3codecn");'
  ],
  ['  name: variant.appName,', '  name: repoEnv.T3CN_APP_NAME || "T3 Code 中文版",'],
  ['  slug: "t3-code",', '  slug: "t3-code-cn",'],
  ['  scheme: variant.scheme,', '  scheme: "t3code-cn",'],
  [
    '  updates: {\n    enabled: repoEnv.T3CODE_MOBILE_UPDATES_ENABLED !== "0",\n    url: "https://u.expo.dev/d763fcb8-d37c-41ea-a773-b54a0ab4a454",\n    checkAutomatically: "ON_LOAD",\n    fallbackToCacheTimeout: 0,\n  },',
    '  // Unofficial translation builds never receive upstream OTA updates.\n  updates: { enabled: false, checkAutomatically: "NEVER" },'
  ],
  [
    '    appleTeamId: "ARK85ZXQ4Z",',
    '    // No use of the upstream publisher Apple signing team.\n    ...(repoEnv.T3CN_APPLE_TEAM_ID ? { appleTeamId: repoEnv.T3CN_APPLE_TEAM_ID } : {}),'
  ],
  [
    /    associatedDomains: \[[\s\S]*?\],/,
    '    associatedDomains: [],'
  ],
  [
    'variant.iosBundleIdentifier}',
    'iosBundleIdentifier}'
  ],
  [
    '      projectId: "d763fcb8-d37c-41ea-a773-b54a0ab4a454",',
    '      projectId: repoEnv.T3CN_EXPO_PROJECT_ID,'
  ],
  ['  owner: "pingdotgg",', '  owner: repoEnv.T3CN_EXPO_OWNER,']
];
for (const [before, after] of changes) {
  const found = before instanceof RegExp ? before.test(content) : content.includes(before);
  if (!found) throw new Error("Upstream configuration changed; missing text: " + String(before).slice(0, 75));
  content = content.replace(before, after);
}
writeFileSync(path, content);

const easPath = "apps/mobile/eas.json";
const eas = JSON.parse(readFileSync(easPath, "utf8"));
const env = {
  APP_VARIANT: "production",
  T3CODE_IOS_PERSONAL_TEAM: "1",
  T3CODE_IOS_PERSONAL_TEAM_BUNDLE_ID: "com.bboytang.t3codecn",
  T3CN_IOS_BUNDLE_ID: "com.bboytang.t3codecn",
  T3CODE_MOBILE_UPDATES_ENABLED: "0",
  NODE_OPTIONS: "--max-old-space-size=4096"
};
eas.build.t3cn = {
  corepack: true,
  distribution: "internal",
  channel: "t3cn",
  env,
  ios: { image: "macos-tahoe-26.6-xcode-27.1" }
};
eas.build["t3cn-simulator"] = {
  extends: "t3cn",
  ios: { simulator: true, image: "macos-tahoe-26.6-xcode-27.1" }
};
writeFileSync(easPath, JSON.stringify(eas, null, 2) + "\n");
console.log("T3 Code CN: independent Expo, signing and OTA configuration prepared.");
