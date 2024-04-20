import { ICompany } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useCompaniesQuery = () => {
  const result = useQuery<ICompany[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      const result = await response.json();
      return result.data;
    },
  });

  return result;
};
