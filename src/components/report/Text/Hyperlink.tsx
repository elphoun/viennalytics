import { ReactNode } from "react";

interface HyperlinkProps {
    children: ReactNode;
    link: string;
}

const Hyperlink = ({ children, link }: HyperlinkProps) => (
    <>
        {' '}
        <a href={link} target="_blank" className="underline text-orange-400" rel="noreferrer">
            {children}
        </a>
        {' '}
    </>
)

export default Hyperlink;