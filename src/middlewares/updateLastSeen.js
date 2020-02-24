import { UserModel } from '../models';

export default (req,_,next) => {
  if (req.user) {
    UserModel.findOneAndUpdate(
      { _id: req.user.id },
      { last_seen: Date.now() },
      { new: true },
      () => {}
    );
  }
  next();
};