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
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { registerSchema, type RegisterInput } from "../lib/validation/auth";
import { signUp } from "../lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const form = useForm<RegisterInput>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const parsed = registerSchema.safeParse(values);
      if (parsed.success) return {};
      const fe = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const out: Record<string, string> = {};
      Object.entries(fe).forEach(([k, v]) => { if (v && v[0]) out[k] = v[0]; });
      return out;
    },
  });

  if (showVerificationMessage) {
    return (
      <Group justify="center" mt={50}>
        <Paper withBorder p="lg" radius="md" maw={420} w="100%">
          <Stack align="center" gap="md">
            <div style={{ fontSize: "48px" }}>📧</div>
            <Title order={2} ta="center">Check your email</Title>
            <Text c="dimmed" ta="center">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </Text>
            <Alert color="blue" w="100%">
              <Text size="sm">
                Didn't receive the email? Check your spam folder or contact support.
              </Text>
            </Alert>
            <Button component={Link} href="/login" variant="default" mt="md">
              Go to Login
            </Button>
          </Stack>
        </Paper>
      </Group>
    );
  }

  return (
    <Group justify="center" mt={50}>
      <Paper withBorder p="lg" radius="md" maw={420} w="100%">
        <Title order={2} mb="sm">Create an account</Title>
        {globalError && (
          <Alert color="red" mb="sm">{globalError}</Alert>
        )}
        <form
          onSubmit={form.onSubmit(async (values: RegisterInput) => {
            setGlobalError("");
            setPending(true);
            try {
              await signUp.email(
                {
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  callbackURL: "/",
                },
                {
                  onError: (ctx) => {
                    setGlobalError(ctx.error?.message ?? "Registration failed");
                  },
                  onSuccess: () => {
                    setShowVerificationMessage(true);
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
              label="Name"
              placeholder="Your name"
              required
              {...form.getInputProps("name")}
            />
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
            <PasswordInput
              label="Confirm password"
              placeholder="Repeat your password"
              required
              {...form.getInputProps("confirmPassword")}
            />
            <Button type="submit" loading={pending} disabled={pending} mt="sm">
              Create account
            </Button>
            <Anchor component={Link} href="/login" size="sm" mt="xs">
              Already have an account? Log in
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Group>
  );
}
