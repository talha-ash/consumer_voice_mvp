import { Button, Spinner } from "@/shared/components";
import { useClientStore } from "../stores/clientStore";
import {
  CallSessionStoreProvider,
  useCallSessionStore,
} from "../stores/callSessionStore";
import { Link, useLocation, useParams } from "wouter";
import { useEffect, memo } from "react";

type CallSessionProps = {
  sessionId: string;
};

const Component = ({ sessionId }: CallSessionProps) => {
  const navigate = useLocation()[1];
  const clearInitializingCallState = useClientStore(
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
      <h1>Call Session {sessionId}</h1>
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
        <div>
          <Button text={"Drop Call"} onClick={handleTerminateCall} />
        </div>
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
