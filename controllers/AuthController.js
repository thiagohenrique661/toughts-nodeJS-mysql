const User = require('../model/User');
const bcrypt = require('bcryptjs');

module.exports = class AuthController{

    static login(req, res) {
        res.render('auth/login');
    }

    static register(req, res) {
        res.render('auth/register');
    }

    static  async registerPost(req, res) {
        const {name, email, password, confirmpassword} = req.body;

                if(password!= confirmpassword) {
                  req.flash('message', 'different passwords!');
                  res.render('auth/register');
                  return;
        }

        //check if user exists
        const checkIfUserExists = await User.findOne({where: {email: email}});
        if(checkIfUserExists) {
                    req.flash('message', 'User already exists!');
                    res.render('auth/register');
                    return;
        }
        
        //hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = {
            name,
            email,
            password: hashedPassword
        }
        try {
           const createUser = await User.create(user);
            req.session.userid = createUser.id;
            req.flash('message-success', 'Registration successful!');
            req.session.save(() =>{
                res.redirect('/');
            });
            
           
            
        } catch (error) {
            console.log(error);
            
        }
        
    }

    static async logout(req,res){
        req.session.destroy();
        res.redirect('/login');

    }

    static async loginPost(req, res) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email: email}});
        if(!user) {
            req.flash('message', 'User not found!');
            res.render('auth/login');
            return;
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isPasswordValid) {
            req.flash('message', 'Invalid password!');
            res.render('auth/login');
            return;
        }
        req.session.userid = user.id;
        req.flash('message', 'Login successful!');
        req.session.save(() =>{
            res.redirect('/');
        });
      
    }

}   