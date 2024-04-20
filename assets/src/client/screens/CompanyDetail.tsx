import { useCompanyQuery } from "../queryHooks";

interface ICompanyDetailProps {
  id: string;
}
const CompanyDetail = ({ id }: ICompanyDetailProps) => {
  const companyQuery = useCompanyQuery(id);

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
