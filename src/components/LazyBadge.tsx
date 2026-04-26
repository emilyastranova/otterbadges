"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/MaterialUI";
import styles from "./LazyBadge.module.css";

interface LazyBadgeProps {
  badgeId: string;
  title: string;
  imageSize?: number;
  useSmooth?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function LazyBadge({ 
  badgeId, 
  title, 
  imageSize = 0, 
  useSmooth = true, 
  className = "", 
  onClick 
}: LazyBadgeProps) {
  const TWO_MB = 2 * 1024 * 1024;
  const isLarge = imageSize > TWO_MB;
  
  const [userRequested, setUserRequested] = useState(!isLarge);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  const handleLoadRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setUserRequested(true);
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  return (
    <div className={`${styles.container} ${className}`} onClick={onClick}>
      {!userRequested ? (
        <div className={styles.largeWarning} onClick={handleLoadRequest}>
          <Icon>cloud_download</Icon>
          <span className={styles.sizeText}>{formatSize(imageSize)}</span>
          <span className={styles.tapText}>Tap to load</span>
        </div>
      ) : (
        <>
          {!loaded && (
            <div className={styles.placeholder}>
              <div className={styles.spinner}></div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            ref={imgRef}
            src={`/api/badges/${badgeId}/image`} 
            alt={title}
            className={`${styles.image} ${loaded ? styles.loaded : ""}`}
            style={{ imageRendering: useSmooth ? "auto" : "pixelated" }}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
}
