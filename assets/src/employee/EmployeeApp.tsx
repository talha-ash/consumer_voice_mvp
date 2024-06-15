import { Home } from "./screens/Home";
import { useEmployeeStore } from "./stores/employeeStore";

import { EmployeeChannelStoreProvider } from "./stores/employeChannelStore";
import { EmployeeCompanyChannelStoreProvider } from "./stores/employeCompanyChannelStore";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.employee);

  if (!employee.id) {
    return null;
  }

  return (
    <EmployeeChannelStoreProvider userId={employee.id}>
      <EmployeeCompanyChannelStoreProvider
        userId={employee.id}
        companyId={employee.companyId!}
      >
        <Home />
      </EmployeeCompanyChannelStoreProvider>
    </EmployeeChannelStoreProvider>
  );
};

export default EmployeeApp;
