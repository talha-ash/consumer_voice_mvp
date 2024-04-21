import { useEmployeeStore } from "./stores/employeeStore";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.employee);

  console.log(employee);
  return (
    <div>
      <h1>Hello Employee Worldd {employee.role}</h1>
    </div>
  );
};

export default EmployeeApp;
