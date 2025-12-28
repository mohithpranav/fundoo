import cacheService from "./src/utils/cache.js";

console.log("Testing Redis connection...\n");

async function testRedis() {
  try {
    // Test 1: Set a value
    console.log("1. Testing SET operation...");
    await cacheService.set("test:key", { message: "Hello Redis!" }, 60);
    console.log("✅ SET successful\n");

    // Test 2: Get the value
    console.log("2. Testing GET operation...");
    const value = await cacheService.get("test:key");
    console.log("✅ GET successful");
    console.log("   Retrieved value:", value);
    console.log("");

    // Test 3: Delete the value
    console.log("3. Testing DEL operation...");
    await cacheService.del("test:key");
    console.log("✅ DEL successful\n");

    // Test 4: Verify deletion
    console.log("4. Verifying deletion...");
    const deletedValue = await cacheService.get("test:key");
    if (deletedValue === null) {
      console.log("✅ Value successfully deleted\n");
    }

    console.log("🎉 All Redis tests passed!");
    console.log(
      "\nRedis is working correctly. You can now run the application."
    );

    // Close connection
    await cacheService.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Redis test failed:", error.message);
    console.error("\n⚠️  Make sure Redis server is running:");
    console.error("   - Docker: docker run -d -p 6379:6379 redis");
    console.error("   - Local: Check if Redis service is started");
    process.exit(1);
  }
}

testRedis();
