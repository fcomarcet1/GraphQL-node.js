const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const http = require("http");

const app = express();

/**
 * Array en REST
 * let aeropuertos = [
    { nombre: "Bilbao", conexiones: ["Madrid", "Lisboa", "Londres"] },
    { nombre: "Madrid", conexiones: ["Bilbao", "Lisboa"] },
    { nombre: "Londres", conexiones: ["Madrid"] },
    { nombre: "Lisboa", conexiones: [] }
  ]
 */

// definicion de tipos
const typeDefs = gql`

  type Aeropuerto {
    nombre: String!
    conexiones: [Aeropuerto]
  }

  type Query {
    listarAeropuertos: [Aeropuerto],
    listarConexiones(aeropuerto: String!): [Aeropuerto]
  }

`;

// const aeropuertos = [bilbao, madrid, londres, lisboa];
// preparamos array en graphQL
const bilbao = {nombre: 'Bilbao', conexiones: []};
const madrid = {nombre: 'madrid', conexiones: []};
const londres = {nombre: 'londres', conexiones: []};
const lisboa = {nombre: 'lisboa', conexiones: []};

bilbao.conexiones.push(madrid, londres, lisboa);
madrid.conexiones.push(bilbao, lisboa);
londres.conexiones.push(madrid);

const aeropuertos = [bilbao, madrid, londres, lisboa];

const resolvers = {
  Query : {
    listarAeropuertos: () => {
      return aeropuertos;
    },
    listarConexiones: (obj, {aeropuerto}) => {

      const conexiones = aeropuertos
                          .filter(aero => aero.nombre === aeropuerto)
                          .map(aero => aero.conexiones)
                          .flat();

      return conexiones;
    }
  }
}

//const server = new ApolloServer({ typeDefs, resolvers });

let apolloServer = null;

async function startServer() {

    apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}

startServer();
const httpserver = http.createServer(app);

/* apolloServer.listen()
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
}); */

app.listen({ port: 4000 }, () =>{
  console.log(`🚀 Server ready at http://localhost:4000`);
  console.log(`🚀 GraphQL ready at http://localhost:4000${apolloServer.graphqlPath}`);
});

app.get("/rest", function (req, res) {
  res.json({ data: "api working" });
});

