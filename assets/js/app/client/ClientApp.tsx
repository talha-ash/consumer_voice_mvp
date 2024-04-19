import { useClientStore } from "./clientStore";

const ClientApp = () => {
  const client = useClientStore((state) => state.data.user);
  console.log(client);
  return (
    <div>
      <h1>Hello Client World</h1>
    </div>
  );
};

export default ClientApp;
