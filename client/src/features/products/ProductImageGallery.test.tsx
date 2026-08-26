import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImageGallery } from './ProductImageGallery';

describe('ProductImageGallery', () => {
  const mockImages = [
    'https://example.com/suit-front.jpg',
    'https://example.com/suit-back.jpg',
    'https://example.com/suit-detail.jpg',
  ];
  const productName = 'Milano Navy Suit';

  it('renders main image and thumbnails correctly', () => {
    render(<ProductImageGallery images={mockImages} productName={productName} />);

    const mainImg = screen.getByTestId('main-image') as HTMLImageElement;
    expect(mainImg).toBeInTheDocument();
    expect(mainImg.src).toContain('suit-front.jpg');

    const thumb0 = screen.getByTestId('thumbnail-0');
    const thumb1 = screen.getByTestId('thumbnail-1');
    const thumb2 = screen.getByTestId('thumbnail-2');

    expect(thumb0).toBeInTheDocument();
    expect(thumb1).toBeInTheDocument();
    expect(thumb2).toBeInTheDocument();
  });

  it('switches main image when a thumbnail is clicked', () => {
    render(<ProductImageGallery images={mockImages} productName={productName} />);

    const thumb1 = screen.getByTestId('thumbnail-1');
    fireEvent.click(thumb1);

    const mainImg = screen.getByTestId('main-image') as HTMLImageElement;
    expect(mainImg.src).toContain('suit-back.jpg');
  });

  it('displays zoom overlay on hover', () => {
    render(<ProductImageGallery images={mockImages} productName={productName} />);

    const container = screen.getByTestId('main-image-container');

    // Initially zoom overlay is not visible
    expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();

    // Mouse enter triggers zoom
    fireEvent.mouseEnter(container);
    expect(screen.getByTestId('zoom-overlay')).toBeInTheDocument();

    // Mouse leave removes zoom overlay
    fireEvent.mouseLeave(container);
    expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
  });

  it('opens and closes lightbox modal on click', () => {
    render(<ProductImageGallery images={mockImages} productName={productName} />);

    const container = screen.getByTestId('main-image-container');
    fireEvent.click(container);

    const lightbox = screen.getByTestId('lightbox-modal');
    expect(lightbox).toBeInTheDocument();

    const closeBtn = screen.getByTestId('lightbox-close');
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('lightbox-modal')).not.toBeInTheDocument();
  });
});
