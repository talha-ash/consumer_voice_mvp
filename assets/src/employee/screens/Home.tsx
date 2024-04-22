import { useEmployeeCompanyStore } from "../stores/employeeCompanyStore";

const Home = () => {
  const companyState = useEmployeeCompanyStore(
    (state) => state.data.companyState
  );
  return (
    <div>
      <h1>Home Alone</h1>
      <h1>{JSON.stringify(companyState)}</h1>
    </div>
  );
};

export { Home };
