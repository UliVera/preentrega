const mongoose= require('mongoose')

url= 'mongodb+srv://asadi01:<password>@cluster0.9vaoj7r.mongodb.net/'

class ManagerMongo {

    constructor (url){
        this.url = url
    } 
  
        connect(){
            return mongoose.connect(this.url+'ecommerce', {useUnifiedTopology:true, useNewUrlParser:true})
            .then(connect =>{ console.log ('conexion exitosa')})
            .catch(err=>{console.log(err)})
        }
    
}

module.exports=ManagerMongo