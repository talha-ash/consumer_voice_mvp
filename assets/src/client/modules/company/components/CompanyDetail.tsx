import { useClientCompanyStore } from "@/client/stores/clientCompanyStore";
import { ColorStatus } from "@/shared/components";
import { COMPANY_STATUS_AVAILABLE } from "@/shared/constants";

import { useCreateClientCompanyChannel } from "../hooks";
import { CallModal } from "./CallModal";
import { useClientStore } from "@/client/stores/clientStore";

export const CompanyDetail = () => {
  useCreateClientCompanyChannel();
  const clientCompanyState = useClientCompanyStore(
    (state) => state.data.clientCompanyState
  );

  const onInitiateCall = useClientStore(
    (state) => state.actions.onInitiateCall
  );
  const initiateCompanyCall = useClientCompanyStore(
    (state) => state.actions.initiateCompanyCall
  );

  const handleinitiateCall = () => {
    initiateCompanyCall();
    onInitiateCall(clientCompanyState.company.id);
  };

  return (
    <div>
      <h1>Company Info</h1>
      <div className="flex flex-row items-center gap-4">
        <h1>Name: {clientCompanyState.company.name}</h1>
        <ColorStatus status={clientCompanyState.status} />
        {clientCompanyState.status == COMPANY_STATUS_AVAILABLE ? (
          <button
            className="inline-flex items-center justify-center h-12 gap-2 px-6 text-sm font-medium tracking-wide text-white  rounded whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 "
            onClick={handleinitiateCall}
          >
            <span>Help Call</span>
          </button>
        ) : null}

        <CallModal />
      </div>
    </div>
  );
};
