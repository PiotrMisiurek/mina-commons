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
  Struct,
  Field,
  Circuit,
  MerkleTree,
  MerkleWitness,
  Mina,
  AccountUpdate,
} from 'snarkyjs';

import { BasicMerkleTreeContract } from './BasicMerkleTreeContract.js';

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

  class Point extends Struct({
    x: Field,
    y: Field,
  }) {
    static addPoints(a: Point, b: Point) {
      return a.add(b);
    }

    add(another_point: Point) {
      return new Point({
        x: this.x.add(another_point.x),
        y: this.y.add(another_point.y),
      });
    }
  }

  const point1 = new Point({ x: Field(10), y: Field(4) });
  const point2 = new Point({ x: Field(1), y: Field(2) });

  const pointSums = [point1.add(point2), Point.addPoints(point1, point2)];

  console.log(
    'Point summary - x: ' +
      pointSums[0].x.toString() +
      ' | y: ' +
      pointSums[0].y.toString()
  );
  pointSums[0].x.assertEquals(pointSums[1].x);
  pointSums[0].y.assertEquals(pointSums[1].y);

  class Points4 extends Struct({
    points: [Point, Point, Point, Point],
  }) {}

  const pointsArray = new Array(4)
    .fill(null)
    .map((_, i) => new Point({ x: Field(i), y: Field(i * i) }));
  const points4 = new Points4({ points: pointsArray });

  console.log('points4: ' + JSON.stringify(points4));

  const input1 = Int64.from(10);
  const input2 = Int64.from(-15);

  const inputSum = input1.add(input2);

  const inputSumAbs = Circuit.if(
    inputSum.isPositive(),
    inputSum,
    inputSum.mul(Int64.from(-1))
  );

  console.log('inputSum: ' + inputSum);
  console.log('inputSumAbs: ' + inputSumAbs);

  const input3 = Int64.from(22);

  const input1Largest = input1
    .sub(input2)
    .isPositive()
    .and(input1.sub(input3).isPositive());
  const input2Largest = input2
    .sub(input1)
    .isPositive()
    .and(input2.sub(input3).isPositive());
  const input3Largest = input3
    .sub(input1)
    .isPositive()
    .and(input3.sub(input2).isPositive());

  const largest = Circuit.switch(
    [input1Largest, input2Largest, input3Largest],
    Int64,
    [input1, input2, input3]
  );

  console.log('largest: ' + largest);

  const local = Mina.LocalBlockchain();
  Mina.setActiveInstance(local);
  const deployerAccount = local.testAccounts[0].privateKey;

  {
    const height = 20;
    const tree = new MerkleTree(height);
    class MerkleWitness20 extends MerkleWitness(20) {}

    const basicTreeZkAppPrivateKey = PrivateKey.random();
    const basicTreeZkAppAddress = basicTreeZkAppPrivateKey.toPublicKey();

    const zkapp = new BasicMerkleTreeContract(basicTreeZkAppAddress);

    const deployTx = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkapp.deploy({ zkappKey: basicTreeZkAppPrivateKey });
      zkapp.initState(tree.getRoot());
      zkapp.sign(basicTreeZkAppPrivateKey);
    });
    await deployTx.send();

    const incrementIndex = 522;
    const incrementAmount = Field(9);

    const witness = new MerkleWitness20(
      tree.getWitness(BigInt(incrementIndex))
    );
    tree.setLeaf(BigInt(incrementIndex), incrementAmount);

    const updateTx = await Mina.transaction(deployerAccount, () => {
      zkapp.update(witness, Field.zero, incrementAmount);
      zkapp.sign(basicTreeZkAppPrivateKey);
    });
    await updateTx.send();

    console.log(
      'BasicMerkleTree: local tree hash after update: ' + tree.getRoot()
    );
    console.log(
      'BasicMerkleTree: smart contract root hash after update: ' +
        zkapp.treeRoot.get()
    );
  }

  shutdown();
}

main();
