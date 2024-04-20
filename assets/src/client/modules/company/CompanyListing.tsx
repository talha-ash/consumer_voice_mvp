import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { ICompany } from "@/shared/types";
import { useLocation } from "wouter";

interface ICompanyListingProps {
  companies: ICompany[];
}

export const CompanyListing = ({ companies }: ICompanyListingProps) => {
  const [_location, setLocation] = useLocation();

  return (
    <Table>
      <TableCaption>Companies</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => {
          return (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="flex gap-1 m-2 justify-end">
                <Button onClick={() => setLocation(`/company/${company.id}`)}>
                  Visit
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
