import { Button, Spinner } from "@/shared/components";
import { Link, useLocation, useParams } from "wouter";
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
  const callNotFound = useCallSessionStore((state) => state.data.callNotFound);

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

  const { callActive, downCount, downState, loading } = sessionState;

  if (callNotFound) {
    return (
      <div>
        <h1>Call Has Been Ended</h1>
        <Link href="/">Go Back</Link>
      </div>
    );
  }
  return (
    <div>
      Call Session {sessionId}
      {loading ? (
        <div>
          <Spinner />
        </div>
      ) : null}
      {downState ? (
        <div>
          <Spinner />
          {downCount}
        </div>
      ) : null}
      {callActive && !downState ? (
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
