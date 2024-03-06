import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
// import { DeserializeMiddleware, MetadataBearer } from "@smithy/types";
import { expect, test } from "vitest";

// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// const store = new Map<string, any>();
// const middleware: DeserializeMiddleware<object, MetadataBearer> =
// 	(next) => async (args) => {
// 		const res = await next(args);
// 		console.log({ args: JSON.stringify(args) });
// 		console.log({
// 			output: JSON.stringify(res.output),
// 		});

// 		let command: string | undefined;
// 		if (
// 			args.request instanceof Object &&
// 			"headers" in args.request &&
// 			args.request.headers instanceof Object &&
// 			"x-amz-target" in args.request.headers &&
// 			typeof args.request.headers["x-amz-target"] === "string"
// 		) {
// 			command = args.request.headers["x-amz-target"].split(".")[1];
// 		}

// 		if (command === "PutItem") {
// 			store.set(args.input.TableName, args.input.Item);
// 			return {
// 				response: new Response(),
// 				output: {
// 					$metadata: {
// 						attempts: 1,
// 						cfId: undefined,
// 						extendedRequestId: undefined,
// 						httpStatusCode: 200,
// 						requestId: "8c2cbda9-e05f-4b11-ad7e-c10e876a2f5a",
// 						totalRetryDelay: 0,
// 					},
// 				},
// 			};
// 		} else if (command === "GetItem") {
// 			const item = store.get(args.input.TableName);
// 			if (item) {
// 				return {
// 					response: new Response(),
// 					output: {
// 						$metadata: {
// 							attempts: 1,
// 							cfId: undefined,
// 							extendedRequestId: undefined,
// 							httpStatusCode: 200,
// 							requestId: "8c2cbda9-e05f-4b11-ad7e-c10e876a2f5a",
// 							totalRetryDelay: 0,
// 						},
// 						Item: item,
// 					},
// 				};
// 			}
// 		}

// 	throw new Error(`unexpected command: ${command}`);

// 	// return {
// 	// 	response: new Response(),
// 	// 	output: {
// 	// 		$metadata: {
// 	// 			attempts: 1,
// 	// 			cfId: undefined,
// 	// 			extendedRequestId: undefined,
// 	// 			httpStatusCode: 200,
// 	// 			requestId: "8c2cbda9-e05f-4b11-ad7e-c10e876a2f5a",
// 	// 			totalRetryDelay: 0,
// 	// 		},
// 	// 		Item: {
// 	// 			message: "hello",
// 	// 			pk: "foo",
// 	// 			sk: "bar",
// 	// 		},
// 	// 	},
// 	// };
// };

const client = new DynamoDBClient({
	endpoint: "http://127.0.0.1:8000",
	region: "local",
	credentials: {
		accessKeyId: "fakeMyKeyId",
		secretAccessKey: "fakeSecretAccessKey",
	},
});
// client.middlewareStack.add(middleware, { step: "build" });
const doc = DynamoDBDocument.from(client);

test("should pass", async () => {
	await doc.put({
		TableName: "dynim-test-pk-S-sk-S",
		Item: { pk: "foo", sk: "bar", message: "hello" },
	});

	const res = await doc.get({
		TableName: "dynim-test-pk-S-sk-S",
		Key: { pk: "foo", sk: "bar" },
	});

	expect(res).toEqual({
		$metadata: {
			attempts: 1,
			cfId: undefined,
			extendedRequestId: undefined,
			httpStatusCode: 200,
			requestId: expect.stringMatching(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/),
			totalRetryDelay: 0,
		},
		Item: {
			message: "hello",
			pk: "foo",
			sk: "bar",
		},
	});
});
