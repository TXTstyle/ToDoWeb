const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


function initialize(passport, getUserByEmail, getUserById) {
    const　authUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        //console.log(user)
        if (user == null) {
            return done(null, false, {message: 'No User Found!'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }else  {
                return done(null, false, {message: "Password incorrect!"})
            }
        } catch (err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email1', passwordField: 'password1'}, authUser))
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        return done(null, await getUserById(id));
    });
}

module.exports = initialize;