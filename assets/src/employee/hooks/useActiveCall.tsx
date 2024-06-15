import { useRef } from "react";
import Peer, { SignalData } from "simple-peer";
import { useEmployeeStore } from "../stores/employeeStore";
import { useEmployeeCompanyChannelStore } from "../stores/employeCompanyChannelStore";

export const useActiveCall = () => {
  const { employee, callState } = useEmployeeStore((state) => state.data);
  const onAcceptCall = useEmployeeStore((state) => state.actions.onAcceptCall);
  const sendAcceptCall = useEmployeeCompanyChannelStore(
    (state) => state.actions.sendAcceptCall
  );
  const dropCall = useEmployeeStore((state) => state.actions.dropCall);
  const sendDropCall = useEmployeeCompanyChannelStore(
    (state) => state.actions.sendDropCall
  );
  const peer1 = useRef<Peer.Instance | null>(null);
  const audioEle = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flagRef = useRef(false);

  const initCall = (clientConnectionData: SignalData) => {
    flagRef.current = true;
    peer1.current?.signal(clientConnectionData);
    peer1.current?.on("stream", (stream) => {
      if (document.querySelector("audio")) {
        document.querySelector("audio")?.remove();
      }
      const audio = document.createElement("audio");
      audioEle.current = audio;
      audio.srcObject = stream;
      audio.play();
    });
  };

  const dismissAll = () => {
    if (audioEle.current) {
      audioEle.current.remove();
      audioEle.current.pause();
      audioEle.current.srcObject = null;
      audioEle.current = null;
      console.log("Audio Dismisal");
    }

    if (streamRef.current) {
      if (peer1.current) {
        // @Todo Need to handle when drop by employee
        if (!peer1.current.destroyed) {
          peer1.current.removeStream(streamRef.current);
        }
        peer1.current.removeAllListeners();
        peer1.current.destroy();
        peer1.current = null;
        console.log("Peer1 Dismisal");
      }
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      console.log("Stream Dismisal");
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
              sendAcceptCall(callState, data);
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
    sendDropCall(employee.companyId!, employee.id);
  };

  return { dismissAll, initCall, handleAcceptCall, handleDropCall };
};
