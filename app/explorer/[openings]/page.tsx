import { memo } from "react";

const Page = memo(
  async ({ params }: { params: Promise<{ openings: string }> }) => {
    const { openings } = await params;

    return (
      <div className="p-4">
        <h1>Openings: {openings}</h1>
        <pre>{JSON.stringify({ openings }, null, 2)}</pre>
      </div>
    );
  },
);

Page.displayName = "OpeningsPage";

export default Page;
