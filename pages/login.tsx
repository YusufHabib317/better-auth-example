import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Anchor,
  Alert,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { loginSchema, type LoginInput } from "../lib/validation/auth";
import { signIn } from "../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string>("");
  const [pending, setPending] = useState(false);

  const form = useForm<LoginInput>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const parsed = loginSchema.safeParse(values);
      if (parsed.success) return {};
      const fe = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const out: Record<string, string> = {};
      Object.entries(fe).forEach(([k, v]) => { if (v && v[0]) out[k] = v[0]; });
      return out;
    },
  });

  return (
    <Group justify="center" mt={50}>
      <Paper withBorder p="lg" radius="md" maw={420} w="100%">
        <Title order={2} mb="sm">Log in</Title>
        {globalError && (
          <Alert color="red" mb="sm">{globalError}</Alert>
        )}
        <form
          onSubmit={form.onSubmit(async (values: LoginInput) => {
            setGlobalError("");
            setPending(true);
            try {
              await signIn.email(
                {
                  email: values.email,
                  password: values.password,
                  rememberMe: true,
                  callbackURL: "/",
                },
                {
                  onError: (ctx) => {
                    setGlobalError(ctx.error?.message ?? "Login failed");
                  },
                  onSuccess: () => {
                    router.push("/");
                  },
                  onRequest: () => setPending(true),
                }
              );
            } catch (err: any) {
              setGlobalError(err?.message ?? "Something went wrong");
            } finally {
              setPending(false);
            }
          })}
          noValidate
        >
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              type="email"
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps("password")}
            />
            <Button type="submit" loading={pending} disabled={pending} mt="sm">
              Log in
            </Button>
            <Anchor component={Link} href="/register" size="sm" mt="xs">
              Don&apos;t have an account? Create one
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Group>
  );
}
