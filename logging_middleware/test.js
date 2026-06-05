import { customLog } from './logger.js';

async function testLogger() {
  await customLog({
	stack: "frontend",
	level: "info",
	packageName: "api",
	message: "Frontend application started successfully"
  });
}

testLogger();