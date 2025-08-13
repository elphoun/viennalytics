// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactElement, ReactNode } from 'react';

import { cn } from "../utils";

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface ImageDisplayProps {
  src: string;
  alt?: string;
  caption: ReactNode;
  className?: string;
  imageClassName?: string;
  captionClassName?: string;
  width?: string | number;
  height?: string | number;
}

/**
 * ImageDisplay component renders an image with optional caption in a figure element.
 * @param src - The image source URL
 * @param alt - Alt text for accessibility
 * @param caption - Optional caption to display below the image
 * @param className - CSS classes for the figure container
 * @param imageClassName - CSS classes for the image element
 * @param captionClassName - CSS classes for the caption
 * @param width - Image width
 * @param height - Image height
 */
const ImageDisplay = ({
  src,
  alt = "",
  caption,
  className,
  imageClassName,
  captionClassName,
  width,
  height
}: ImageDisplayProps): ReactElement => (
  <figure className={cn("flex flex-col", className)}>
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-lg shadow-lg", imageClassName)}
    />
    {caption && (
      <figcaption className={cn("mt-2 text-sm text-gray-500 text-center italic", captionClassName)}>
        {caption}
      </figcaption>
    )}
  </figure>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default ImageDisplay;