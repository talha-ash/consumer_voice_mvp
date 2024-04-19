import { useEmployeeStore } from "./employeeStore";

const EmployeeApp = () => {
  const employee = useEmployeeStore((state) => state.data.user);
  console.log(employee);
  return (
    <div>
      <h1>Hello Employee World</h1>
    </div>
  );
};

export default EmployeeApp;
