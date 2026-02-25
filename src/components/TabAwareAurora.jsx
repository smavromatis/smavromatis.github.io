import React, { useState, useEffect, useRef } from 'react';
import Aurora from '@/components/Aurora';

export default function TabAwareAurora({ activeTab, colorStops, isLowEndDevice }) {
    const [auroraAmplitude, setAuroraAmplitude] = useState(1.0);
    const [auroraBlend, setAuroraBlend] = useState(0.5);
    const [auroraVerticalOffset, setAuroraVerticalOffset] = useState(0.0);
    const animationRef = useRef(null);
    const currentValuesRef = useRef({ amplitude: 1.0, blend: 0.5, verticalOffset: 0.0 });

    useEffect(() => {
        const targetAmplitude = (activeTab === 'archive' || activeTab === 'about') ? 0.3 : 1.0;
        const targetBlend = (activeTab === 'archive' || activeTab === 'about') ? 0.04 : 0.5;
        const targetVerticalOffset = (activeTab === 'archive' || activeTab === 'about') ? -0.6 : 0.0;

        if (isLowEndDevice) {
            setAuroraAmplitude(targetAmplitude);
            setAuroraBlend(targetBlend);
            setAuroraVerticalOffset(targetVerticalOffset);
            return;
        }

        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const startAmplitude = currentValuesRef.current.amplitude;
        const startBlend = currentValuesRef.current.blend;
        const startVerticalOffset = currentValuesRef.current.verticalOffset;
        const duration = 800; // ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const newAmplitude = startAmplitude + (targetAmplitude - startAmplitude) * eased;
            const newBlend = startBlend + (targetBlend - startBlend) * eased;
            const newVerticalOffset = startVerticalOffset + (targetVerticalOffset - startVerticalOffset) * eased;

            currentValuesRef.current = { amplitude: newAmplitude, blend: newBlend, verticalOffset: newVerticalOffset };
            setAuroraAmplitude(newAmplitude);
            setAuroraBlend(newBlend);
            setAuroraVerticalOffset(newVerticalOffset);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [activeTab, isLowEndDevice]);

    return (
        <Aurora
            amplitude={auroraAmplitude}
            blend={auroraBlend}
            verticalOffset={auroraVerticalOffset}
            colorStops={colorStops}
            isStatic={isLowEndDevice}
        />
    );
}
