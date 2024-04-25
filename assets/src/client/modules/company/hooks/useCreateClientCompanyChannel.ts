import { useClientCompanyStore } from "@/client/stores/clientCompanyStore";
import { useEffect } from "react";

export const useCreateClientCompanyChannel = () => {
  const createClientCompanyChannel = useClientCompanyStore(
    (state) => state.actions.createClientCompanyChannel
  );
  const removeClientCompanyChannel = useClientCompanyStore(
    (state) => state.actions.removeClientCompanyChannel
  );

  useEffect(() => {
    createClientCompanyChannel();
    return () => {
      removeClientCompanyChannel();
    };
  }, []);
};
