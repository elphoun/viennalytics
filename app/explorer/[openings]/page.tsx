import { memo } from "react";

const Page = memo(({ params }: { params: { openings: string } }) => {
    return (
        <div className="p-4">
            <h1>Openings: {params.openings}</h1>
            <pre>{JSON.stringify(params, null, 2)}</pre>
        </div>
    );
});

Page.displayName = "OpeningsPage";

export default Page;
