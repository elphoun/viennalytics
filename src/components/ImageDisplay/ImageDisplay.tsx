import React from 'react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  captionClassName?: string;
  width?: string | number;
  height?: string | number;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  caption,
  className = "",
  imageClassName = "",
  captionClassName = "",
  width,
  height
}) => {
  return (
    <figure className={`flex flex-col ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg shadow-lg ${imageClassName}`}
      />
      {caption && (
        <figcaption className={`mt-2 text-sm text-gray-500 text-center italic ${captionClassName}`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
};