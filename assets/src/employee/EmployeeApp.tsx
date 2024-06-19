import { Home } from "./screens/Home";
import { useEmployeeStore } from "./stores/employeeStore";

import { EmployeeChannelStoreProvider } from "./stores/employeChannelStore";
import { EmployeeCompanyChannelStoreProvider } from "./stores/employeCompanyChannelStore";
import { Route, Switch } from "wouter";
import { CallSessionStoreProvider } from "./stores/callSessionStore";
import { CallSession } from "./screens/CallSession";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.employee);

  if (!employee.id) {
    return null;
  }

  return (
    <EmployeeChannelStoreProvider employeeId={employee.id}>
      <EmployeeCompanyChannelStoreProvider
        employeeId={employee.id}
        companyId={employee.companyId}
      >
         <Switch>
          <Route path="/" component={Home} />
          <Route path="/call/:sessionId">
            {(params) => (
              <CallSessionStoreProvider sessionId={params.sessionId}>
                <CallSession {...params} />
              </CallSessionStoreProvider>
            )}
          </Route>
          {/* Default route in a switch */}
          <Route>404: No such page!</Route>
        </Switch>
        
      </EmployeeCompanyChannelStoreProvider>
    </EmployeeChannelStoreProvider>
  );
};

export default EmployeeApp;
