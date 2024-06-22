import { Button } from "@/shared/components";
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
      <h1>Call Session {sessionId}</h1>
      <div>
        <Button text={"Drop Call"} onClick={handleTerminateCall} />
      </div>
    </div>
  );
};
