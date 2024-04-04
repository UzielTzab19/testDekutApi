//IMPORTACIONES DE NUESTROS MODULOS A UTILIZAR
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

//INICIALIZAR LA APP CON EXPRESS PARA HACER USO DE SUS METODOS YA SEA GET, POST, PUT, DELETE Y PATCH
const app = express();

//LOS USOS DE BIBLIOTECAS QUE CONTENDRA LA APP DE EXPRESS
app.use(cors());
app.use(express.json());

//PUERTO DE LANZAMIENTO
const port = 3000;

//CONFIGURACION PARA REALIZAR UN VINCULO CON LA BASE DE DATOS
const dbConfig = {
    host: 'b0nwabxvlk8afpde9tdx-mysql.services.clever-cloud.com',
    user: 'ufll0clwldbfbgjc',
    password:'l6HSto8WPIgoN1E1Wc6M',
    database:'b0nwabxvlk8afpde9tdx'
};

//CREA UNA POOL DE CONEXIONES, UNA "POOL" ES UN CONJUNTO DE CONEXIONES A LA BASE DE DATOS QUE SE PUEDEN REUTILIZAR, LO QUE PUEDE MEJORAR EL RENDIMIENTO DE LA APLICACIÓN.
//CON ESTA NUEVA VARIABLE PODEMOS REALIZAR CONSULTAS A LA BASE DE DATOS Y CONTROLAR UNA ACCION EN BASE A SI FUE O NO EXITOSA LA CONSULTA
const dbConnection = mysql.createPool(dbConfig);

//VERIFICAMOS SI SE ESTABLECIO CORRECTAMENTE A CONEXION DE LA API A LA BASE DE DATOS TOMANDO COMO PARAMETRO LA CONFIGURACION ANTERIOR
dbConnection.getConnection((error, connection)=>{
    if(error)
    {
        console.error(`Ocurrio un error al establecer la conexion con la base de datos: `,error);
    }
    else
    {
        console.log(`Conexion exitosa a la base de datos`);
        connection.release();
    }
});

//PETICION DE TIPO GET PARA TRAER A TODOS LOS JUEGOS
app.get('/Juegos', (req, res)=>{
   dbConnection.query('SELECT * FROM Juegos', (error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error al obtener todos los juegos `,error);
        }
        else
        {
            console.log(`Juegos traidos exitosamente`);
            res.json(results);
        }
   })
});

//PETICION DE TIPO GET QUE TRAE A TODOS LOS USUARIOS
app.get('/Usuarios',(req, res)=>
{
    dbConnection.query('SELECT * FROM Usuarios', (error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error en la consulta: `,error);
            res.status(500).json({message: "Error al obtener Usuarios de la tabla Usuarios"});
        }
        else
        {
            res.json(results);
        }
    });
});


app.post('/Usuario', (req, res) => {
  const { CorreoElectronico, Contraseña } = req.body;

  dbConnection.query('SELECT * FROM Usuarios WHERE CorreoElectronico = ?', [CorreoElectronico], (error, results) => {
    if (error) {
      console.error('Ocurrió un error al obtener específicamente a un usuario');
      res.status(500).json({ message: "Ocurrió un error al obtener específicamente a un usuario" });
    } else if (results.length === 0) {
      console.log("No se encontró el usuario deseado");
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
        console.log("Contraseña proporcionada:", Contraseña);
        console.log("Contraseña almacenada:", results[0].Contraseña);
      bcrypt.compare(Contraseña, results[0].Contraseña, (err, result)=> {
        if(result) {
          console.log("Usuario encontrado exitosamente");
          res.status(200).json(results[0]);
        } else {
          console.log("Contraseña incorrecta");
          res.status(401).json({ message: "Contraseña incorrecta" });
        }
      });
    }
  });
});

app.post('/InsertUsuario', (req, res) => {
    console.log(req.body);
    const { Nombre, CorreoElectronico, Contraseña } = req.body;
  
    bcrypt.hash(Contraseña, 10, (err, hash) => {
      if (err) {
        console.error('Ocurrió un error al encriptar la contraseña', err);
        res.status(500).json({ message: "Ocurrió un error al encriptar la contraseña" });
      } else {
        dbConnection.query('INSERT INTO Usuarios(Nombre, CorreoElectronico, Contraseña) VALUES (?,?,?)', [Nombre, CorreoElectronico, hash], (error, results) => {
          if (error) {
            console.error('Ocurrió un error al querer insertar un nuevo registro en la tabla Usuarios', error);
            res.status(500).json({ message: "Ocurrió un error al querer insertar un registro en la tabla Usuarios" });
          } else {
            res.status(201).json({ message: "Usuario registrado correctamente" });
            res.json(results);
          }
        });
      }
    });
  });

app.post('/Juego', (req, res)=>
{
    const {Nombre, Descripcion, Precio, Genero} = req.body;
    dbConnection.query('INSERT INTO Juegos(Nombre, Descripcion, Precio, Genero) VALUE (?,?,?,?)', [Nombre, Descripcion, Precio, Genero ],(error, results)=>{
        if(error)
        {
            console.error(`Ocurrio un error al insertar un nuevo juego en tu tabla Juegos`);
            res.status(500).json({message: "Ocurio un error al inertar un nuevo registro a la tabla juegos"});

        }
        else
        {   
            console.log(`El juego fue insertado exitosamente`);
            res.json({message: "El juego fue insertado correctamente"});

        }

    });

});

app.delete('/EliminarUsuario', (req, res)=>{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Usuarios WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al eliminar el registro`, error);
            res.status(500).json({message: "Error al eliminar al usuario"});
        }
        else if(results.affectedRows== 0)
        {
            console.log(`No se encontro ningun usuario con el id ${Id}`);
            res.status(404).json({message: "No se encontro ningun usuario"});
        }
        else
        {
            console.log("Usuario eliminado exitosamente");
            res.json({message:"Usuario eliminado exitosamente"});
        }
    });
});
app.delete('/EliminarJuego', (req, res)=>
{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Juegos WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al querer eliminar un juego `,error);
            res.json({message: "Ocurrio un error al querer eliminar un juego "});
        }
        else if(results.affectedRows == 0)
        {
            console.log("El juego no fue encontrado");
            res.status(404).json({message: "El juego no fue encontrado con el id especificado"});
        }else
        {
            console.log("Juego eliminado exitosamente");
            res.json({message: "Juego eliminado exitosamente"});
        }

    });
});

app.delete('/EliminarJuego', (req, res)=>
{
    const {Id} = req.body;

    dbConnection.query('DELETE FROM Juegos WHERE Id = ?', [Id], (error, results)=>
    {
        if(error)
        {
            console.error(`Ocurrio un error al querer eliminar un juego `,error);
            res.json({message: "Ocurrio un error al querer eliminar un juego "});
        }
        else if(results.affectedRows == 0)
        {
            console.log("El juego no fue encontrado");
            res.status(404).json({message: "El juego no fue encontrado con el id especificado"});
        }else
        {
            console.log("Juego eliminado exitosamente");
            res.json({message: "Juego eliminado exitosamente"});
        }

    });
});

app.put('/ActualizarUsuario/:Id',(req, res)=>
{
    const {Id} = req.params;
    const {Nombre, CorreoElectronico, Contraseña} = req.body;

    dbConnection.query('UPDATE Usuarios SET Nombre = ?, CorreoElectronico = ?, Contraseña = ? WHERE Id = ?',[Nombre, CorreoElectronico, Contraseña, Id],(error, results)=>{
        if(error)
        {
            console.error(`Occurrio un error al actualizar el usuario`, error);
            res.status(500).json({message: "Error al actualizar el usuario"});
        }
        else if(results.affectedRows == 0)
        {
            console.log(`El usuario con el id ${Id} no existe`);
            res.status(404).json({message: "El usuario no existe"});
        }
        else
        {
            console.log(`Usuario actualizado exitosamente`);
            res.json({message: "El usuario fue acrualizado exitosamente"});

        }
    });
});

app.put('/ActualizarJuego/:Id', (req, res)=>
{
    const {Id} = req.params; 
    const {Nombre, Descripcion, Precio, Genero}= req.body;

    dbConnection.query('UPDATE Juegos SET Nombre = ?, Descripcion = ?, Precio = ?, Genero = ? WHERE Id = ?',[Nombre,Descripcion, Precio, Genero, Id],(error, results)=>
    {

        if(error)
        {
            console.error(`Ocurrio un erro con la actualizacion de un juego`, error);
            res.status(500).json({message:"Ocurrio un erro con la actualizacion de un juego"});
        }
        else if(results.affectedRows == 0)
        {
            console.log(`No se encontro el juego con el Id: ${Id}`);
            res.status(404).json({message:"No se encontro el juego para actualizarlo"});
        }
        else
        {
            console.log("El juego fue actualizado exitosamente");
            res.json({message: "El juego fue actualizado exitosamente"});
        }
    });

});


app.listen(port, ()=>console.log(`Servidor lanzado en el puerto ${port}`));

