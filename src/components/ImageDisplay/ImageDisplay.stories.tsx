import React from 'react';

import { ImageDisplay } from './ImageDisplay';

export default {
  title: 'Components/ImageDisplay',
  component: ImageDisplay,
};

export const Basic = () => (
  <ImageDisplay
    src="https://via.placeholder.com/400x300"
    alt="Sample image"
    caption="This is a basic image with a caption"
  />
);

export const WithoutCaption = () => (
  <ImageDisplay
    src="https://via.placeholder.com/400x300"
    alt="Sample image without caption"
  />
);

export const CustomStyling = () => (
  <ImageDisplay
    src="https://via.placeholder.com/600x400"
    alt="Custom styled image"
    caption="Custom styled image with orange theme"
    className="max-w-md mx-auto"
    imageClassName="border-2 border-orange-400"
    captionClassName="text-orange-400 font-medium"
  />
);

export const ChessBoard = () => (
  <ImageDisplay
    src="https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Chess+Board"
    alt="Chess board position"
    caption="Example chess position after 1.e4 e5 2.Nf3 Nc6"
    className="max-w-sm"
  />
);

export const WithDimensions = () => (
  <ImageDisplay
    src="https://via.placeholder.com/800x600"
    alt="Image with specific dimensions"
    caption="Image with width and height specified"
    width={300}
    height={200}
  />
);