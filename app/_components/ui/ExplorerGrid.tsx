import { PropsWithChildren } from "react";

const ExplorerGrid = ({ children }: PropsWithChildren) => (
    <div className="bg-gray-100/10 p-2 rounded-md">
        {children}
    </div>
)

export default ExplorerGrid;