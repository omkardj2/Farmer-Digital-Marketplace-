const Customer = require('../../models/customerModel');
const Farmer = require('../../models/farmerModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');
const bcrypt = require('bcrypt');

const adminController = {
    async verifyAdmin(req, res) {
        try {
            res.json({ isAdmin: true });
        } catch (error) {
            res.status(500).json({ message: 'Verification failed' });
        }
    },

    async getDashboardStats(req, res) {
        try {
            const [customers, farmers, products, orders] = await Promise.all([
                Customer.countDocuments(),
                Farmer.countDocuments(),
                Product.countDocuments(),
                Order.find()
            ]);

            const totalUsers = customers + farmers;
            const activeOrders = orders.filter(order => 
                ['pending', 'processing'].includes(order.status)).length;
            const totalRevenue = orders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + order.total, 0);

            res.json({
                totalUsers,
                activeOrders,
                totalProducts: products,
                totalRevenue
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch stats' });
        }
    },

    async getUsers(req, res) {
        try {
            const { role } = req.query;
            let users = [];
    
            if (role === 'customer') {
                users = await Customer.find().select('-password');
                users = users.map(user => ({
                    ...user.toObject(),
                    role: 'customer',
                    status: user.status || 'active'  // fallback if status isn't set
                }));
            } else if (role === 'farmer') {
                users = await Farmer.find().select('-password');
                users = users.map(user => ({
                    ...user.toObject(),
                    role: 'farmer',
                    status: user.status || 'active'
                }));
            } else {
                const [customers, farmers] = await Promise.all([
                    Customer.find().select('-password'),
                    Farmer.find().select('-password')
                ]);
    
                const customerUsers = customers.map(user => ({
                    ...user.toObject(),
                    role: 'customer',
                    status: user.status || 'active'
                }));
    
                const farmerUsers = farmers.map(user => ({
                    ...user.toObject(),
                    role: 'farmer',
                    status: user.status || 'active'
                }));
    
                users = [...customerUsers, ...farmerUsers];
            }
    
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch users' });
        }
    },
    

    async createUser(req, res) {
        try {
            const { firstName, lastName, email, password, role } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const UserModel = role === 'farmer' ? Farmer : Customer;
            const user = await UserModel.create({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create user' });
        }
    },

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, status } = req.body;

            const user = await Customer.findByIdAndUpdate(
                id,
                { firstName, lastName, email, status },
                { new: true }
            ) || await Farmer.findByIdAndUpdate(
                id,
                { firstName, lastName, email, status },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update user' });
        }
    },

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            const result = await Customer.findByIdAndDelete(id) || 
                          await Farmer.findByIdAndDelete(id);

            if (!result) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete user' });
        }
    },

    async getProducts(req, res) {
        try {
            const products = await Product.find()
                .populate('farmer', 'firstName lastName');
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    },

    async createProduct(req, res) {
        try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Failed to create product' });
        }
    },

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update product' });
        }
    },

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndDelete(id);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete product' });
        }
    },

    async getOrders(req, res) {
        try {
            const orders = await Order.find()
                .populate('customer', 'firstName lastName')
                .populate('items.product');
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch orders' });
        }
    },

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await Order.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update order status' });
        }
    },

    async getOrderDetails(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id)
                .populate('customer', 'firstName lastName email')
                .populate('items.product');

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch order details' });
        }
    },

    async getPendingApprovals(req, res) {
        try {
            const pendingFarmers = await Farmer.find({ status: 'pending' })
                .select('-password');
            res.json(pendingFarmers);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch pending approvals' });
        }
    },

    async approveFarmer(req, res) {
        try {
            const { id } = req.params;
            const farmer = await Farmer.findByIdAndUpdate(
                id,
                { status: 'approved' },
                { new: true }
            );

            if (!farmer) {
                return res.status(404).json({ message: 'Farmer not found' });
            }

            res.json({ message: 'Farmer approved successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to approve farmer' });
        }
    },

    async rejectFarmer(req, res) {
        try {
            const { id } = req.params;
            const farmer = await Farmer.findByIdAndUpdate(
                id,
                { status: 'rejected' },
                { new: true }
            );

            if (!farmer) {
                return res.status(404).json({ message: 'Farmer not found' });
            }

            res.json({ message: 'Farmer rejected successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to reject farmer' });
        }
    }
};

module.exports = adminController;