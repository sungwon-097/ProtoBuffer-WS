const express = require('express');
const WebSocket = require('websocket').server;
const Root = require('./protobuf/protobuf/awesome_pb'); // Protobuf 파일을 require합니다.

const app = express();
const server = app.listen(8000, () => {
    console.log('Server started on port 8000');
});

const wsServer = new WebSocket({
    httpServer: server,
    autoAcceptConnections: false,
});

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    console.log('WebSocket connection accepted');

    connection.on('message', (message) => {
        // 메시지 수신 처리
        const responseMessage = new Root.YourMessage();
        const data = message.binaryData;
        console.log(data)
        const deserializedMessage = Root.YourMessage.deserializeBinary(data)

        console.log('Received message:', deserializedMessage);
        console.log('Received message:', deserializedMessage.getId());
        console.log('Received message:', deserializedMessage.getName());

        // 메시지 응답 전송

        responseMessage.setId(2);
        responseMessage.setName('Sungwon2');
        const serializedData = responseMessage.serializeBinary();
        const base64EncodedMessage = btoa(String.fromCharCode.apply(null, serializedData));
        console.log("send", base64EncodedMessage)
        connection.send(base64EncodedMessage);
    });

    connection.on('close', (reasonCode, description) => {
        console.log(`WebSocket connection closed: ${description}`);
    });
});