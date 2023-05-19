import React, { useEffect } from 'react';

import { w3cwebsocket as WebSocket } from 'websocket';
const Root = require('./protobuf/protobuf/awesome_pb');
 const WebSocketClient = () => {
    useEffect(() => {

        const client = new WebSocket('ws://localhost:8000');
        const message = new Root.YourMessage();
        client.onopen = () => {
            console.log('Connected to server');
            // Protobuf 메시지 생성 및 전송

            message.setId(1);
            message.setName('Sungwon1');

            const serializedData = message.serializeBinary();
            console.log("send", serializedData)
            client.send(serializedData);
        };

        client.onmessage = (message) => {
            // 메시지 수신 처리
            const data = message.data;
            const decodedData = decodeURIComponent(escape(atob(data)))

            const uint8Array = new Uint8Array(decodedData.length);
            for (let i = 0; i < decodedData.length; i++) {
                uint8Array[i] = decodedData.charCodeAt(i);
            }

            const deserializedMessage = Root.YourMessage.deserializeBinary(uint8Array);

            console.log('Received message:', deserializedMessage);
            console.log('Received message:', deserializedMessage.getId());
            console.log('Received message:', deserializedMessage.getName());
        };

        client.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
            client.close();
        };
    }, []);

    return <div>WebSocket Client</div>;
};

export default WebSocketClient;
