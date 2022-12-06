import {
  isReady,
  Bool,
  UInt32,
  UInt64,
  Int64,
  Character,
  shutdown,
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

  await shutdown();
}

main();
