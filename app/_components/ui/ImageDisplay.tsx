import { memo, ReactNode } from 'react';
import Image from 'next/image';

import { cn } from '@/app/utils';

interface ImageDisplayProps {
    src: string;
    alt?: string;
    caption?: ReactNode;
    className?: string;
    imageClassName?: string;
    captionClassName?: string;
    width: number;
    height: number;
}

const ImageDisplay = memo(({
    src,
    alt = "",
    caption,
    className,
    imageClassName,
    captionClassName,
    width,
    height
}: ImageDisplayProps) => (
    <figure className={cn("flex flex-col items-center", className)}>
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn("rounded-lg shadow-lg", imageClassName)}
        />
        {caption && (
            <figcaption className={cn("mt-3 text-base text-gray-300 text-center font-medium", captionClassName)}>
                {caption}
            </figcaption>
        )}
    </figure>
));

ImageDisplay.displayName = "ImageDisplay";

export default ImageDisplay;