import { useClientStore } from "./stores/clientStore";
import { Link, Route, Switch } from "wouter";
import { Home, Company } from "./screens";
const ClientApp = () => {
  const client = useClientStore((state) => state.data.client);

  return (
    <div>
      <Switch>
        <Route path="/" component={Home} />

        <Route path="/company/:id">
          {(params) => <Company {...params} />}
        </Route>

        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </div>
  );
};

export default ClientApp;
