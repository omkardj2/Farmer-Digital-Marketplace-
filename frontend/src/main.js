// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './stylesheets/main.scss';

// Import Bootstrap JS
import * as bootstrap from 'bootstrap';

// Import Leaflet
import L from 'leaflet';

// Make bootstrap and L available globally
window.bootstrap = bootstrap;
window.L = L;

// Import our modules
import './scripts/auth.js';
import './scripts/cart.js';
import './scripts/products.js';
import './scripts/delivery.js';
import './scripts/user.js';
import './scripts/admin.js';
import './scripts/farmer.js';
