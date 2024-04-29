import { useClientStore } from "@/client/stores/clientStore";
import { callStateType } from "@/client/types";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
const constraints: MediaStreamConstraints = {
  video: false,
  audio: true,
};

export const useCallActive = (callState: callStateType) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const onClientConnectionData = useClientStore(
    (state) => state.actions.onClientConnectionData
  );
  useEffect(() => {
    if (callState.callActive) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          // Handle the media stream as needed.
          setAudioStream(stream);
          let peer2 = new Peer({ stream });
          peer2.signal(callState.employeeConnectionData);
          peer2.on("signal", (data) => {
            onClientConnectionData(data);
          });
          peer2.on("stream", (stream) => {
            // got remote video stream, now let's show it in a video tag
            const audio = document.createElement("audio");
            audio.srcObject = stream;
            audio.play();
          });
        })
        .catch((error) => {
          // Handle the error if constraints cannot be satisfied.
        });
    }
  }, [callState.callActive]);
};
// async function to handle offer sd
