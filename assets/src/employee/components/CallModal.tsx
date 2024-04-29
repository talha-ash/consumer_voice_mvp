import { Button, Modal, Spinner } from "@/shared/components";
import { useEmployeeStore } from "../stores/employeeStore";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
interface ICallModal {}

export const CallModal = ({}: ICallModal) => {
  const callState = useEmployeeStore((state) => state.data.callState);
  const peer1 = useRef<Peer.Instance | null>(null);
  const audioEle = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flagRef = useRef(false);

  const toggleCallModal = useEmployeeStore(
    (state) => state.actions.toggleCallModal
  );
  const onAcceptCall = useEmployeeStore((state) => state.actions.onAcceptCall);
  const dropCall = useEmployeeStore((state) => state.actions.dropCall);

  useEffect(() => {
    if (callState.callActive) {
      toggleCallModal(true);
    }
  }, [callState.callActive]);

  useEffect(() => {
    if (callState.clientConnectionData) {
      console.log("how long", performance.now);
      flagRef.current = true;
      peer1.current?.signal(callState.clientConnectionData);
      peer1.current?.on("stream", (stream) => {
        console.log("How much you you");
        if (document.querySelector("audio")) {
          document.querySelector("audio")?.remove();
        }
        const audio = document.createElement("audio");
        audioEle.current = audio;
        audio.srcObject = stream;
        audio.play();
      });
    }
  }, [callState.clientConnectionData]);

  const dismissAll = () => {    
    if (audioEle.current) {
      audioEle.current.pause();
      audioEle.current.srcObject = null;
      audioEle.current.remove();
      audioEle.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
    if (peer1.current) {
      peer1.current.destroy();
      peer1.current = null;
    }
  };
  const setVisible = (visible: boolean) => {
    toggleCallModal(visible);
    if (!visible) {
      handleDropCall();
    }
  };

  const handleAcceptCall = () => {
    let flag = true;
    try {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: true,
        })
        .then((stream) => {
          const peer = new Peer({ initiator: true, stream });

          peer1.current = peer;
          streamRef.current = stream;

          peer.on("signal", (data) => {
            if (flag) {
              flag = false;
              onAcceptCall(data);
            }
          });
        })
        .catch((error) => {
          console.log("error", error);
          return null;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDropCall = () => {
    dismissAll();
    dropCall();
  };
  return (
    <Modal
      visible={callState.callModal}
      setVisible={setVisible}
      title="Initiating Call"
    >
      {callState.callInitiateLoading ? (
        <Button text={"Accept Call"} onClick={handleAcceptCall} />
      ) : null}

      {callState.callActive ? (
        <Button text={"Drop Call"} onClick={handleDropCall} />
      ) : null}
    </Modal>
  );
};
