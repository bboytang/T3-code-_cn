import { Toolbar } from "../../components/ui/Toolbar";
import { ScreenScrollView as ScrollView } from "../../components/ui/ScreenScrollView";
import { useAuth, useUser } from "@clerk/expo";
import { useNavigation } from "@react-navigation/native";
import { Platform, View } from "react-native";
import { deriveProjectGroupLabel } from "@t3tools/client-runtime/state/project-grouping";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hasCloudPublicConfig } from "../cloud/publicConfig";
import { useAdaptiveWorkspaceLayout } from "../layout/AdaptiveWorkspaceLayout";
import { NativeStackScreenOptions } from "../../native/StackHeader";
import { useSavedRemoteConnections } from "../../state/use-remote-environment-registry";
import { SettingsRow } from "./components/SettingsRow";
import { SettingsSection } from "./components/SettingsSection";
import { SettingsScreen } from "./components/SettingsScreen";
import {
  AndroidSettingsEnvironmentFilter,
  SettingsEnvironmentFilterHeader,
} from "./components/SettingsEnvironmentFilterHeader";
import { useSettingsEnvironmentFilter } from "./settings-environment-filter";

export function SettingsRouteScreen() {
  const navigation = useNavigation();
  const { layout } = useAdaptiveWorkspaceLayout();
  const content = hasCloudPublicConfig() ? (
    <ConfiguredSettingsRouteScreen />
  ) : (
    <LocalSettingsRouteScreen />
  );

  return (
    <>
      {Platform.OS === "ios" ? (
        <NativeStackScreenOptions options={{ headerBackVisible: !layout.usesSplitView }} />
      ) : null}
      {Platform.OS === "ios" && layout.usesSplitView ? (
        <>
          <Toolbar placement="left">
            <Toolbar.Button
              accessibilityLabel="返回"
              icon="chevron.left"
              onPress={() => navigation.goBack()}
            />
          </Toolbar>
        </>
      ) : null}
      <SettingsEnvironmentFilterHeader closeSettings />
      {Platform.OS === "android" ? (
        <SettingsScreen title="设置" trailing={<AndroidSettingsEnvironmentFilter />}>
          {content}
        </SettingsScreen>
      ) : (
        content
      )}
    </>
  );
}

function ConfiguredSettingsRouteScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { savedConnectionsById } = useSavedRemoteConnections();
  const accountLabel = !isLoaded
    ? "Checking"
    : !isSignedIn
      ? "Sign in"
      : (user?.primaryEmailAddress?.emailAddress ?? "Signed in");

  return (
    <View collapsable={false} className="flex-1 bg-sheet">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 18 }}
      >
        <SettingsSection title="连接">
          <SettingsRow
            icon="person.crop.circle"
            label="T3 账户"
            value={accountLabel}
            disabled={!isLoaded}
            onPress={() => navigation.navigate("SettingsSheet", { screen: "SettingsAuth" })}
          />
          <SettingsRow
            icon="desktopcomputer"
            label="运行环境"
            value={`${Object.keys(savedConnectionsById).length}`}
            valuePosition="trailing"
            target="SettingsEnvironments"
          />
          <SettingsRow icon="bell.badge" label="通知" target="SettingsNotifications" />
        </SettingsSection>

        <SettingsIndexSections />
      </ScrollView>
    </View>
  );
}

function LocalSettingsRouteScreen() {
  const insets = useSafeAreaInsets();
  const { savedConnectionsById } = useSavedRemoteConnections();
  const environmentCount = Object.keys(savedConnectionsById).length;

  return (
    <View collapsable={false} className="flex-1 bg-sheet">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pt-4"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 18) + 18,
        }}
      >
        <SettingsSection title="连接">
          <SettingsRow
            icon="desktopcomputer"
            label="运行环境"
            value={`${environmentCount}`}
            valuePosition="trailing"
            target="SettingsEnvironments"
          />
        </SettingsSection>

        <SettingsIndexSections />
      </ScrollView>
    </View>
  );
}

function SettingsIndexSections() {
  const { selectedTargets, projectGroups, selectedProjectKey } = useSettingsEnvironmentFilter();
  const noServerTargets = selectedTargets.length === 0;
  const selectedProject = projectGroups.find((group) => group.key === selectedProjectKey);
  const scopedProjectMembers =
    selectedProject?.members
      .map((member) => member.project)
      .filter((project) =>
        selectedTargets.some((target) => target.environmentId === project.environmentId),
      ) ?? [];
  const projectLabel =
    scopedProjectMembers.length > 0
      ? deriveProjectGroupLabel({
          representative: scopedProjectMembers[0]!,
          members: scopedProjectMembers,
        })
      : (selectedProject?.label ?? "Unavailable project");
  return (
    <>
      <SettingsSection title="界面">
        <SettingsRow icon="paintbrush" label="外观" target="SettingsAppearance" />
        {Platform.OS === "ios" ? (
          <>
            <SettingsRow icon="keyboard" label="键盘" target="SettingsKeyboard" />
            <SettingsRow icon="mic" label="麦克风" target="SettingsMicrophone" />
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="自动化">
        <SettingsRow icon="clock" label="定时任务" target="SettingsScheduledTasks" />
      </SettingsSection>

      <SettingsSection title="项目与会话">
        {selectedProjectKey !== null ? (
          <SettingsRow
            icon="folder"
            label="概览"
            value={projectLabel}
            target="SettingsProjectOverview"
          />
        ) : null}
        <SettingsRow icon="folder" label="组织管理" target="SettingsOrganization" />
        <SettingsRow icon="text.bubble" label="会话行为" target="SettingsThreads" />
        <SettingsRow icon="arrow.turn.left.up" label="后续消息" target="SettingsFollowUp" />
        <SettingsRow icon="archivebox" label="已归档会话" target="SettingsArchive" />
      </SettingsSection>

      <SettingsSection title="服务器设置">
        <SettingsRow
          icon="person.crop.circle"
          label="模型服务账户"
          target="SettingsProviderAccounts"
          disabled={noServerTargets}
        />
        <SettingsRow
          icon="text.bubble"
          label="新建会话"
          target="SettingsEnvironmentNewThreads"
          disabled={noServerTargets}
        />
        <SettingsRow
          icon="arrow.triangle.branch"
          label="版本控制"
          target="SettingsEnvironmentSourceControl"
          disabled={noServerTargets}
        />
        <SettingsRow
          icon="text.alignleft"
          label="智能体行为"
          target="SettingsEnvironmentAgentBehavior"
          disabled={noServerTargets}
        />
        <SettingsRow
          icon="arrow.clockwise"
          label="维护"
          target="SettingsEnvironmentMaintenance"
          disabled={noServerTargets}
        />
      </SettingsSection>

      <SettingsSection title="应用">
        <SettingsRow icon="chart.bar.xaxis" label="用量" target="SettingsUsage" />
        <SettingsRow icon="info.circle" label="关于 T3 Code" target="SettingsAbout" />
      </SettingsSection>
    </>
  );
}
