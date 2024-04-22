import { Home } from "./screens/Home";
import { EmployeeCompanyStoreProvider } from "./stores/employeeCompanyStore";

import { useEmployeeStore } from "./stores/employeeStore";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.employee);

  if (!employee.id) {
    return null;
  }
  console.log(employee);
  return (
    <EmployeeCompanyStoreProvider employee={employee}>
      <Home />
    </EmployeeCompanyStoreProvider>
  );
};

export default EmployeeApp;
