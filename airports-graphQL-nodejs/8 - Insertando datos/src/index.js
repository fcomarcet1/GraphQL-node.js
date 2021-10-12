const { join } = require('path');
const { ApolloServer, assertResolveFunctionsPresent } = require('apollo-server');
const { loadTypedefsSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const GraphQLDateTime = require('graphql-type-datetime');
const GraphQLEnumType = require('graphql/type')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const aeropuertos = JSON.parse(fs.readFileSync(join(__dirname, './dataset.json'), 'utf8'));

const sources = loadTypedefsSync(join(__dirname, './typeDefs.gql'), {
    loaders: [
        new GraphQLFileLoader()
    ]
});

const typeDefs = sources.map(source => source.document)

const resolvers = {
  // get data
  Query: {
    listarAeropuertos: () => {
      return aeropuertos
    },
    obtenerAeropuertoPorId: (obj, args) => {
      const response = aeropuertos.filter(aeropuerto => {
        aeropuerto.id === args.id;
      });
      return response[0];
    },
    obtenerAeropuerto: (obj, {id, localizacion}) => {
      const response = aeropuertos.filter(aeropuerto => {
        if (aeropuerto.localizacion === localizacion || aeropuerto.id === id){
          return aeropuerto;
        }
      }); 
      return response[0];
    }
  },
  // inserts, updates and deletes
  Mutation: {
    crearPasajero: (obj, {idAvion, nombre, apellido}) => {

      // create pasajero
      const pasajero = {id: uuidv4(), nombre, apellido}
      let insertado = false

      // Conexion a DB,etc ejecutamos el insert y devolvemos el pasajero o throw 

      // ejemplo meme
      // recorremos los aeropuertos 
      aeropuertos.forEach(aeropuerto => {
        // obtenemos avion 
        aeropuerto.aviones.forEach(avion => {
          if (avion.id === idAvion){
            avion.pasajeros.push(pasajero)
            insertado = true
            return
          }
        })
      })
      
      if (insertado) {
        return pasajero
      }

      throw 'Avion no existe';
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Servidor iniciado en ${url}`);
});
