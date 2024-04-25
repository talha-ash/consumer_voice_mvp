import { useEffect } from "react";
import { useEmployeeCompanyStore } from "../stores/employeeCompanyStore";
import { IUser } from "@/shared/types";

export const useCreateEmployeeCompanyChannel = (employee: IUser) => {
  const createEmployeeCompanyChannel = useEmployeeCompanyStore(
    (state) => state.actions.createEmployeeCompanyChannel
  );
  const removeEmployeeCompanyChannel = useEmployeeCompanyStore(
    (state) => state.actions.removeEmployeeCompanyChannel
  );

  useEffect(() => {
    if (employee.email) {
      createEmployeeCompanyChannel(employee);
    }
    return () => {
      removeEmployeeCompanyChannel();
    };
  }, []);
};
