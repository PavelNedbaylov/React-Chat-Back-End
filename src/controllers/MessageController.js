import express from 'express';
import socket from 'socket.io';

import { MessageModel, DialogModel } from '../models';

class MessageController {
  constructor(io) {
    this.io = io;
  }

  updateReadedStatus(res, userId, dialogId){
    MessageModel.updateMany(
      { dialog: dialogId, user: { $ne: userId } },
      { $set: { readed: true } },
      (err) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: err,
          });
        }
        this.io.emit('SERVER:MESSAGES_READED', {
          userId,
          dialogId,
        });
      },
    );
  };

  index(req, res){
    const dialogId = req.query.dialog;
    const userId = req.user._id;

    this.updateReadedStatus(res, userId, dialogId);

    MessageModel.find({ dialog: dialogId })
      .populate(['dialog', 'user', 'attachments'])
      .exec(function(err, messages) {
        if (err) {
          return res.status(404).json({
            status: 'error',
            message: 'Messages not found',
          });
        }
        return res.json(messages);
      });
  };

  create(req, res){
    const userId = req.user._id;

    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      user: userId,
    };

    const message = new MessageModel(postData);

    this.updateReadedStatus(res, userId, req.body.dialog_id);

    message
      .save()
      .then((obj) => {
        obj.populate(['dialog', 'user', 'attachments'], (err, message) => {
          if (err) {
            return res.status(500).json({
              status: 'error',
              message: err,
            });
          }

          DialogModel.findOneAndUpdate(
            { _id: postData.dialog },
            { lastMessage: message._id },
            { upsert: true },
            function(err) {
              if (err) {
                return res.status(500).json({
                  status: 'error',
                  message: err,
                });
              }
            },
          );

          res.json(message);

          this.io.emit('SERVER:NEW_MESSAGE', message);
        });
      })
      .catch(reason => {
        res.json(reason);
      });
  };

  delete(req, res){
    const id = req.query.id;
    const userId = req.user._id;

    MessageModel.findById(id, (err, message) => {
      if (err || !message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found',
        });
      }

      if (message.user.toString() === userId) {
        const dialogId = message.dialog;
        message.remove();

        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { created_at: -1 } },
          (err, lastMessage) => {
            if (err) {
              res.status(500).json({
                status: 'error',
                message: err,
              });
            }

            DialogModel.findById(dialogId, (err, dialog) => {
              if (err) {
                res.status(500).json({
                  status: 'error',
                  message: err,
                });
              }

              dialog.lastMessage = lastMessage;
              dialog.save();
            });
          },
        );

        return res.json({
          status: 'success',
          message: 'Message deleted',
        });
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Not have permission',
        });
      }
    });
  };
}

export default MessageController;