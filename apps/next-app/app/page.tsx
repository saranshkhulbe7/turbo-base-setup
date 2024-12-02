"use client";
import { trpcClient } from "@pal/trpc-client/src/client";
export default function Home() {
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
            password: "saransh",
            role: "user",
          });
        }}
      >
        create
      </button>
    </div>
  );
}
