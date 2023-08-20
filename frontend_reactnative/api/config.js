export const defaultConfig = {
API_URL: 'http://192.168.0.171:8000/',
// API_URL: 'http://192.168.0.133:8000/',
      // API_URL: 'http://35.167.203.216:8000/',
};

export const App = {
    config: defaultConfig,
};

window.env = window.env || defaultConfig;
App.config = { ...window.env };

export const API_URL = () => App.config.API_URL;
