import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { expect, test } from "vitest";
import Dynim from "../src/index.js";

const dynim = new Dynim({
	logger: console.log,
});

const client = new DynamoDBClient({
	endpoint: "http://127.0.0.1:8000",
	region: "local",
	credentials: {
		accessKeyId: "fakeMyKeyId",
		secretAccessKey: "fakeSecretAccessKey",
	},
});
dynim.addMiddleware(client);
const doc = DynamoDBDocument.from(client);

test("should pass", async () => {
	await doc.put({
		TableName: "dynim-test-pk-S-sk-S",
		Item: { pk: "foo1", sk: "bar1", message: "hello1" },
	});
	await doc.put({
		TableName: "dynim-test-pk-S-sk-S",
		Item: { pk: "foo1", sk: "bar2", message: "hello2" },
	});

	expect(
		await doc.get({
			TableName: "dynim-test-pk-S-sk-S",
			Key: { pk: "foo1", sk: "bar1" },
		}),
	).toEqual({
		$metadata: {
			attempts: 1,
			cfId: undefined,
			extendedRequestId: undefined,
			httpStatusCode: 200,
			requestId: expect.stringMatching(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/),
			totalRetryDelay: 0,
		},
		Item: {
			pk: "foo1",
			sk: "bar1",
			message: "hello1",
		},
	});

	expect(
		await doc.get({
			TableName: "dynim-test-pk-S-sk-S",
			Key: { pk: "foo1", sk: "bar2" },
		}),
	).toEqual({
		$metadata: {
			attempts: 1,
			cfId: undefined,
			extendedRequestId: undefined,
			httpStatusCode: 200,
			requestId: expect.stringMatching(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/),
			totalRetryDelay: 0,
		},
		Item: {
			pk: "foo1",
			sk: "bar2",
			message: "hello2",
		},
	});
});
