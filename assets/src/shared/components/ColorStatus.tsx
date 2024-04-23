import { onlineStatusType } from "../types";

export const ColorStatus = ({ status }: { status: onlineStatusType }) => {
  const bgColor = {
    on: "bg-green-400",
    offline: "bg-red-500",
    busy: "bg-blue-400",
    idle: "bg-gray-400",
  };

  return <span className={`w-3 h-3 rounded-full ${bgColor[status]}`}></span>;
};
