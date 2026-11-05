import { render } from "@fiberfx/hyperscript";
import { useState } from "@fiberfx/hyperscript/hooks";
import { Card, Button } from "@fiberfx/ui";
import "@fiberfx/ui/styles.css";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Card title="My first Mercury page">
      <p aria-live="polite">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </Card>
  );
}

render(<Counter />, document.getElementById("app")!);
