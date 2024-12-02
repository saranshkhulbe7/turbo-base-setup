import "./App.css";
import { trpcClient } from "@pal/trpc-client/src/client";

function App() {
  const { data: allUsers } = trpcClient.user.all.useQuery();
  const { mutate } = trpcClient.user.create.useMutation();

  if (!allUsers) return <div>Loading...</div>;
  console.log("allUsers", allUsers);

  return (
    <div>
      hello
      <button
        onClick={() => {
          mutate({
            name: "saransh",
            email: "saransh@gmail.com",
            password: "123456",
            role: "user",
          });
        }}
      >
        create
      </button>
    </div>
  );
}

export default App;
