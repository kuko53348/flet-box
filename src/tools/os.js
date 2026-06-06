// tools/os.js

export const os = {
    name: () => {
        const ua = navigator.userAgent;
        
        if (/Windows/i.test(ua)) return 'Windows';
        if (/Mac OS|MacIntel|MacPPC|Mac68K/i.test(ua)) return 'macOS';
        if (/Android/i.test(ua)) return 'Android';
        if (/iOS|iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Linux/i.test(ua)) return 'Linux';
        if (/CrOS/i.test(ua)) return 'ChromeOS';
        
        return 'Unknown';
    },
    
    version: () => {
        const ua = navigator.userAgent;
        const osName = os.name();
        
        if (osName === 'Windows') {
            const match = ua.match(/Windows NT (\d+\.\d+)/);
            if (match) return match[1];
        }
        if (osName === 'macOS') {
            const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
            if (match) return match[1].replace(/_/g, '.');
        }
        if (osName === 'Android') {
            const match = ua.match(/Android (\d+\.\d+)/);
            if (match) return match[1];
        }
        if (osName === 'iOS') {
            const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
            if (match) return match[1].replace(/_/g, '.');
        }
        
        return 'Unknown';
    },
    
    isMobile: () => {
        return os.name() === 'Android' || os.name() === 'iOS';
    },
    
    isDesktop: () => {
        return !os.isMobile();
    }
};

export default os;
