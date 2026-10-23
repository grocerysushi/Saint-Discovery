"use client";
/* eslint-disable @next/next/no-img-element -- Responsive files are prepared locally, without the metered runtime optimizer. */
import { useState, type ImgHTMLAttributes } from 'react';
import { preparedImage } from '@/lib/static-images';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string; alt: string; fill?: boolean; priority?: boolean;
};
export default function StaticImage({ src, alt, fill, priority, style, onError, ...props }: Props) {
  const [failedVariant, setFailedVariant] = useState('');
  const prepared = failedVariant === src ? undefined : preparedImage(src);
  const variants = prepared?.variants;
  const fallback = variants?.find(([width]) => width >= 768) ?? variants?.at(-1);
  return <img {...props} src={fallback?.[1] ?? src} alt={alt}
    srcSet={variants?.map(([width, url]) => `${url} ${width}w`).join(', ')}
    width={prepared?.width ?? props.width} height={prepared?.height ?? props.height}
    loading={props.loading ?? (priority ? 'eager' : 'lazy')}
    fetchPriority={props.fetchPriority ?? (priority ? 'high' : 'auto')} decoding="async"
    style={{ ...(fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0 } as const : {}), ...style }}
    onError={event => { if (prepared) setFailedVariant(src); else onError?.(event); }} />;
}
