import { Button } from "@/shared/components";
import { useLocation } from "wouter";
import { useCallSessionStore } from "../stores/callSessionStore";
import { useEffect } from "react";
import { useEmployeeStore } from "../stores/employeeStore";

export const CallSession = ({ sessionId }: { sessionId: string }) => {
  const navigate = useLocation()[1];

  const clearInitializingCallState = useEmployeeStore(
    (state) => state.actions.clearInitializingCallState
  );
  const activeCallState = useCallSessionStore(
    (state) => state.data.activeCallState
  );

  const sendTerminateCall = useCallSessionStore(
    (state) => state.actions.sendTerminateCall
  );

  const handleTerminateCall = () => {
    sendTerminateCall().then(() => {
      navigate("/");
    });
  };

  useEffect(() => {
    clearInitializingCallState();
  }, []);

  useEffect(() => {
    if (!activeCallState.callActive) {
      navigate("/");
    }
  }, [activeCallState.callActive]);

  return (
    <div>
      Call Session {sessionId}
      {activeCallState.callActive ? (
        <Button text={"Drop Call"} onClick={handleTerminateCall} />
      ) : null}
    </div>
  );
};
