module.exports = async function logout(req, res) {
    try {
        res.clearCookie('authToken', {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            path: '/'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};