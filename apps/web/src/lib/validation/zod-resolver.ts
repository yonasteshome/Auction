import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

export function createZodResolver<TValues extends FieldValues>(
  schema: z.ZodType<TValues>,
): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: FieldErrors<TValues> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!path) {
        continue;
      }

      (errors as Record<string, unknown>)[path] = {
        type: "validation",
        message: issue.message,
      };
    }

    return {
      values: {} as Record<string, never>,
      errors,
    };
  };
}
