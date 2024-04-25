import { ICompany } from "@/shared/types";
import { useLocation } from "wouter";

interface ICompanyListingProps {
  companies: ICompany[];
}

export const CompanyListing = ({ companies }: ICompanyListingProps) => {
  const [_location, setLocation] = useLocation();

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="w-full text-left rounded w-overflow-x-auto "
        cellSpacing="0"
      >
        <tbody>
          <tr>
            <th
              scope="col"
              className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
            >
              Name
            </th>
            <th
              scope="col"
              className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
            >
              Actions
            </th>
          </tr>
          {companies.map((company) => {
            return (
              <tr key={company.id}>
                <td className="h-12 px-6 text-sm transition duration-300 border-slate-200 stroke-slate-500 text-slate-500 ">
                  {company.name}
                </td>

                <td className="h-12 px-6 text-sm transition duration-300 border-slate-200 stroke-slate-500 text-slate-500 ">
                  <button
                    className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded bg-emerald-500 px-6 text-sm font-medium tracking-wide text-white shadow-lg shadow-emerald-200 transition duration-300 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-200 focus:bg-emerald-700 focus:shadow-md focus:shadow-emerald-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
                    onClick={() => setLocation(`/company/${company.id}`)}
                  >
                    <span>Visit</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
