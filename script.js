// Constants and Configuration
const CONFIG = {
    MAP: {
        DEFAULT_VIEW: [6.817545, 80.045003],
        DEFAULT_ZOOM: 13,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '© OpenStreetMap contributors'
    },
    FIREBASE: {
        apiKey: "AIzaSyD0VXlmzOn5QGseZB2KvLJhytuQXoc",
        authDomain: "envoclean-2024.firebaseapp.com",
        databaseURL: "https://envoclean-2024-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "envoclean-2024",
        storageBucket: "envoclean-2024.firebasestorage.app",
        messagingSenderId: "968166026934",
        appId: "1:968166026934:web:4b87ae19574bc4b5b40017"
    },
    SENSORS: {
        UNITS: {
            humidity: ' %',
            temperature: ' °C',
            pm2_5: ' µg/m³',
            pm10: ' µg/m³',
            o3: ' ppm',
            co: ' ppm',
            no2: ' ppm',
            default: ' ppm'
        }
    },
    HISTORY: {
        DAYS_TO_KEEP: 7,
        READINGS_PER_DAY: 24 
    }
};


class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.observers = new Set();
        this.initializeTheme();
    }

    subscribe(callback) {
        this.observers.add(callback);
    }

    unsubscribe(callback) {
        this.observers.delete(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.theme));
    }

    initializeTheme() {
      
        this.applyTheme();
        
       
        if (!document.querySelector('.theme-toggle')) {
            this.createThemeToggle();
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.notifyObservers();
    }

    createThemeToggle() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        
       
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
        }
        
        this.updateToggleButton(button);
        button.addEventListener('click', () => this.toggleTheme());
        
        // Insert button after the navigation if it exists, otherwise append to body
        const nav = document.querySelector('nav') || document.body.firstChild;
        nav.parentNode.insertBefore(button, nav.nextSibling);
    }

    updateToggleButton(button) {
        button.innerHTML = this.theme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
        this.updateToggleButton(document.querySelector('.theme-toggle'));
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});

// Simplified AQI Calculator focused on PM2.5
class AQICalculator {
    static BREAKPOINTS = {
        PM2_5: [
            { min: 0, max: 12.0, aqi_min: 0, aqi_max: 50 },
            { min: 12.1, max: 35.4, aqi_min: 51, aqi_max: 100 },
            { min: 35.5, max: 55.4, aqi_min: 101, aqi_max: 150 },
            { min: 55.5, max: 150.4, aqi_min: 151, aqi_max: 200 },
            { min: 150.5, max: 250.4, aqi_min: 201, aqi_max: 300 },
            { min: 250.5, max: 500.4, aqi_min: 301, aqi_max: 500 }
        ],
        PM10: [
            { min: 0, max: 54, aqi_min: 0, aqi_max: 50 },
            { min: 55, max: 154, aqi_min: 51, aqi_max: 100 },
            { min: 155, max: 254, aqi_min: 101, aqi_max: 150 },
            { min: 255, max: 354, aqi_min: 151, aqi_max: 200 },
            { min: 355, max: 424, aqi_min: 201, aqi_max: 300 },
            { min: 425, max: 504, aqi_min: 301, aqi_max: 400 },
            { min: 505, max: 604, aqi_min: 401, aqi_max: 500 }
        ],
        O3: [
            { min: 0, max: 54, aqi_min: 0, aqi_max: 50 },
            { min: 55, max: 70, aqi_min: 51, aqi_max: 100 },
            { min: 71, max: 85, aqi_min: 101, aqi_max: 150 },
            { min: 86, max: 105, aqi_min: 151, aqi_max: 200 },
            { min: 106, max: 200, aqi_min: 201, aqi_max: 300 },
            { min: 201, max: 504, aqi_min: 301, aqi_max: 500 }
        ],
        CO: [
            { min: 0, max: 4.4, aqi_min: 0, aqi_max: 50 },
            { min: 4.5, max: 9.4, aqi_min: 51, aqi_max: 100 },
            { min: 9.5, max: 12.4, aqi_min: 101, aqi_max: 150 },
            { min: 12.5, max: 15.4, aqi_min: 151, aqi_max: 200 },
            { min: 15.5, max: 30.4, aqi_min: 201, aqi_max: 300 },
            { min: 30.5, max: 50.4, aqi_min: 301, aqi_max: 500 }
        ],
        NO2: [
            { min: 0, max: 53, aqi_min: 0, aqi_max: 50 },
            { min: 54, max: 100, aqi_min: 51, aqi_max: 100 },
            { min: 101, max: 360, aqi_min: 101, aqi_max: 150 },
            { min: 361, max: 649, aqi_min: 151, aqi_max: 200 },
            { min: 650, max: 1249, aqi_min: 201, aqi_max: 300 },
            { min: 1250, max: 2049, aqi_min: 301, aqi_max: 500 }
        ]
    };

    static #aqiCache = new Map();

    static calculateSubIndex(value, pollutant) {
        if (value === null || value === undefined) return null;
        
        const cacheKey = `${pollutant}_${parseFloat(value).toFixed(1)}`;
        if (this.#aqiCache.has(cacheKey)) {
            return this.#aqiCache.get(cacheKey);
        }

        const breakpoints = this.BREAKPOINTS[pollutant];
        if (!breakpoints) return null;

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return null;

        let result = null;
        
        if (numValue > breakpoints[breakpoints.length - 1].max) {
            result = 500;
        } else {
            result = breakpoints.reduce((aqi, bp) => {
                if (numValue >= bp.min && numValue <= bp.max) {
                    return Math.round(
                        ((bp.aqi_max - bp.aqi_min) / (bp.max - bp.min)) * 
                        (numValue - bp.min) + bp.aqi_min
                    );
                }
                return aqi;
            }, null);
        }

        if (result !== null) {
            this.#aqiCache.set(cacheKey, result);
        }
        return result;
    }

    static calculateAQI(sensorData) {
        const subIndices = {
            pm2_5: this.calculateSubIndex(sensorData.pm2_5, 'PM2_5'),
            pm10: this.calculateSubIndex(sensorData.pm10, 'PM10'),
            o3: this.calculateSubIndex(sensorData.o3, 'O3'),
            co: this.calculateSubIndex(sensorData.co, 'CO'),
            no2: this.calculateSubIndex(sensorData.no2, 'NO2')
        };

        const dominantPollutant = this.getDominantPollutant(subIndices);
        const validIndices = Object.values(subIndices).filter(value => value !== null);
        const overallAQI = validIndices.length > 0 ? Math.max(...validIndices) : 0;
        const envFactors = this.checkEnvironmentalFactors(sensorData);

        return {
            overallAQI,
            subIndices,
            dominantPollutant,
            envFactors,
            ...this.getAQIStatus(overallAQI)
        };
    }

    static getDominantPollutant(subIndices) {
        let maxAQI = -1;
        let dominant = null;
        
        Object.entries(subIndices).forEach(([pollutant, aqi]) => {
            if (aqi !== null && aqi > maxAQI) {
                maxAQI = aqi;
                dominant = pollutant;
            }
        });
        
        return dominant;
    }

    static checkEnvironmentalFactors(data) {
        return {
            temperature: {
                value: data.temperature,
                status: this.getTemperatureStatus(data.temperature)
            },
            humidity: {
                value: data.humidity,
                status: this.getHumidityStatus(data.humidity)
            }
        };
    }

    static getTemperatureStatus(temp) {
        if (temp === null || temp === undefined) return 'Unknown';
        if (temp < 0) return 'Very Cold';
        if (temp < 10) return 'Cold';
        if (temp < 20) return 'Cool';
        if (temp <= 25) return 'Normal';
        if (temp <= 30) return 'Warm';
        return 'Hot';
    }

    static getHumidityStatus(humidity) {
        if (humidity === null || humidity === undefined) return 'Unknown';
        if (humidity < 30) return 'Too Dry';
        if (humidity <= 60) return 'Normal';
        return 'Too Humid';
    }

    static getAQIStatus(aqi) {
        const statusMap = new Map([
            [50, {
                status: 'Good',
                color: '#00e400',
                description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
                advice: 'Perfect for outdoor activities'
            }],
            [100, {
                status: 'Moderate',
                color: '#ffff00',
                description: 'Air quality is acceptable. However, there may be a risk for some people.',
                advice: 'Sensitive individuals should limit prolonged outdoor exposure'
            }],
            [150, {
                status: 'Unhealthy for Sensitive Groups',
                color: '#ff7e00',
                description: 'Members of sensitive groups may experience health effects.',
                advice: 'Sensitive groups should reduce outdoor activities'
            }],
            [200, {
                status: 'Unhealthy',
                color: '#ff0000',
                description: 'Everyone may begin to experience health effects.',
                advice: 'Everyone should reduce prolonged outdoor activities'
            }],
            [300, {
                status: 'Very Unhealthy',
                color: '#8f3f97',
                description: 'Health alert: everyone may experience serious health effects.',
                advice: 'Everyone should avoid outdoor activities'
            }],
            [Infinity, {
                status: 'Hazardous',
                color: '#7e0023',
                description: 'Health warnings of emergency conditions.',
                advice: 'Everyone should avoid all outdoor activities'
            }]
        ]);

        for (const [threshold, status] of statusMap) {
            if (aqi <= threshold) return status;
        }
    }
}

// Main Application Class
class AirQualityMonitor {
    constructor() {
        this.database = null;
        this.map = null;
        this.marker = null;
        this.themeManager = null;

        this.initialize()
            .catch(error => {
                console.error('Failed to initialize AirQualityMonitor:', error);
                this.handleInitializationError(error);
            });
    }

    // Initialization Methods
    async initialize() {
        this.initializeFirebase();
        await this.initializeMap();
        this.setupSensorListeners();
        this.initializeLocationServices();
        this.initializeThemeManager();
    }

    initializeFirebase() {
        if (!firebase.apps.length) {
            firebase.initializeApp(CONFIG.FIREBASE);
        }
        this.database = firebase.database();
    }

    async initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        this.map = L.map('map').setView(CONFIG.MAP.DEFAULT_VIEW, CONFIG.MAP.DEFAULT_ZOOM);
        L.tileLayer(CONFIG.MAP.TILE_LAYER, {
            attribution: CONFIG.MAP.ATTRIBUTION
        }).addTo(this.map);
        this.marker = L.marker(CONFIG.MAP.DEFAULT_VIEW).addTo(this.map)
                        .bindPopup('EnvoClean <br> PD: 01')
                        .openPopup();
    }

    // Sensor Data Management
    setupSensorListeners() {
        Object.entries(CONFIG.SENSORS.UNITS).forEach(([sensorKey, unit]) => {
            const ref = this.database.ref(`sensors/${sensorKey}`);
            ref.on('value', 
                snapshot => this.updateSensorValue(sensorKey, snapshot.val(), unit),
                error => console.error(`Error reading ${sensorKey} sensor:`, error)
            );
        });
    }

    updateSensorValue(sensorKey, value, unit) {
        const element = document.getElementById(sensorKey);
        if (!element) return;

        element.innerHTML = `${value}${unit}`;
        this.updateAQI();
    }

    getSensorValue(sensorKey) {
        const element = document.getElementById(sensorKey);
        if (!element) return null;
        
        const value = parseFloat(element.textContent);
        return isNaN(value) ? null : value;
    }

    async storeAQIReading(aqiValue) {
        const now = new Date();
        const timestamp = now.getTime();
        const dayKey = now.toISOString().split('T')[0];
        const hourKey = now.getHours();

        try {
            // Store the new reading
            await this.database.ref(`aqi_history/${dayKey}/${hourKey}`).set({
                timestamp,
                value: aqiValue
            });

            // Clean up old data
            this.cleanupOldData();
        } catch (error) {
            console.error('Error storing AQI reading:', error);
        }
    }

    async cleanupOldData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CONFIG.HISTORY.DAYS_TO_KEEP);
        
        const historyRef = this.database.ref('aqi_history');
        const snapshot = await historyRef.once('value');
        const data = snapshot.val() || {};

        Object.keys(data).forEach(date => {
            if (new Date(date) < cutoffDate) {
                historyRef.child(date).remove();
            }
        });
    }

    async fetchHistoricalData() {
        try {
            const historyRef = this.database.ref('aqi_history');
            const snapshot = await historyRef.once('value');
            const rawData = snapshot.val() || {};

            const processedData = Object.entries(rawData)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .map(([date, readings]) => {
                    const dailyReadings = Object.values(readings);
                    const avgAQI = dailyReadings.reduce((sum, reading) => sum + reading.value, 0) / dailyReadings.length;
                    return {
                        date: new Date(date).toLocaleDateString(),
                        aqi: Math.round(avgAQI)
                    };
                });

            this.updateHistoryChart(processedData);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }

    updateHistoryChart(data) {
        const chartContainer = document.getElementById('aqi-history-chart');
        if (!chartContainer) return;

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const chartWidth = chartContainer.clientWidth - margin.left - margin.right;
        const chartHeight = 200 - margin.top - margin.bottom;

        // Create points for the line
        const points = data.map((d, i) => ({
            x: (i * chartWidth) / (data.length - 1),
            y: chartHeight - ((d.aqi / Math.max(...data.map(d => d.aqi))) * chartHeight),
            value: d.aqi,
            date: (() => {
                const date = new Date(d.date); // Convert to Date object
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits for month
                const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits for day
                return `${month}-${day}`; // Format as MM-DD
            })()
        }));

        // Create the line path
        const linePath = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        // Create gradient for the line
        const gradientId = 'line-gradient-' + Date.now();

        const svg = `
            <svg width="100%" height="${chartHeight + margin.top + margin.bottom}" 
                 viewBox="0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}">
                <defs>
                    <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#00e400" stop-opacity="0.2"/>
                        <stop offset="50%" stop-color="#ff7e00" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="#ff0000" stop-opacity="0.2"/>
                    </linearGradient>
                </defs>
                
                <g transform="translate(${margin.left}, ${margin.top})">
                    <!-- Grid lines -->
                    ${Array.from({ length: 5 }, (_, i) => {
                        const y = (i * chartHeight) / 4;
                        return `
                            <line 
                                x1="0" 
                                y1="${y}" 
                                x2="${chartWidth}" 
                                y2="${y}" 
                                stroke="#ccc" 
                                stroke-dasharray="2,2"
                            />
                        `;
                    }).join('')}
                    
                    <!-- Area under the line -->
                    <path
                        d="${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z"
                        fill="url(#${gradientId})"
                    />
                    
                    <!-- The line itself -->
                    <path
                        d="${linePath}"
                        fill="none"
                        stroke="#2196F3"
                        stroke-width="2"
                    />
                    
                    <!-- Data points -->
                    ${points.map(p => `
                        <g class="data-point" transform="translate(${p.x}, ${p.y})">
                            <circle 
                                r="4" 
                                fill="#2196F3"
                                stroke="white"
                                stroke-width="2"
                            />
                            <text
                                x="0"
                                y="-10"
                                text-anchor="middle"
                                class="value-label"
                            >${p.value}</text>
                        </g>
                    `).join('')}
                <!-- remove date cause not working --> 
                </g>
            </svg>
        `;

        chartContainer.innerHTML = svg;
    }

    getAQIColor(aqi) {
        const status = AQICalculator.getAQIStatus(aqi);
        return status.color;
    }

    updateAQI() {
        const sensorData = {
            pm2_5: this.getSensorValue('pm2_5'),
            pm10: this.getSensorValue('pm10'),
            o3: this.getSensorValue('o3'),
            co: this.getSensorValue('co'),
            no2: this.getSensorValue('no2'),
            temperature: this.getSensorValue('temperature'),
            humidity: this.getSensorValue('humidity')
        };

        const aqiResult = AQICalculator.calculateAQI(sensorData);
        
        this.updateUIElements({
            '.meter-circle .value': aqiResult.overallAQI.toString(),
            '.aqi-status': {
                text: aqiResult.status,
                style: { color: aqiResult.color }
            },
            '.aqi-description': aqiResult.description,
            '.aqi-advice': aqiResult.advice,
            '.dominant-pollutant': `Main Pollutant: ${this.formatPollutantName(aqiResult.dominantPollutant)}`,
            '#last-updated': `Last Updated: ${new Date().toLocaleTimeString()}`
        });

        Object.entries(aqiResult.subIndices).forEach(([pollutant, value]) => {
            const element = document.getElementById(`${pollutant}-aqi`);
            if (element) {
                element.textContent = value !== null ? value.toString() : 'N/A';
                element.style.color = value !== null ? AQICalculator.getAQIStatus(value).color : '#999';
            }
        });

        Object.entries(aqiResult.envFactors).forEach(([factor, data]) => {
            const statusElement = document.getElementById(`${factor}-status`);
            if (statusElement) {
                statusElement.textContent = data.status;
                statusElement.className = `status-${data.status.toLowerCase().replace(/\s+/g, '-')}`;
            }
        });

        // After calculating AQI, store it
        this.storeAQIReading(aqiResult.overallAQI);
        
        // Update historical chart
        this.fetchHistoricalData();
    
    }

    updateSubIndices(subIndices) {
        Object.entries(subIndices).forEach(([pollutant, value]) => {
            const element = document.getElementById(`${pollutant}-aqi`);
            if (element) {
                element.textContent = value !== null ? value.toString() : 'N/A';
                element.style.color = value !== null ? 
                    AQICalculator.getAQIStatus(value).color : '#999';
            }
        });
    }

    updateEnvironmentalFactors(envFactors) {
        Object.entries(envFactors).forEach(([factor, data]) => {
            const statusElement = document.getElementById(`${factor}-status`);
            if (statusElement) {
                statusElement.textContent = data.status;
                statusElement.className = `status-${data.status.toLowerCase().replace(/\s+/g, '-')}`;
            }
        });
    }

    updateUIElements(updates) {
        Object.entries(updates).forEach(([selector, update]) => {
            const element = document.querySelector(selector);
            if (!element) return;

            if (typeof update === 'string') {
                element.textContent = update;
            } else {
                element.textContent = update.text;
                Object.assign(element.style, update.style);
            }
        });
    }

    // Location Services
    initializeLocationServices() {
        if (!navigator.geolocation) {
            this.handleLocationError(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => this.handleLocationSuccess(position),
            error => this.handleLocationError(error)
        );
    }

    async handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        
        if (this.map && this.marker) {
            this.map.setView([latitude, longitude], CONFIG.MAP.DEFAULT_ZOOM);
            this.marker.setLatLng([latitude, longitude]);
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            this.updateLocationName(data.display_name.split(',').slice(0, 2).join(','));
        } catch (error) {
            this.handleLocationError(error);
        }
    }

    handleLocationError(error) {
        console.error('Location error:', error);
        this.updateLocationName('Location not available');
    }

    updateLocationName(name) {
        const element = document.getElementById('location-name');
        if (element) {
            element.textContent = name;
        }
    }

    // Theme Management
    initializeThemeManager() {
        this.themeManager = new ThemeManager();
        this.themeManager.subscribe(theme => {
            if (this.map) {
                this.updateMapTheme(theme);
            }
        });
    }

    updateMapTheme(theme) {
        
    }

    // Utility Methods
    formatPollutantName(pollutant) {
        if (!pollutant) return 'None';
        
        const names = {
            'pm2_5': 'PM2.5',
            'pm10': 'PM10',
            'o3': 'Ozone',
            'co': 'Carbon Monoxide',
            'no2': 'Nitrogen Dioxide'
        };
        
        return names[pollutant] || pollutant;
    }

    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Failed to initialize air quality monitoring. Please refresh the page or contact support.';
        document.body.appendChild(errorMessage);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard')) {
        new AirQualityMonitor();
    }
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AirQualityMonitor,
        AQICalculator,
        ThemeManager,
        CONFIG
    };
}
