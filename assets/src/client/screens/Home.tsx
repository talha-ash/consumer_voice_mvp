import { Link } from "wouter";
import { CompanyListing } from "../modules/company/components/CompanyListing";
import { useCompaniesQuery } from "../queryHooks";
import { useClientStore } from "../stores/clientStore";
import styles from "./home.module.css";
const Home = () => {
  const companiesQuery = useCompaniesQuery();
  const pendingCallID = useClientStore((state) => state.data.pendingCallID);

  return (
    <div className={styles.homeContainer}>
      <h1 className="text-xl">Companies</h1>
      {pendingCallID && (
        <div>
          Active call:{" "}
          <Link href={`/call/${pendingCallID}`}>Pending Call</Link>
        </div>
      )}
      {companiesQuery.isLoading && <p>Loading...</p>}
      {companiesQuery.isError && <p>Error: {companiesQuery.error.message}</p>}
      {companiesQuery.data && (
        <CompanyListing companies={companiesQuery.data} />
      )}
    </div>
  );
};

export { Home };
