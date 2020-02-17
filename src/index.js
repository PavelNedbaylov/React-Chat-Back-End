import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { UserController, DialogController, MessageController } from './controllers'
import { updateLastSeen } from './middleware'

const app = express()

dotenv.config();
app.use(bodyParser.json())
app.use(updateLastSeen)

const user = new UserController()
const dialog = new DialogController()
const messages = new MessageController()

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

app.get('/user/:id', user.index)
app.post('/user/registration', user.create)
app.delete('/user/:id', user.delete)

app.get('/dialogs/:id', dialog.index)
app.post('/dialogs/create', dialog.create)
app.delete('/dialogs/delete/:id', dialog.delete)

app.get('/messages/dialog?id=', messages.index)
app.post('/messages/create', messages.create)
app.delete('/messages/delete/:id', messages.delete)

const PORT = process.env.PORT || 3003;

app.listen(PORT, function() {
  console.log(`Server: http://localhost:${PORT}`);
});