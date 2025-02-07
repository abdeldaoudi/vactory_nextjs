// // this is the logger for the browser
// import pino from "pino"

// const config = {
//   serverUrl: process.env.REACT_APP_API_PATH || "http://localhost:3000",
//   env: process.env.NODE_ENV,
//   publicUrl: process.env.PUBLIC_URL,
// }

// const pinoConfig = {
//   browser: {
//     asObject: true,
//   },
// }

// if (process.env.NODE_ENV === "development") {
//   pinoConfig.transport = {
//     target: "pino-pretty",
//     options: {
//       colorize: true,
//     },
//   }
// }

// if (config.serverUrl) {
//   pinoConfig.browser.transmit = {
//     level: "info",
//     send: (level, logEvent) => {
//       const msg = logEvent.messages[0]

//       const headers = {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Headers":
//           "Origin, X-Requested-With, Content-Type, Accept",
//         type: "application/json",
//       }
//       let blob = new Blob([JSON.stringify({ msg, level })], headers)
//       navigator.sendBeacon(`${config.serverUrl}/log`, blob)
//     },
//   }
// }

// const logger = pino(pinoConfig)

export const log = (msg) => console.info(msg)
const logger = {
  info: (msg) => console.info(msg),
}
export default logger
