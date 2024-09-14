import { Header } from "./components/header";
import TodoContainer from "./feature/todo/container/TodoContainer.tsx";

function App() {
  return (
    <div className="App">
      <Header />
      <TodoContainer />
    </div>
  );
}

export default App;
