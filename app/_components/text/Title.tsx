import { memo, ReactElement } from 'react';

interface TitleProps {
    text: string;
    icon?: ReactElement;
}

const Title = memo(({ text, icon }: TitleProps) => (
    <span className="flex flex-row items-center justify-center gap-4 text-2xl font-semibold tracking-tight bg-gradient-to-br from-amber-200 to-white bg-clip-text text-transparent">
        {text} 
        <span className='text-white'>{icon && icon}</span>
    </span>
));

Title.displayName = "Title";

export default Title;