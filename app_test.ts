import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Deno.test("test #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});
