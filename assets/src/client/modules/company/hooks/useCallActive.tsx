import { useClientStore } from "@/client/stores/clientStore";
import { callStateType } from "@/client/types";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
const constraints: MediaStreamConstraints = {
  video: false,
  audio: true,
};

export const useCallActive = (callState: callStateType) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const peer2 = useRef<Peer.Instance | null>(null);
  const audioEle = useRef<HTMLAudioElement | null>(null);
  const onClientConnectionData = useClientStore(
    (state) => state.actions.onClientConnectionData
  );

  const dismissAll = () => {
    if (audioEle.current) {
      audioEle.current.pause();
      audioEle.current.srcObject = null;
      audioEle.current.remove();
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        track.stop();
      });
      setAudioStream(null);
    }
    if (peer2.current) {
      peer2.current.destroy();
    }
  };
  useEffect(() => {
    if (callState.callActive) {
      try {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
            // Handle the media stream as needed.
            setAudioStream(stream);
            let peer = new Peer({ stream });
            peer2.current = peer;
            peer.signal(callState.employeeConnectionData);
            peer.on("signal", (data) => {
              onClientConnectionData(data);
            });
            peer.on("stream", (stream) => {
              // got remote video stream, now let's show it in a video tag
              const audio = document.createElement("audio");
              audioEle.current = audio;
              audio.srcObject = stream;
              audio.play();
            });
          })
          .catch((error) => {
            console.error("Error accessing media devices.", error);
            // Handle the error if constraints cannot be satisfied.
          });
      } catch (err) {
        console.log(err);
      }
    }
  }, [callState.callActive]);
  return { dismissAll };
};
// async function to handle offer sd
