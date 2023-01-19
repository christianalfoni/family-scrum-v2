import { Suspense } from "react";
import { DashboardSkeleton } from "../Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

export const Session: React.FC = ({ children }) => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {children}
      <SignInModal />
      <UpdateModal />
    </Suspense>
  );
};
