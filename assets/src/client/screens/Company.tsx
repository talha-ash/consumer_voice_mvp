import { useCompanyQuery } from "../queryHooks";
import { useClientStore } from "../stores/clientStore";
import { ClientCompanyStoreProvider } from "../stores/clientCompanyStore";
import { CompanyDetail } from "../modules/company/components";

interface ICompanyDetailProps {
  id: string;
}
export const Company = ({ id }: ICompanyDetailProps) => {
  const companyQuery = useCompanyQuery(id);
  const client = useClientStore((state) => state.data.client);

  return (
    <div className="flex m-5">
      {companyQuery.isLoading && <p>Loading...</p>}
      {companyQuery.isError && <p>Error: {companyQuery.error.message}</p>}
      {companyQuery.data && (
        <ClientCompanyStoreProvider client={client} company={companyQuery.data}>
          <CompanyDetail />
        </ClientCompanyStoreProvider>
      )}
    </div>
  );
};
