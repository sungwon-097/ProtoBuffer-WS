# ProtoBuffer

Date: 2023년 5월 18일

### ProtoBuffer

- Protocol Buffers ( Protobuf)는 Google에서 개발한 데이터 직렬화 형식
- 구조화된 데이터를 이진 형식으로 효율적이고 컴팩트하게 저장하여 네트워크 연결을 통해 더 빠르게 전송 가능
- Protobuf 는 선택한 다양한 프로그래밍 언어를 지원하고 플랫폼 독립적이므로 Protobuf를 사용하여 작성된 프로그램을 다른 플랫폼으로 쉽게 포팅 가능
- 문자열, 정수, 부동 소수점, 부울, 열거형(열거형), 지도(연관 배열) 등을 비롯한 많은 데이터 유형을 지원
- **`XML, JSON`과의 차이**
    - binary ****형식으로 저장되기 때문에 텍스트 기반 형식보다 훨씬 작아 네트워크를 통한 전송이 더 빠름
    - 더 적은 메모리를 사용하여 더 빠른 애플리케이션을 만들 수 있음

| 특성 | JSON/XML | Protocol Buffers(protobuf) |
| --- | --- | --- |
| 데이터 크기 | 상대적으로 큼 | 상대적으로 작음 |
| 직렬화/역직렬화 속도 | 상대적으로 느림 | 상대적으로 빠름 |
| 스키마 정의 | 일반적으로 없음 | 스키마 정의를 통해 데이터 구조 정의 가능 |
| 언어 독립성 | 다양한 플랫폼 및 언어에서 지원 | 다양한 플랫폼 및 언어에서 지원 |
| 확장성 | 유연성이 낮음 | 유연성이 높음 |
| 유효성 검사 | 일반적으로 없음 | 스키마에 따라 데이터 유효성을 검사할 수 있음 |
| 가독성 | 사람이 읽기 쉬움 | 이진 형식이므로 사람이 직접 읽기 어려움 |
| 지원되는 데이터 유형 | 다양한 데이터 유형을 지원 | 일부 데이터 유형만 지원 |

→ **효율적인 데이터 저장 및 시스템 간의 통신에 이상적인 데이터 직렬화 형식**

→ 프로젝트에 데이터의 스키마를 정의해 실제로 `send-recieve` 하는 데이터를 경량화 시킴

→ 실시간 동기화 서버를 만들어야 하기 때문에 데이터의 크기가 작고 직렬화 수행 속도가 빠른 것이 중요

---

### ProtoBuffer를 사용해 ws로 client-server 간 데이터를 주고받음

: npm 의존성으로는 `protobufjs`와 `google-protobuf`가 존재. 다음 실습에서는 `google-protobuf`와 `protoc` 컴파일러를 사용해 _pb.js파일에 직접 접근하였음

### 적용 방법

- [PB 사용법](/assets/howToUsePB.md)

### Environment

```bash
// common

cat /etc/issue -> Ubuntu 22.04.2 LTS
node --versionv -> 20.2.0
npm --version -> 9.6.6
protoc --version -> libprotoc 3.12.4

// React-Client

"dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "google-protobuf": "^3.21.2", // ProtoBuffer
    "pr": "^0.3.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4",
    "websocket": "^1.0.34" // ws
  },

// Express-Server

"dependencies": {
    "express": "^4.18.2",
    "google-protobuf": "^3.21.2", // ProtoBuffer
    "websocket": "^1.0.34" // ws
  }
```

- 실행 결과
    1. server(express.js)
    
    ![Untitled](/assets/Untitled.png)
    

    2. client(react.js)

    ![Untitled](/assets/Untitled%201.png)

- 방법
    1. ws를 이용하여 client에서 데이터를 직렬화 해 server로 보낸다
    2. server에서는 client로부터 받은 데이터를 역직렬화 해 각 요소를 로그로 출력한다 
    3. 데이터의 내용을 변경해 다시 직렬화 후 client로 보낸다
    4. client에서는 server로부터 받은 데이터를 역직렬화 해 각 요소를 로그로 출력한다 

    ![Untitled](/assets/Untitled%202.png)

### Client - WebSocketClient.js

```jsx
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
```

- 전송부

1. 웹소켓 연결
2. ProtoBuffer 메시지 객체 생성
3. 전송할 값을 세팅 후 직렬화
4. 웹소켓을 통해 전송

- 수신부

1. message를 수신
2. Base64로 인코딩된 데이터를 디코딩
3. 역직렬화 수행
4. 오브젝트의 값을 출력

### Server - server.js

```jsx
const express = require('express');
const WebSocket = require('websocket').server;
const Root = require('./protobuf/protobuf/awesome_pb'); 

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
```

- 수신부

1. ProtoBuffer 메시지 객체 생성
2. 메시지를 수신
3. 역직렬화 수행
4. 오브젝트의 값을 출력

- 전송부

1. 전송할 값을 세팅 후 직렬화
2.  직렬화 한 값을 Base64로 인코딩
3. 클라이언트로 전송

### .proto

```protobuf
syntax = "proto3"; // protobuf 의 버전

package example; // 데이터 구조의 충돌을 방지하기 위해 패키지명 명시

message YourMessage {
  int32 id = 1;
  string name = 2;
	// 직렬화 할 Data Column의 순서
}
```

- 이를 Domain Class 라고 생각하면 아래와 같은 형식이 될 것

```java
package project.com.example;

@Data
@Entity
class YourMessage{
	@Id @Column private Integer id;
	@Column private String name;
}
```

### + Plus

- Base64 인코딩/디코딩을 사용하는 이유
    - ws에서 데이터를 전송 할 때 일반적으로 txt형식으로 데이터를 전송함
    - binary는 일부 문자 집합에서 올바르게 표현 되지 않을 수 있음
    - 이를 안전하게 전송/저장하기 위해 Base64 Encoding을 사용
    
    → `Serialize → Base64 Encode →  ws → Base64 Decode → Deserialize`
    
- API Documentation

```jsx
API
===

The API is not well-documented yet.  Here is a quick example to give you an
idea of how the library generally works:

    var message = new MyMessage();

    message.setName("John Doe");
    message.setAge(25);
    message.setPhoneNumbers(["800-555-1212", "800-555-0000"]);

    // Serializes to a UInt8Array.
    var bytes = message.serializeBinary();

    var message2 = MyMessage.deserializeBinary(bytes);

For more examples, see the tests.  You can also look at the generated code
to see what methods are defined for your generated messages.
```

### Document

[npm: google-protobuf](https://www.npmjs.com/package//google-protobuf)

[Language Guide (proto 3)](https://protobuf.dev/programming-guides/proto3/)