import { ICompany } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useCompanyQuery = (id: string) => {
  const result = useQuery<ICompany>({
    queryKey: ["company", id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      const result = await response.json();
      return result.data;
    },
  });

  return result;
};
