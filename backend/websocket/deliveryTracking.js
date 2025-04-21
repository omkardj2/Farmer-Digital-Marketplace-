const WebSocket = require('ws');
const Order = require('../models/orderModel');
const DeliveryPerson = require('../models/deliveryPersonModel');

// Store active WebSocket connections
const connections = new Map();

function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // Extract delivery person ID from the URL query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const deliveryPersonId = url.searchParams.get('deliveryPersonId');
        
        if (!deliveryPersonId) {
            ws.close(1008, 'Delivery person ID is required');
            return;
        }

        // Store the connection
        connections.set(deliveryPersonId, ws);

        // Send initial data
        sendInitialData(ws, deliveryPersonId);

        // Handle messages from the delivery person
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'location_update') {
                    // Update delivery person's location
                    await DeliveryPerson.findByIdAndUpdate(
                        deliveryPersonId,
                        { 
                            currentLocation: {
                                latitude: data.latitude,
                                longitude: data.longitude
                            }
                        }
                    );

                    // Broadcast location update to all connected clients
                    broadcastLocationUpdate(deliveryPersonId, data);
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        });

        // Handle connection close
        ws.on('close', () => {
            connections.delete(deliveryPersonId);
        });
    });
}

async function sendInitialData(ws, deliveryPersonId) {
    try {
        // Get active deliveries for this delivery person
        const deliveries = await Order.find({
            'delivery.deliveryPerson': deliveryPersonId,
            'delivery.status': { $ne: 'delivered' }
        });

        // Send initial data to the client
        ws.send(JSON.stringify({
            type: 'initial_data',
            deliveries
        }));
    } catch (error) {
        console.error('Error sending initial data:', error);
    }
}

function broadcastLocationUpdate(deliveryPersonId, locationData) {
    // Get all connections except the sender
    for (const [id, connection] of connections.entries()) {
        if (id !== deliveryPersonId && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
                type: 'location_update',
                deliveryPersonId,
                ...locationData
            }));
        }
    }
}

// Function to notify clients about delivery status changes
async function notifyDeliveryStatusChange(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) return;

    const deliveryPersonId = order.delivery.deliveryPerson;
    const connection = connections.get(deliveryPersonId);

    if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({
            type: 'status_update',
            orderId,
            status
        }));
    }
}

module.exports = {
    setupWebSocketServer,
    notifyDeliveryStatusChange
}; 