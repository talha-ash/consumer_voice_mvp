import { Button, Spinner } from "@/shared/components";
import { useLocation, useParams } from "wouter";
import {
  CallSessionStoreProvider,
  useCallSessionStore,
} from "../stores/callSessionStore";
import { memo, useEffect } from "react";
import { useEmployeeStore } from "../stores/employeeStore";

const Component = ({ sessionId }: { sessionId: string }) => {
  const navigate = useLocation()[1];

  const clearInitializingCallState = useEmployeeStore(
    (state) => state.actions.clearInitializingCallState
  );
  const sessionState = useCallSessionStore((state) => state.data.sessionState);

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
    if (!sessionState.callSessionStart) {
      navigate("/");
    }
  }, [sessionState.callSessionStart]);

  return (
    <div>
      Call Session {sessionId}
      {sessionState.loading ? (
        <div>
          <Spinner />
        </div>
      ) : null}
      {sessionState.callActive ? (
        <Button text={"Drop Call"} onClick={handleTerminateCall} />
      ) : null}
    </div>
  );
};

export const CallSession = memo(() => {
  const { sessionId } = useParams();
  return (
    <CallSessionStoreProvider sessionId={sessionId!}>
      <Component sessionId={sessionId!} />
    </CallSessionStoreProvider>
  );
});
