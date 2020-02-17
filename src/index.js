import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser'

import { UserController } from './controllers'

const app = express()

app.use(bodyParser.json())

const user = new UserController()

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

app.get('/user/:id', user.index)
app.post('/user/registration', user.create)
app.delete('/user/:id', user.delete)

app.listen(3000, () => null)