const express = require('express')
const app = express()
const PORT = 8080 || process.env.PORT 

//Mongo
const DataBase= require('./dao/mongoDao/db')
const Product= require('./dao/models/products.model')
const Chat= require('./dao/models/chat.model')

// Public Folder
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended:true}))

// Routes
const productRouter = require('./routes/products/products.Router')
app.use('/api/product', productRouter)
const productviews= require('./routes/products/products.view')
app.use('/products',productviews)
// const routesProducts = require('./routes/products/products.route')
// app.use('/products', routesProducts)
const routesCart = require('./routes/cart/cart.route') 
app.use('/api/cart', routesCart)
const cartViews = require('./routes/cart/cart.view')
app.use('/cart', cartViews)

const routesRealTime = require('./routes/realTimeProduct/realTimeProduct.route')
app.use('/realTimeProducts', routesRealTime)

const routesChat = require('./routes/chat/chat.route')
app.use('/chat', routesChat)


// Handlebars
const handlebars = require('express-handlebars')
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views/')

// Sockets set
const {Server} = require('socket.io')
const http = require('http')
const CartView = require('./routes/cart/cart.view')
const server = http.createServer(app)
const io = new Server(server)

const messages = [] 
io.on('connection', (socket)=>{
    console.log('New User connected')
    socket.emit('wellcome','Wellcome new User') 

    // Comunicacion con realTimeProduct.js
    socket.on('addProduct' ,(data)=>{
        let product= new Product(data)
        product.save()
        .then(pr=>{

            Product.find({}).lean()
            .then(pr=>{
                io.sockets.emit('newData', pr)
            })
            .catch(err=>{
                res.status(500).send(
                    console.log('Error loading product')
                )
            })
        })
        .catch(err=>{
            res.status(500).send(
                console.log('Error loading product')
            )
        })   

    })
    socket.on('delProduct',(data)=>{
        // let {id} =data
        // let pId = parseInt(id)
        // let product = new ProductManager("./src/routes/products/Products.json");
        // product.deleteProduct(pId)
        // let newData = product.getProducts()
        let {id} =data
        console.log(id)
        Product.deleteOne({_id:id})
        .then(pr =>{ 
            Product.find({}).lean()
            .then(pr=>{
                io.sockets.emit('newData', pr)
            })
            .catch(err=>{
                res.status(500).send(
                    console.log('Error loading product')
                )
            })
        })
        .catch(err=>{
            res.status(500).send(
                console.log('Error Delete product')
            )
        })
        
    })

    // Chat sockets
    socket.on('new-message', (data)=>{
        
            Chat.findOne({user:data.user }).exec()
            .then(pr=>{

                if(pr){
                    Chat.updateOne({_id:pr._id},data)
                    .then(pr=>{
                        messages.push(data)
                        io.sockets.emit('messages-all', messages)
                    })
                    .catch(err=>{
                        console.log('Error send message')   
                    })
                }
                else{
                    let chat= new Chat(data)
                    chat.save()
                    .then(pr=>{
                    messages.push(data)
                    io.sockets.emit('messages-all', messages)
                    })
                    .catch(err=>{
                        console.log('Error send message')   
                    })
                }
            })
    })

})

app.get('/', (req,res)=> {
    const data={
        title:'ecommerce backend',
        message:'Ecommerce backend  Index',
        style:'style.css'
    }
    res.render('index', data)
})

server.listen(PORT, ()=>{
    console.log('Server is runing on port 8080')
    url= 'mongodb+srv://asadi01:<password>@cluster0.9vaoj7r.mongodb.net/'
    const database= new DataBase(url)
    database.connect()
})