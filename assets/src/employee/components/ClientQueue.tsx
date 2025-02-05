import { IUser } from "@/shared/types";
import { ColorStatus } from "@/shared/components";

interface IClientQueue {
  clientQueue: IUser[];
}

export const ClientQueue = ({ clientQueue }: IClientQueue) => {
  return (
    <div>
      <h1 className="text-xl">Queue Clients</h1>
      <ul className="divide-y divide-slate-100">
        {clientQueue.map((client) => {
          return (
            <li key={client.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex min-h-[2rem] flex-1 flex-col items-start justify-center gap-0 overflow-hidden">
                <h4 className="w-full truncate text-base text-slate-700">
                  {client.email}
                </h4>
              </div>
              <ColorStatus status={client.status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
