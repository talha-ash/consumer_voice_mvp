import {
  COMPANY_STATUS_AVAILABLE,
  COMPANY_STATUS_OFFLINE,
  ONLINE_STATUS_BUSY,
  ONLINE_STATUS_IDLE,
  ONLINE_STATUS_ON,
} from "../constants";
import { companyStatusType, onlineStatusType } from "../types";

type ColorStatusProps = {
  status: onlineStatusType | companyStatusType;
};
export const ColorStatus = ({ status }: ColorStatusProps) => {
  const bgColor = {
    [ONLINE_STATUS_ON]: "bg-green-400",
    [ONLINE_STATUS_BUSY]: "bg-blue-400",
    [ONLINE_STATUS_IDLE]: "bg-gray-400",
    [COMPANY_STATUS_AVAILABLE]: "bg-green-400",
    [COMPANY_STATUS_OFFLINE]: "bg-red-400",
  };

  return <span className={`w-3 h-3 rounded-full ${bgColor[status]}`}></span>;
};
