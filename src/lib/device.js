export const checkIsLowEndDevice = () => {
    if (typeof window === 'undefined') return false;

    const stored = localStorage.getItem('isLowEndDevice');
    if (stored !== null) return stored === 'true';

    let isLowEnd = false;
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            isLowEnd = true;
        } else {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                const softwareRenderers = ['swiftshader', 'llvmpipe', 'software rasterizer'];
                isLowEnd = softwareRenderers.some(str => renderer.includes(str));
            }
        }
    } catch (e) {
        isLowEnd = true;
    }

    localStorage.setItem('isLowEndDevice', isLowEnd);
    return isLowEnd;
};
