/*

Alberto Herrera Olvera <alherrera42@gmail.com>
Interfaz Socket.io para Magellan 8300/8400/8500
Noviembre de 2017
github.com/alherrera42/socket.io-magellan8500

No olvides configurar tu bascula. Se recomienda:
9600 8-N-1
Sin prefijo de codigo
Activar transmision de primer caracter
Activar transmision de caracter de checksum

*/

var http = require('http');
const sp = require('serialport');
var process = require('process');
var puerto = '/dev/ttyUSB0'; // En mi caso, tuve que usar un adaptador
var puertoAPI = 3001;
var comandoPeso = [0x53,0x31,0x31,0x0d]; // Ahi dice 'S11\n'
var datosEjemplo = false;
var conf = {
    autoOpen: true,
    baudRate: 9600,
    dataBits: 8,
    lock: false,
    stopBits: 1,
    parity: 'none'
};

// Api
var app = http.createServer((req,res)=>{
    res.writeHead(200,{
        'Content-Type': 'text/json' 
    });
    res.end(JSON.stringify({
        apiName: 'hummingbird2-magellan8300',
        autor: 'Alberto Herrera',
        uso: 'socket.io',
        eventos: {
            emit: ['codigoR','pesoR'],
            on: ['codigo','peso']
        }
    }));
});

// Codigo
var codigo = '';
try {

    conn = new sp(puerto,conf);

    // Conectar las funciones con la API
    var io = require('socket.io').listen(app);
    io.on('connection',(socket)=>{
        socket.on('disconnect',()=>{
            console.log("Usuario desconectado");
        });
        socket.on('peso',()=>{
            console.log("Recibido evento Peso");
            console.log("Solicitando peso",comandoPeso);
            conn.write((comandoPeso),(err,res)=>{
                console.log("ER",err,res);
            }); 
            conn.drain((e)=>{
                console.log("Drain",e);
            });
        });
    });
    //
    conn.on('open',()=>{
        console.log("Puerto abierto",puerto);
    });
    conn.on('data',(d)=>{
        var bf = d.toString('utf8');
        //console.log("Escaneado",d,bf);
        codigo += bf.trim();
        if(bf.trim()=='') { // Retorno indica fin de respuesta
            //setTimeout(()=>{
            if(codigo && codigo.length>0) {
                if(codigo.startsWith('S08')) {
                    codigo = codigo.replace('S08F','').replace('S08','').toUpperCase();
                    io.emit('codigoR',{
                        codigo: codigo
                    });
                }
                else if(codigo.startsWith('S11')) {
                    codigo = codigo.replace('S11F','').replace('S11','').toUpperCase();
                    io.emit('pesoR',{
                        peso: parseFloat(codigo)/1000 // Respuesta esperada en Kg
                    });
                }
                console.log('Emitido',codigo);
            }
            codigo = '';
            //},50);
        }
    });
    conn.on('status',(s)=>{
        console.log("Status",s);
    });
    conn.on('error',(e)=>{
        console.error("Error",e);
    });
} catch(e) {
    console.log('Error',e);
}


app.listen(puertoAPI);
console.log("Api Magellan escuchando en el puerto",puertoAPI);