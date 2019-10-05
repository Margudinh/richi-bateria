import { Router } from 'express'
import { Customer } from '../models/Customer';
import { check, validationResult } from 'express-validator';
import { hashSync, compareSync} from 'bcrypt';

const auth = Router();

auth.get('/login', (req, res, next) => {
  res.render('auth/login.njk');
});

auth.get('/logout', (req,res,next) => {
  req.session.destroy( err => {
    if(err){
      console.log(err);
      throw err;
    }
    res.redirect('/');
  });
});

auth.post('/login', async (req, res, next) => {
  const customer = await Customer.findOne({
    where: {
      email: req.body.email
    }
  });

  if(customer && compareSync(req.body.password, customer.password)){
    // login passed
    req.session.isLoggedIn = true;
    req.session.user = {
      firstName: customer.firstName,
      id: customer.id,
      email: customer.email
    }
    
    res.redirect('/');
  }else{
    res.render('auth/login.njk', {logInFailed: true});
  }
});

auth.get('/register', (req, res, next) => {
  res.render('auth/register.njk');
});

auth.post('/register', [
  check('email')
    .not().isEmpty().withMessage('Campo requerido')
    .isEmail().withMessage('Correo incorrecto'), 
  check('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe de ser como minimo de 6 caracteres')
    .custom( (value, {req}) => {
      if(value !== req.body.password2){
        throw new Error('Las contraseñas deben ser iguales');
      }
      return true;
    }),
  check('firstName').not().isEmpty().withMessage('Campo requerido'),
  check('lastName').not().isEmpty().withMessage('Campo requerido')
], async (req, res, next) => {
  const errors = validationResult(req)
  
  if(errors.isEmpty()){
    let customer = new Customer();
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.email = req.body.email;
    customer.password = hashSync(req.body.password, 10);

    customer = await customer.save();
    res.redirect('/');
  }else{
    res.render('auth/register.njk', { errors: errors.mapped(), body: req.body});
  }
});

module.exports = auth;