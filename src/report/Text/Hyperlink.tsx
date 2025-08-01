import { ReactNode } from "react";

interface HyperlinkProps {
    children: ReactNode;
    link: string;
}

const Hyperlink = ({ children, link }: HyperlinkProps) => (
    <>
        {' '}
        <a href={link} target="_blank" className="underline align-middle text-orange-400 inline-flex items-center justify-center" rel="noreferrer">
            {children}
        </a>
        {' '}
    </>
)

export default Hyperlink;