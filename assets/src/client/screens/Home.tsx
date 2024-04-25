import { CompanyListing } from "../modules/company/components/CompanyListing";
import { useCompaniesQuery } from "../queryHooks";
import styles from "./home.module.css";
const Home = () => {
  const companiesQuery = useCompaniesQuery();

  return (
    <div className={styles.homeContainer}>
      <h1 className="text-xl">Companies</h1>
      {companiesQuery.isLoading && <p>Loading...</p>}
      {companiesQuery.isError && <p>Error: {companiesQuery.error.message}</p>}
      {companiesQuery.data && (
        <CompanyListing companies={companiesQuery.data} />
      )}
    </div>
  );
};

export { Home };
