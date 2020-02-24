import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import mailer from '../core/mailer';

import { UserModel } from '../models';
import { createJWToken } from '../utils';

class UserController {
  constructor(io) {
    this.io = io;
  }

  show(req, res){
    const id = req.params.id;
    UserModel.findById(id, (err, user) => {
      if (err) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      res.json(user);
    });
  };

  getMe(req, res){
    const id = req.user && req.user._id;
    UserModel.findById(id, (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      res.json(user);
    });
  };

  findUsers(req, res){
    const query = req.query.query;
    UserModel.find()
      .or([
        { fullname: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ])
      .then((users) => res.json(users))
      .catch((err) => {
        return res.status(404).json({
          status: 'error',
          message: err
        });
      });
  };

  delete(req, res){
    const id = req.params.id;
    UserModel.findOneAndRemove({ _id: id })
      .then(user => {
        if (user) {
          res.json({
            message: `User ${user.fullname} deleted`
          });
        }
      })
      .catch(() => {
        res.json({
          message: `User not found`
        });
      });
  };

  create(req, res){
    const postData = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new UserModel(postData);

    user
      .save()
      .then((obj) => {
        res.json(obj);
        mailer.sendMail(
          {
            from: 'admin@test.com',
            to: postData.email,
            subject: 'Mail confirm React Chat Tutorial',
            html: `For confirm mail, use this link <a href="http://localhost:3000/signup/verify?hash=${obj.confirm_hash}"></a>`
          },
          function(err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          }
        );
      })
      .catch(reason => {
        console.log(reason)
        res.status(500).json({
          status: 'error',
          message: reason
        });
      });
  };

  verify(req, res){
    const hash = req.query.hash;

    if (!hash) {
      return res.status(422).json({ errors: 'Invalid hash' });
    }

    UserModel.findOne({ confirm_hash: hash }, (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          status: 'error',
          message: 'Hash not found'
        });
      }

      user.confirmed = true;
      user.save(err => {
        if (err) {
          return res.status(404).json({
            status: 'error',
            message: err
          });
        }

        res.json({
          status: 'success',
          message: 'Аккаунт успешно подтвержден!'
        });
      });
    });
  };

  login(req, res){
    const postData = {
      email: req.body.email,
      password: req.body.password
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    UserModel.findOne({ email: postData.email }, (err, user) => {
      if (err || !user) {
        return res.status(403).json({
          status: 'error',
          type: 'email',
          message: 'User with such email doesn\'t exist'
        });
      }

      if (bcrypt.compareSync(postData.password, user.password)) {
        const token = createJWToken(user);
        res.json({
          status: 'success',
          token
        });
      } else {
        res.status(403).json({
          status: 'error',
          type: 'user',
          message: 'Incorrect password or email'
        });
      }
    });
  };
}

export default UserController;