import { Button, Spinner } from "@/shared/components";
import { useClientStore } from "../stores/clientStore";
import {
  CallSessionStoreProvider,
  useCallSessionStore,
} from "../stores/callSessionStore";
import { useLocation, useParams } from "wouter";
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
      <h1>Call Session {sessionId}</h1>
      {sessionState.loading ? (
        <div>
          <Spinner />
        </div>
      ) : null}
      {sessionState.callActive ? (
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
