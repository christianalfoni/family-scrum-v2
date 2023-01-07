import { Suspense } from "react";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

export const Session: React.FC = ({ children }) => {
  return (
    <Suspense fallback={<h3>Authenticating</h3>}>
      {children}
      <SignInModal />
      <UpdateModal />
    </Suspense>
  );
};
