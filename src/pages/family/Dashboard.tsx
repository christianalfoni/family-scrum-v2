import { match } from "react-states";
import { useDashboard } from "../../features/DashboardFeature";
import { DashboardSkeletcon } from "./DashboardSkeleton";

export const Dashboard = () => {
  const [dashboard, send] = useDashboard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeletcon />,
    ERROR: () => <DashboardSkeletcon />,
    LOADED: () => <DashboardSkeletcon />,
    LOADING: () => <DashboardSkeletcon />,
    REQUIRING_AUTHENTICATION: () => <DashboardSkeletcon />,
  });
};
