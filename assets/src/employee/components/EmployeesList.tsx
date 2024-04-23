import { IUser } from "@/shared/types";
import { ColorStatus } from "@/shared/components";

interface IEmployeesList {
  employeesList: IUser[];
}

export const EmployeesList = ({ employeesList }: IEmployeesList) => {
  return (
    <div>
      <h1 className="text-xl">Online Employees</h1>
      <ul className="divide-y divide-slate-100">
        {employeesList.map((employee) => {
          return (
            <li key={employee.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex min-h-[2rem] flex-1 flex-col items-start justify-center gap-0 overflow-hidden">
                <h4 className="w-full truncate text-base text-slate-700">
                  {employee.email}
                </h4>
              </div>
              <ColorStatus status={employee.status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
