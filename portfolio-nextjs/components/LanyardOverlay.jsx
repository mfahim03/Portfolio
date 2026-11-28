'use client';

import { useEffect, useState } from 'react';
import Lanyard from './Lanyard';

export default function LanyardOverlay(props) {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    let active = true;
    const portrait = new Image();
    const updateViewport = () => setMobile(window.innerWidth < 901);
    portrait.onload = () => active && setReady(true);
    portrait.onerror = () => active && setReady(false);
    portrait.src = props.frontImage;
    if (portrait.complete && portrait.naturalWidth > 0) setReady(true);
    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      active = false;
      window.removeEventListener('resize', updateViewport);
    };
  }, [props.frontImage]);

  if (!ready) return null;

  return (
    <div className="hero-lanyard-slot" role="img" aria-label="Muhammad Fahim profile photo">
      <Lanyard
        {...props}
        anchor={mobile ? 'right' : 'between'}
        size={mobile ? 0.19 : props.size}
        strapLength={mobile ? 0.1 : props.strapLength}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
