import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import GlassSurface from './GlassSurface';

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }
  // Silently handle more images than slots - just use what fits
  if (pool.length > totalSlots) {
    pool = pool.slice(0, totalSlots);
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, srcOriginal: image, alt: '' };
    }
    return {
      src: image.src || '',
      srcOriginal: image.srcOriginal || image.src || '',
      alt: image.alt || ''
    };
  });

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    srcOriginal: usedImages[i].srcOriginal,
    alt: usedImages[i].alt
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = [],
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#060010',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  onInteraction,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const pointerTypeRef = useRef('mouse');
  const tapTargetRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);

  const scrollLockedRef = useRef(false);
  const [zoomLevel, setZoomLevel] = useState(1.2);
  const currentZoomRef = useRef(1.2);
  const targetZoomRef = useRef(1.2);
  const zoomAnimationRef = useRef(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  // Arrow key smooth rotation refs
  const pressedKeysRef = useRef(new Set());
  const keyRotationAnimationRef = useRef(null);
  const isUsingArrowKeysRef = useRef(false);
  const isStoppingRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit * zoomLevel;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();

        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    zoomLevel
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback((vx, vy) => {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);
    const step = () => {
      // Stop immediately if arrow keys are being used
      if (isUsingArrowKeysRef.current) {
        inertiaRAF.current = null;
        return;
      }

      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        inertiaRAF.current = null;
        return;
      }
      if (++frames > maxFrames) {
        inertiaRAF.current = null;
        return;
      }
      const nextX = clamp(
        rotationRef.current.x - vY / 200,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg
      );
      const nextY = rotationRef.current.y + vX / 200; // Allow infinite rotation
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      if (focusedElRef.current) return;
      // Don't allow drag if arrow keys are active
      if (isUsingArrowKeysRef.current) return;
      stopInertia();

      // Notify parent that user has interacted
      if (onInteraction) {
        onInteraction();
      }

      pointerTypeRef.current = event.pointerType || 'mouse';
      if (pointerTypeRef.current === 'touch') event.preventDefault();
      if (pointerTypeRef.current === 'touch') lockScroll();
      draggingRef.current = true;
      cancelTapRef.current = false;
      movedRef.current = false;
      startRotRef.current = { ...rotationRef.current };
      startPosRef.current = { x: event.clientX, y: event.clientY };
      const potential = event.target.closest?.('.item__image');
      tapTargetRef.current = potential || null;
    },
    onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
      if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
      // Stop drag immediately if arrow keys become active
      if (isUsingArrowKeysRef.current) {
        draggingRef.current = false;
        stopInertia();
        return;
      }

      if (pointerTypeRef.current === 'touch') event.preventDefault();

      const dxTotal = event.clientX - startPosRef.current.x;
      const dyTotal = event.clientY - startPosRef.current.y;

      if (!movedRef.current) {
        const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
        if (dist2 > 16) movedRef.current = true;
      }

      const nextX = clamp(
        startRotRef.current.x - dyTotal / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg
      );
      const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

      const cur = rotationRef.current;
      if (cur.x !== nextX || cur.y !== nextY) {
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
      }

      if (last) {
        draggingRef.current = false;
        let isTap = false;

        if (startPosRef.current) {
          const dx = event.clientX - startPosRef.current.x;
          const dy = event.clientY - startPosRef.current.y;
          const dist2 = dx * dx + dy * dy;
          const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 10 : 6;
          if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) {
            isTap = true;
          }
        }

        let [vMagX, vMagY] = velArr;
        const [dirX, dirY] = dirArr;
        let vx = vMagX * dirX;
        let vy = vMagY * dirY;

        if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
          const [mx, my] = movement;
          vx = (mx / dragSensitivity) * 0.02;
          vy = (my / dragSensitivity) * 0.02;
        }

        if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
          startInertia(vx, vy);
        }
        startPosRef.current = null;
        cancelTapRef.current = !isTap;

        if (isTap && tapTargetRef.current && !focusedElRef.current) {
          openItemFromElement(tapTargetRef.current);
        }
        tapTargetRef.current = null;

        if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
        if (movedRef.current) lastDragEndAt.current = performance.now();
        movedRef.current = false;
        if (pointerTypeRef.current === 'touch') unlockScroll();
      }
    },
    onWheel: ({ event }) => {
      // Don't zoom if an image is enlarged
      if (focusedElRef.current) return;

      event.preventDefault();

      // Normalize wheel delta for different browsers/devices
      let delta = -event.deltaY;

      // Handle different wheel modes
      if (event.deltaMode === 1) {
        // Line mode (Firefox)
        delta *= 33;
      } else if (event.deltaMode === 2) {
        // Page mode
        delta *= 100;
      }

      // Adaptive zoom speed: slower when zoomed in, faster when zoomed out
      const baseSpeed = 0.0015;
      const currentZoom = targetZoomRef.current;
      const zoomSpeed = baseSpeed * (0.5 + currentZoom * 0.5);

      const zoomChange = delta * zoomSpeed;

      // Update target zoom
      const newTarget = clamp(currentZoom + zoomChange, 0.5, 5.0);
      targetZoomRef.current = newTarget;

      // Start animation if not already running
      if (!zoomAnimationRef.current) {
        const animateZoom = () => {
          const current = currentZoomRef.current;
          const target = targetZoomRef.current;
          const diff = target - current;

          if (Math.abs(diff) < 0.001) {
            currentZoomRef.current = target;
            setZoomLevel(target);
            zoomAnimationRef.current = null;
            return;
          }

          const easing = 0.15;
          const newZoom = current + diff * easing;
          currentZoomRef.current = newZoom;
          setZoomLevel(newZoom);

          zoomAnimationRef.current = requestAnimationFrame(animateZoom);
        };
        zoomAnimationRef.current = requestAnimationFrame(animateZoom);
      }
    }
  }, {
    target: mainRef,
    eventOptions: { passive: false }
  });

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement;
      const overlay = viewerRef.current?.querySelector('.enlarge');
      if (!overlay) return;

      const refDiv = parent.querySelector('.item__image--reference');

      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', `0deg`);
        parent.style.setProperty('--rot-x-delta', `0deg`);
        el.style.visibility = '';
        el.style.zIndex = 0;
        focusedElRef.current = null;
        setIsImageEnlarged(false);
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();

      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height
      };

      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };

      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge enlarge-closing';
      animatingOverlay.style.cssText = `
        position: absolute;
        left: ${overlayRelativeToRoot.left}px;
        top: ${overlayRelativeToRoot.top}px;
        width: ${overlayRelativeToRoot.width}px;
        height: ${overlayRelativeToRoot.height}px;
        z-index: 9999;
        transition: all ${enlargeTransitionMs}ms ease-out;
        pointer-events: none;
        margin: 0;
        transform: none;
      `;

      const originalImg = overlay.querySelector('img');
      if (originalImg) {
        const img = originalImg.cloneNode();
        img.className = 'enlarge-image';
        img.style.filter = grayscale ? 'grayscale(1)' : 'none';
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);

      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
        animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
        animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
        animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
        animatingOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;

        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';

        parent.style.setProperty('--rot-y-delta', `0deg`);
        parent.style.setProperty('--rot-x-delta', `0deg`);

        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = 0;
          focusedElRef.current = null;
          setIsImageEnlarged(false);
          rootRef.current?.removeAttribute('data-enlarging');

          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';

            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true')
                  document.body.classList.remove('dg-scroll-lock');
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener('transitionend', cleanup, {
        once: true
      });
    };

    scrim.addEventListener('click', close);
    const onKey = e => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();

        // Only navigate if an image is currently enlarged
        const currentFocused = focusedElRef.current;
        if (!currentFocused) return;

        // Find the current image's parent item
        const currentParent = currentFocused.parentElement;
        if (!currentParent) return;

        // Get all sphere items
        const allItems = Array.from(sphereRef.current?.querySelectorAll('.sphere-item') || []);
        const currentIndex = allItems.indexOf(currentParent);

        if (currentIndex === -1) return;

        // Calculate next/previous index with wrapping
        let nextIndex;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % allItems.length;
        } else {
          nextIndex = (currentIndex - 1 + allItems.length) % allItems.length;
        }

        // Get the next item and image element
        const nextItem = allItems[nextIndex];
        const nextImage = nextItem?.querySelector('.item__image:not(.item__image--reference)');

        if (!nextImage) return;

        // Update the enlarged overlay with the new image
        const overlay = viewerRef.current?.querySelector('.enlarge');
        if (overlay) {
          const img = overlay.querySelector('img');
          const rawSrc = nextItem.dataset.srcOriginal || nextItem.dataset.src || '';
          const rawAlt = nextItem.dataset.alt || '';

          if (img) {
            // Fade out, change image, fade in
            overlay.style.opacity = '0.5';
            setTimeout(() => {
              img.src = rawSrc;
              img.alt = rawAlt;
              overlay.style.opacity = '1';
            }, 100);
          }

          // Clean up old reference div
          const oldRefDiv = currentParent.querySelector('.item__image--reference');
          if (oldRefDiv) {
            oldRefDiv.remove();
          }

          // Reset old parent rotation deltas
          currentParent.style.setProperty('--rot-y-delta', '0deg');
          currentParent.style.setProperty('--rot-x-delta', '0deg');

          // Restore previous image visibility properly
          currentFocused.style.visibility = 'visible';
          currentFocused.style.opacity = '1';
          currentFocused.style.zIndex = '';
          currentFocused.removeAttribute('data-focused');

          // Setup new image
          const nextParent = nextImage.parentElement;
          const offsetX = getDataNumber(nextParent, 'offsetX', 0);
          const offsetY = getDataNumber(nextParent, 'offsetY', 0);
          const sizeX = getDataNumber(nextParent, 'sizeX', 2);
          const sizeY = getDataNumber(nextParent, 'sizeY', 2);

          const nextRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
          const parentY = normalizeAngle(nextRot.rotateY);
          const globalY = normalizeAngle(rotationRef.current.y);
          let rotY = -(parentY + globalY) % 360;
          if (rotY < -180) rotY += 360;
          const rotX = -nextRot.rotateX - rotationRef.current.x;

          nextParent.style.setProperty('--rot-y-delta', `${rotY}deg`);
          nextParent.style.setProperty('--rot-x-delta', `${rotX}deg`);

          // Create reference div for new image
          const newRefDiv = document.createElement('div');
          newRefDiv.className = 'item__image item__image--reference opacity-0';
          newRefDiv.style.transform = `rotateX(${-nextRot.rotateX}deg) rotateY(${-nextRot.rotateY}deg)`;
          nextParent.appendChild(newRefDiv);

          // Update position reference
          const tileR = newRefDiv.getBoundingClientRect();
          originalTilePositionRef.current = {
            left: tileR.left,
            top: tileR.top,
            width: tileR.width,
            height: tileR.height
          };

          // Hide new image and set as focused
          nextImage.style.visibility = 'hidden';
          nextImage.style.zIndex = 0;
          nextImage.setAttribute('data-focused', 'true');
          focusedElRef.current = nextImage;
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale, segments]);

  const openItemFromElement = el => {
    if (!el || cancelTapRef.current) return;
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();
    const parent = el.parentElement;
    focusedElRef.current = el;
    setIsImageEnlarged(true);
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);

    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference opacity-0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current.getBoundingClientRect();
    const frameR = frameRef.current.getBoundingClientRect();

    originalTilePositionRef.current = {
      left: tileR.left,
      top: tileR.top,
      width: tileR.width,
      height: tileR.height
    };

    el.style.visibility = 'hidden';
    el.style.zIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `
      position: absolute;
      left: ${frameR.left - mainR.left}px;
      top: ${frameR.top - mainR.top}px;
      width: ${frameR.width}px;
      height: ${frameR.height}px;
      opacity: 0;
      z-index: 30;
      will-change: transform, opacity;
      transform-origin: top left;
      transition: transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;
      border-radius: ${openedImageBorderRadius};
      overflow: hidden;
      box-shadow: none;
      border: none;
      background: transparent;
    `;

    // Use original high-quality version for enlarged view if available
    const rawSrc = parent.dataset.srcOriginal || parent.dataset.src || el.querySelector('img')?.src || '';
    const rawAlt = parent.dataset.alt || el.querySelector('img')?.alt || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    img.alt = rawAlt;
    img.className = 'enlarge-image protect-photo';
    img.oncontextmenu = (e) => e.preventDefault();
    img.style.filter = grayscale ? 'grayscale(1)' : 'none';
    overlay.appendChild(img);
    viewerRef.current.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;
    overlay.style.transition = `transform ${enlargeTransitionMs}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${enlargeTransitionMs}ms ease`;

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    });

    // Disable the resize animation to prevent bouncing effect
    // Photos now simply expand to full size smoothly
  };

  // Zoom in/out button handlers
  const handleZoomIn = useCallback(() => {
    const currentZoom = targetZoomRef.current;
    const newTarget = clamp(currentZoom + 0.3, 0.5, 5.0);
    targetZoomRef.current = newTarget;

    if (!zoomAnimationRef.current) {
      const animateZoom = () => {
        const current = currentZoomRef.current;
        const target = targetZoomRef.current;
        const diff = target - current;

        if (Math.abs(diff) < 0.001) {
          currentZoomRef.current = target;
          setZoomLevel(target);
          zoomAnimationRef.current = null;
          return;
        }

        const easing = 0.15;
        const newZoom = current + diff * easing;
        currentZoomRef.current = newZoom;
        setZoomLevel(newZoom);

        zoomAnimationRef.current = requestAnimationFrame(animateZoom);
      };
      zoomAnimationRef.current = requestAnimationFrame(animateZoom);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const currentZoom = targetZoomRef.current;
    const newTarget = clamp(currentZoom - 0.3, 0.5, 5.0);
    targetZoomRef.current = newTarget;

    if (!zoomAnimationRef.current) {
      const animateZoom = () => {
        const current = currentZoomRef.current;
        const target = targetZoomRef.current;
        const diff = target - current;

        if (Math.abs(diff) < 0.001) {
          currentZoomRef.current = target;
          setZoomLevel(target);
          zoomAnimationRef.current = null;
          return;
        }

        const easing = 0.15;
        const newZoom = current + diff * easing;
        currentZoomRef.current = newZoom;
        setZoomLevel(newZoom);

        zoomAnimationRef.current = requestAnimationFrame(animateZoom);
      };
      zoomAnimationRef.current = requestAnimationFrame(animateZoom);
    }
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('dg-scroll-lock');
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

  // Arrow key navigation for dome rotation when not enlarged
  useEffect(() => {
    const rotationSpeed = 0.8; // degrees per frame for smooth rotation

    const animateKeyRotation = () => {
      // Stop if image is enlarged or no keys pressed or currently stopping
      if (focusedElRef.current || pressedKeysRef.current.size === 0 || isStoppingRef.current) {
        keyRotationAnimationRef.current = null;
        if (!isStoppingRef.current) {
          isUsingArrowKeysRef.current = false;
        }
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      // Calculate rotation deltas based on pressed keys
      if (pressedKeysRef.current.has('ArrowLeft')) {
        deltaY += rotationSpeed;
      }
      if (pressedKeysRef.current.has('ArrowRight')) {
        deltaY -= rotationSpeed;
      }
      if (pressedKeysRef.current.has('ArrowUp')) {
        deltaX -= rotationSpeed;
      }
      if (pressedKeysRef.current.has('ArrowDown')) {
        deltaX += rotationSpeed;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        const newX = clamp(
          rotationRef.current.x + deltaX,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const newY = rotationRef.current.y + deltaY; // Allow infinite rotation

        rotationRef.current = { x: newX, y: newY };
        applyTransform(newX, newY);
      }

      keyRotationAnimationRef.current = requestAnimationFrame(animateKeyRotation);
    };

    const handleKeyDown = (e) => {
      // Only handle arrow keys when no image is enlarged
      if (focusedElRef.current) return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        // Aggressively prevent any default behavior or propagation
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const wasEmpty = pressedKeysRef.current.size === 0;

        // Always add the key to the set
        pressedKeysRef.current.add(e.key);

        // Only trigger stop sequence if this is the first key press
        if (wasEmpty && !isStoppingRef.current) {
          // Notify parent immediately that user has interacted (to hide hints, etc)
          if (onInteraction) {
            onInteraction();
          }

          // Enter stopping phase
          isStoppingRef.current = true;
          isUsingArrowKeysRef.current = true;

          // Force stop any active dragging
          draggingRef.current = false;
          movedRef.current = false;
          startPosRef.current = null;

          // Stop inertia immediately and repeatedly
          const killInertia = () => {
            stopInertia();
            if (inertiaRAF.current) {
              cancelAnimationFrame(inertiaRAF.current);
              inertiaRAF.current = null;
            }
          };

          killInertia();

          // Verify inertia is stopped by checking multiple times
          const verifyAndStart = () => {
            // Check if inertia is truly dead
            if (inertiaRAF.current !== null) {
              // Still running, kill it again and wait
              killInertia();
              setTimeout(verifyAndStart, 16);
              return;
            }

            // Inertia is confirmed dead, wait one more frame to be safe
            setTimeout(() => {
              isStoppingRef.current = false;

              // Final check before starting
              if (pressedKeysRef.current.size > 0 && !keyRotationAnimationRef.current && inertiaRAF.current === null) {
                keyRotationAnimationRef.current = requestAnimationFrame(animateKeyRotation);
              } else {
                // No keys pressed anymore or inertia still active, reset flags
                isUsingArrowKeysRef.current = false;
              }
            }, 16);
          };

          // Start verification process
          setTimeout(verifyAndStart, 16);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        pressedKeysRef.current.delete(e.key);

        // If no more keys pressed, reset the arrow key flag
        if (pressedKeysRef.current.size === 0) {
          isUsingArrowKeysRef.current = false;
        }

        // Animation will stop itself when pressedKeysRef is empty
      }
    };

    const currentPressedKeys = pressedKeysRef.current;

    // Use capture phase to intercept events before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      if (keyRotationAnimationRef.current) {
        cancelAnimationFrame(keyRotationAnimationRef.current);
      }
      currentPressedKeys.clear();
      isUsingArrowKeysRef.current = false;
      isStoppingRef.current = false;
    };
  }, [maxVerticalRotationDeg, stopInertia, onInteraction]);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * {
      box-sizing: border-box;
    }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .enlarge {
      border-radius: var(--enlarge-radius) !important;
      overflow: hidden !important;
      background: transparent !important;
    }
    
    .enlarge img {
      border-radius: var(--enlarge-radius) !important;
      display: block !important;
      max-width: 100% !important;
      max-height: 100% !important;
      width: auto !important;
      height: auto !important;
      margin: auto !important;
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
    }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
      transition: perspective 0.1s ease-out;
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
      transition: transform 0.1s ease-out;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    
    @media (max-aspect-ratio: 1/1) {
      .viewer-frame {
        height: auto !important;
        width: 100% !important;
      }
    }
    
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={{
          ['--segments-x']: segments,
          ['--segments-y']: segments,
          ['--overlay-blur-color']: overlayBlurColor,
          ['--tile-radius']: imageBorderRadius,
          ['--enlarge-radius']: openedImageBorderRadius,
          ['--image-filter']: grayscale ? 'grayscale(1)' : 'none'
        }}>
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none'
          }}>
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-src={it.src}
                  data-src-original={it.srcOriginal || it.src}
                  data-alt={it.alt}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={{
                    ['--offset-x']: it.x,
                    ['--offset-y']: it.y,
                    ['--item-size-x']: it.sizeX,
                    ['--item-size-y']: it.sizeY,
                    top: '-999px',
                    bottom: '-999px',
                    left: '-999px',
                    right: '-999px'
                  }}>
                  <div
                    className="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
                    role="button"
                    tabIndex={0}
                    aria-label={it.alt || 'Open image'}
                    onClick={e => {
                      if (performance.now() - lastDragEndAt.current < 80) return;
                      openItemFromElement(e.currentTarget);
                    }}
                    onTouchEnd={e => {
                      if (performance.now() - lastDragEndAt.current < 80) return;
                      openItemFromElement(e.currentTarget);
                    }}
                    style={{
                      inset: '10px',
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: 'hidden'
                    }}>
                    <img
                      src={it.src}
                      draggable={false}
                      alt={it.alt}
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-cover pointer-events-none protect-photo"
                      style={{
                        backfaceVisibility: 'hidden',
                        filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`
            }} />

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              backdropFilter: 'blur(3px)'
            }} />

          <div
            className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
            }} />
          <div
            className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
            }} />

          <div
            ref={viewerRef}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ padding: 'var(--viewer-pad)' }}>
            <div
              ref={scrimRef}
              className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(3px)'
              }} />
            <div
              ref={frameRef}
              className="viewer-frame h-full aspect-square flex"
              style={{ borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})` }} />
          </div>

          {/* Zoom Controls */}
          {!isImageEnlarged && (
            <div className="fixed right-4 sm:right-6 z-30 flex flex-col gap-2" style={{
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <GlassSurface
                width={44}
                height={44}
                borderRadius={50}
                backgroundOpacity={0.05}
                saturation={1.8}
                borderWidth={0}
                brightness={80}
                opacity={0.7}
                blur={16}
                displace={1.5}
                distortionScale={-200}
                redOffset={0}
                greenOffset={15}
                blueOffset={30}
                style={{
                  overflow: 'visible'
                }}
              >
                <button
                  onClick={handleZoomIn}
                  className="w-full h-full rounded-full flex items-center justify-center text-white hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] active:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Zoom in"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="10" y1="5" x2="10" y2="15" />
                    <line x1="5" y1="10" x2="15" y2="10" />
                  </svg>
                </button>
              </GlassSurface>

              <GlassSurface
                width={44}
                height={44}
                borderRadius={50}
                backgroundOpacity={0.05}
                saturation={1.8}
                borderWidth={0}
                brightness={80}
                opacity={0.7}
                blur={16}
                displace={1.5}
                distortionScale={-200}
                redOffset={0}
                greenOffset={15}
                blueOffset={30}
                style={{
                  overflow: 'visible'
                }}
              >
                <button
                  onClick={handleZoomOut}
                  className="w-full h-full rounded-full flex items-center justify-center text-white hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] active:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Zoom out"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="10" x2="15" y2="10" />
                  </svg>
                </button>
              </GlassSurface>
            </div>
          )}

          {/* Navigation Arrows for Enlarged Images */}
          {isImageEnlarged && (
            <>
              {/* Left Arrow */}
              <div className="fixed left-4 sm:left-6 z-40" style={{
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                <GlassSurface
                  width={56}
                  height={56}
                  borderRadius={50}
                  backgroundOpacity={0.15}
                  saturation={1.8}
                  borderWidth={0.1}
                  brightness={60}
                  opacity={0.9}
                  blur={20}
                  displace={1.5}
                  distortionScale={-200}
                  redOffset={0}
                  greenOffset={15}
                  blueOffset={30}
                >
                  <button
                    onClick={() => {
                      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
                      window.dispatchEvent(event);
                    }}
                    className="w-full h-full rounded-full flex items-center justify-center text-white/90 hover:text-white active:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Previous image"
                    style={{
                      minWidth: '56px',
                      minHeight: '56px',
                      background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                </GlassSurface>
              </div>

              {/* Right Arrow */}
              <div className="fixed right-4 sm:right-6 z-40" style={{
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                <GlassSurface
                  width={56}
                  height={56}
                  borderRadius={50}
                  backgroundOpacity={0.15}
                  saturation={1.8}
                  borderWidth={0.1}
                  brightness={60}
                  opacity={0.9}
                  blur={20}
                  displace={1.5}
                  distortionScale={-200}
                  redOffset={0}
                  greenOffset={15}
                  blueOffset={30}
                >
                  <button
                    onClick={() => {
                      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
                      window.dispatchEvent(event);
                    }}
                    className="w-full h-full rounded-full flex items-center justify-center text-white/90 hover:text-white active:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Next image"
                    style={{
                      minWidth: '56px',
                      minHeight: '56px',
                      background: 'radial-gradient(ellipse 70% 50% at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0) 60%)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </GlassSurface>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}
