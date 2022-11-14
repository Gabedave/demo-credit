import * as http from "http";
import AppClass from "./App";

const { PORT } = process.env;
const App = new AppClass().app;

const server = http.createServer(App);

server.listen(PORT, () => {
  console.log(`-------- Starting Demo Credit ----------`);
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any, listener) => {
  console.error(err);
  console.log(`Error: ${err.message}`);

  // Close server and exit process
  server.close(() => process.exit(10));
});
