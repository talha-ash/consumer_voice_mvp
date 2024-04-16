import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    fetch("/api/todos")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  }, []);
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
};

export default App;
