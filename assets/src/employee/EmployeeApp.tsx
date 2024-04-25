import { Home } from "./screens/Home";
import { useEmployeeStore } from "./stores/employeeStore";

import { useCreateEmployeeCompanyChannel } from "./hooks";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.employee);
  useCreateEmployeeCompanyChannel(employee);

  if (!employee.id) {
    return null;
  }

  return <Home />;
};

export default EmployeeApp;
