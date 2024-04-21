import { useEffect } from "react";
import { useCompanyQuery } from "../queryHooks";
import { useClientStore } from "../stores/clientStore";

interface ICompanyDetailProps {
  id: string;
}
const CompanyDetail = ({ id }: ICompanyDetailProps) => {
  const companyQuery = useCompanyQuery(id);
  const client = useClientStore((state) => state.data.client);
  const createClientCompanyChannel = useClientStore(
    (state) => state.actions.createClientCompanyChannel
  );
  const removeClientCompanyChannel = useClientStore(
    (state) => state.actions.removeClientCompanyChannel
  );

  useEffect(() => {
    createClientCompanyChannel(id);
    return () => {
      removeClientCompanyChannel();
    };
  }, []);

  return (
    <div className="flex m-5">
      {companyQuery.isLoading && <p>Loading...</p>}
      {companyQuery.isError && <p>Error: {companyQuery.error.message}</p>}
      {companyQuery.data && (
        <div>
          <h1>{companyQuery.data.name}</h1>
        </div>
      )}
    </div>
  );
};

export { CompanyDetail };
