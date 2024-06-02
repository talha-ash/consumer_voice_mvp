import { EmployeesList, ClientQueue, CallModal } from "../components";

import { useEmployeeCompanyStore } from "../stores/employeeCompanyStore";

const Home = () => {
  const companyState = useEmployeeCompanyStore(
    (state) => state.data.companyState,
  );
  const onlineEmployeesList = companyState.onlineEmployeesList;
  return (
    <div>
      <h1>Home Alone</h1>
      <div className="flex flex-row justify-between gap-2">
        <EmployeesList employeesList={onlineEmployeesList} />
        <ClientQueue clientQueue={companyState.clientQueue} />
        <CallModal />
      </div>
    </div>
  );
};

export { Home };
