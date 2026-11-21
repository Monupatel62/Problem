"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/* --- Shimmer SVG for blur placeholder --- */
const shimmerSvg = (w: number, h: number) =>
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#1a1a2e" offset="20%"/>
        <stop stop-color="#2a2a4e" offset="50%"/>
        <stop stop-color="#1a1a2e" offset="80%"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
  </svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

/* --- Props --- */
type OptimizedImageProps = Omit<ImageProps, "onError"> & {
  fallbackClassName?: string;
};

/**
 * OptimizedImage — wraps next/image with:
 * - Lazy loading by default (priority opt-in)
 * - Blur shimmer placeholder
 * - Error fallback (gradient placeholder)
 * - Automatic responsive sizes when fill mode
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  fallbackClassName,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-pink-500/20 to-purple-500/20 ${fallbackClassName || className || ""}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}
        aria-label={alt}
        role="img"
      />
    );
  }

  const imgWidth = typeof width === "number" ? width : 400;
  const imgHeight = typeof height === "number" ? height : 300;

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmerSvg(imgWidth, imgHeight))}`}
      onError={() => setError(true)}
      sizes={
        sizes ||
        (fill
          ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          : undefined)
      }
      {...props}
    />
  );
}
