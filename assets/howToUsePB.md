# PB 사용법

### Protobuf

- 구글에서 개발한 바이너리 직렬화 데이터 형식
- 데이터를 효율적이고 간결한 형식으로 직렬화
- 다양한 플랫폼 및 언어에서 사용할 수 있도록 지원하는 프로토콜

### 사용법 1 (protobufjs)

1. 설치

```bash
npm install protobufjs
```

2. 프로토콜 버퍼의 문법에 따라 .proto 파일 작성

```protobuf
syntax = "proto3";

package example;

message YourMessage {
  int32 id = 1;
  string name = 2;
}
```

3. .proto파일을 컴파일

```bash
npx pbjs -t static -w es6 -o output.js <your_proto_file.proto>
```

4. js코드에서 아래와 같이 사용

```jsx
const protobuf = require('protobufjs');
const root = protobuf.Root.fromJSON(require('./output.js'));

// Protobuf 메시지 생성
const message = root.lookupType('your_package_name.YourMessageType');

const data = { /* 메시지 필드 값들 */ };

// 직렬화
const buffer = message.encode(data).finish();

// 역직렬화
const decodedData = message.decode(buffer);
```

### 사용법 2 (google-protobuf + protoc compiler)

1. 설치

```bash
npm install google-protobuf
sudo apt install protobuf-compiler
```

2. 프로토콜 버퍼의 문법에 따라 .proto 파일 작성

```protobuf
'1과 동일'
```

3. .proto파일을 컴파일

```bash
protoc --js_out=import_style=commonjs,binary:<_pb.js파일을 생성할 경로> <proto 파일의 경로>
```

4. js코드에서 아래와 같이 사용

```jsx
const Root = require('./protobuf/awesome_pb');

// Protobuf 메시지 생성
const message = new Root.YourMessage();

message.setId(1);
message.setName('Sungwon1');

// 직렬화
const serializedData = message.serializeBinary();

// 역직렬화
const deserializedMessage = Root.YourMessage.deserializeBinary(uint8Array);
```

: 자바스크립트 및 nodejs 환경에 국한되지 않고 사용하기 위해 .proto 파일을 직접 common.js 형태의 파일인 _pb.js로 컴파일해 사용하는 `사용법 2` 를 적용