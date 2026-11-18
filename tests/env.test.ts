import { describe, expect, it } from "vitest";

import { env, parseEnv } from "@/env";

describe("parseEnv", () => {
  it("applies defaults when variables are missing", () => {
    expect(parseEnv({})).toEqual({
      NODE_ENV: "development",
      APP_NAME: "SignUp Reclame",
      APP_URL: "http://localhost:3000",
    });
  });

  it("treats empty strings as missing", () => {
    expect(parseEnv({ APP_NAME: "  ", APP_URL: "" }).APP_NAME).toBe(
      "SignUp Reclame",
    );
  });

  it("accepts valid values", () => {
    expect(
      parseEnv({
        NODE_ENV: "production",
        APP_NAME: "My App",
        APP_URL: "https://example.com",
      }),
    ).toEqual({
      NODE_ENV: "production",
      APP_NAME: "My App",
      APP_URL: "https://example.com",
    });
  });

  it("rejects an invalid NODE_ENV", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });

  it("rejects an invalid APP_URL", () => {
    expect(() => parseEnv({ APP_URL: "not a url" })).toThrow(/APP_URL/);
  });

  it("exports a validated env object", () => {
    expect(env.NODE_ENV).toBe("test");
    expect(typeof env.APP_NAME).toBe("string");
  });
});
