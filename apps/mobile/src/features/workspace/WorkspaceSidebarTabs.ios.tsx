import { View } from "react-native";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useWorkspaceTabs } from "./WorkspaceTabsContext";
import type { WorkspaceTab } from "./workspace-tabs-state";
import { useSelectWorkspaceTab } from "./useSelectWorkspaceTab";

export function WorkspaceSidebarTabs() {
  const workspace = useWorkspaceTabs()!;
  const selectTab = useSelectWorkspaceTab();
  return (
    <View className="px-4 pb-3 pt-2">
      <SegmentedControl
        role="tab"
        options={[
          { value: "threads", label: "会话" },
          { value: "pullRequests", label: "拉取请求" },
        ]}
        selected={workspace.state.selectedTab}
        onSelect={(tab: WorkspaceTab) => selectTab(tab)}
      />
    </View>
  );
}
