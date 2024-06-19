import { Button } from "@/shared/components";
import { useCallActive } from "../modules/company/hooks";
import { useClientStore } from "../stores/clientStore";
import { useCallSessionStore } from "../stores/CallSessionStore";
import { useLocation } from "wouter";
import { useEffect } from "react";

type CallSessionProps = {
  sessionId: string;
};
export const CallSession = ({ sessionId }: CallSessionProps) => {
  const navigate = useLocation()[1];
  const clearInitializingCallState = useClientStore(
    (state) => state.actions.clearInitializingCallState
  );
  const activeCallState = useCallSessionStore(
    (state) => state.data.activeCallState
  );
  const { dismissAll } = useCallActive(activeCallState);

  const sendDropCall = useCallSessionStore(
    (state) => state.actions.sendDropCall
  );

  const handleDropCall = () => {
    sendDropCall(activeCallState.companyId, activeCallState.employeeId).then(
      () => {
        dismissAll();
        console.log("Why not navigating", activeCallState.companyId);
        navigate(`/company/${activeCallState.companyId}`);
      }
    );
  };

  useEffect(() => {
    clearInitializingCallState();
  }, []);

  return (
    <div>
      <h1>Call Session {sessionId}</h1>
      <div>
        <Button text={"Drop Call"} onClick={handleDropCall} />
      </div>
    </div>
  );
};
