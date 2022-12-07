import {
  isReady,
  Bool,
  UInt32,
  UInt64,
  Int64,
  Character,
  shutdown,
  CircuitString,
  PrivateKey,
  Signature,
} from 'snarkyjs';

async function main() {
  await isReady;

  const num1 = UInt32.from(40);
  const num2 = UInt64.from(40);

  const numsEqual: Bool = num1.toUInt64().equals(num2);

  console.log('numbers equal: ' + numsEqual.toString());
  console.log('fields in num1: ' + num1.toFields().length);

  const signedNum1 = Int64.from(-3);
  const signedNum2 = Int64.from(3);
  const signedSum = signedNum1.add(signedNum2);

  console.log('signed sum: ' + signedSum.toString());
  console.log('fields in signed sum: ' + signedSum.toFields().length);

  const char1 = Character.fromString('c');
  const char2 = Character.fromString('d');

  const charsEqual = char1.equals(char2);

  console.log('char1: ' + char1.toString());
  console.log('chars equal: ' + charsEqual.toString());
  console.log('fields in char1: ' + char1.toFields().length);

  const str1 = CircuitString.fromString('foobar');

  console.log('str1: ' + str1.toString());
  console.log('fields in str1: ' + str1.toFields().length);

  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();

  const data1 = char2.toFields().concat(signedSum.toFields());
  const data2 = char1.toFields().concat(str1.toFields());

  const sign = Signature.create(privateKey, data2);
  const verifiedData1 = sign.verify(publicKey, data1);
  const verifiedData2 = sign.verify(publicKey, data2);

  console.log('private key: ' + privateKey.toBase58());
  console.log('public key: ' + publicKey.toBase58());
  console.log('fields in private key: ' + privateKey.toFields().length);
  console.log('fields in public key: ' + publicKey.toFields().length);
  console.log('verify sign for data1: ' + verifiedData1.toString());
  console.log('verify sign for data2: ' + verifiedData2.toString());
  console.log('fields in sign: ' + sign.toFields().length);

  await shutdown();
}

main();
