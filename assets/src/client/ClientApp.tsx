import { useClientStore } from "./stores/clientStore";
import { Route, Switch } from "wouter";
import { Home, Company, CallSession } from "./screens";
import { ClientChannelStoreProvider } from "./stores/clientChannelStore";

const ClientApp = () => {
  const clientId = useClientStore((state) => state.data.client.id);

  return (
    <div>
      <ClientChannelStoreProvider userId={clientId}>
        <Switch>
          <Route path="/" component={Home} />

          <Route path="/company/:id">
            {(params) => <Company {...params} />}
          </Route>

          <Route path="/call/:sessionId" component={CallSession} />

          {/* Default route in a switch */}
          <Route>404: No such page!</Route>
        </Switch>
      </ClientChannelStoreProvider>
    </div>
  );
};

export default ClientApp;
