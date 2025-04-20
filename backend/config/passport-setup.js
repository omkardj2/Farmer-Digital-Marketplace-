const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const customerModel = require('../models/customerModel');
const farmerModel = require('../models/farmerModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await customerModel.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            // Create new user if doesn't exist
            user = await customerModel.create({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                googleId: profile.id,
                role: 'customer' // Default role for Google sign-ups
            });
        }

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await customerModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});