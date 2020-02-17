import { UserModel } from '../schemas'

export default class UserController {
    index(req, res) {
        const id = req.params.id;
        UserModel.findById(id,(err,user)=>{
            if(err){
                return res.status(404).json({message:"Not found"})
            }
            res.json(user)
        })
    }

    getMy(){
        // TODO: return data about current user (auntification)
    }

    create(req, res) {
        const postData = {
            email: req.body.email,
            fullname: req.body.fullname,
            password: req.body.password
        }
        const user = new UserModel(postData);
        user.save()
            .then(data => res.json(data))
            .catch(error => es.json(error))
    }

    delete(req, res) {
        const id = req.params.id;
        UserModel.findByIdAndRemove(id, (err,user)=>{
            if(err){
                return res.status(404).json({message:"Not found"})
            }
            res.json({message:`User ${user.fullname} was deleted`})
        })
    }
}