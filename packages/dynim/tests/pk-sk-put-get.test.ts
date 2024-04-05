import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { beforeEach, expect, test } from "vitest";
import { Dynim } from "../src/index.js";

const dynim = new Dynim({
	logger: process.env.DEBUG ? console.log : undefined,
	tables: [
		{
			TableName: "dynim-test-pk-S-sk-S",
			KeySchema: [
				{ AttributeName: "pk", KeyType: "HASH" },
				{ AttributeName: "sk", KeyType: "RANGE" },
			],
			AttributeDefinitions: [
				{ AttributeName: "pk", AttributeType: "S" },
				{ AttributeName: "sk", AttributeType: "S" },
			],
			ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
		},
	],
});

const option = {
	endpoint: "http://127.0.0.1:8000",
	region: "local",
	credentials: {
		accessKeyId: "fakeMyKeyId",
		secretAccessKey: "fakeSecretAccessKey",
	},
};

const mockedClient = new DynamoDBClient(option);
dynim.addMiddleware(mockedClient);
const mockedDoc = DynamoDBDocument.from(mockedClient);

const doc = DynamoDBDocument.from(new DynamoDBClient(option));

beforeEach(() => {
	dynim.reset();
});

test("put & get", async () => {
	const pk = randomUUID();
	const inputPut = {
		TableName: "dynim-test-pk-S-sk-S",
		Item: { pk, sk: "bar1", message: "hello1" },
	};
	const outputPut = await doc.put(inputPut);
	const mockedOutputPut = await mockedDoc.put(inputPut);

	expect(mockedOutputPut.$metadata).toEqual({
		...outputPut.$metadata,
		requestId: expect.any(String),
	});
	expect(mockedOutputPut.Attributes).toEqual(outputPut.Attributes);
	expect(mockedOutputPut.ConsumedCapacity).toEqual(outputPut.ConsumedCapacity);
	expect(mockedOutputPut.ItemCollectionMetrics).toEqual(
		outputPut.ItemCollectionMetrics,
	);

	const inputGet = {
		TableName: "dynim-test-pk-S-sk-S",
		Key: { pk, sk: "bar1" },
	};

	const outputGet = await doc.get(inputGet);
	const mockedOutputGet = await mockedDoc.get(inputGet);

	expect(mockedOutputGet.$metadata).toEqual({
		...outputGet.$metadata,
		requestId: expect.any(String),
	});
	expect(mockedOutputGet.Item).toEqual(outputGet.Item);
	expect(mockedOutputGet.ConsumedCapacity).toEqual(outputGet.ConsumedCapacity);
});

test("get then no-item", async () => {
	const inputGet = {
		TableName: "dynim-test-pk-S-sk-S",
		Key: { pk: randomUUID(), sk: "bar1" },
	};

	const outputGet = await doc.get(inputGet);
	const mockedOutputGet = await mockedDoc.get(inputGet);

	expect(mockedOutputGet.$metadata).toEqual({
		...outputGet.$metadata,
		requestId: expect.any(String),
	});
	expect(mockedOutputGet.Item).toEqual(outputGet.Item);
	expect(mockedOutputGet.ConsumedCapacity).toEqual(outputGet.ConsumedCapacity);
});

test("not exists table", async () => {
	const inputGet = {
		TableName: "dummy",
		Key: { pk: randomUUID(), sk: "bar1" },
	};

	const error = await doc.get(inputGet).catch((err) => err);
	const mockedError = await mockedDoc.get(inputGet).catch((err) => err);

	expect(mockedError).toEqual(error);
});
