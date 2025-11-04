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
import { loginSchema, type LoginInput } from "../lib/validation/auth";
import { signIn, authClient } from "../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendPending, setResendPending] = useState(false);

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

  const handleResendVerification = async () => {
    setResendPending(true);
    setResendSuccess(false);
    try {
      await authClient.sendVerificationEmail({
        email: resendEmail,
        callbackURL: "/",
      });
      setResendSuccess(true);
    } catch (error) {
      setGlobalError("Failed to resend verification email");
    } finally {
      setResendPending(false);
    }
  };

  return (
    <Group justify="center" mt={50}>
      <Paper withBorder p="lg" radius="md" maw={420} w="100%">
        <Title order={2} mb="sm">Log in</Title>
        {globalError && (
          <Alert color="red" mb="sm">{globalError}</Alert>
        )}
        {showResendVerification && (
          <Alert color="blue" mb="sm">
            <Text size="sm" fw={500} mb="xs">
              Email not verified
            </Text>
            <Text size="sm" mb="sm">
              Please verify your email address before logging in.
            </Text>
            {resendSuccess ? (
              <Text size="sm" c="green">
                ✓ Verification email sent! Check your inbox.
              </Text>
            ) : (
              <Button
                size="xs"
                variant="light"
                onClick={handleResendVerification}
                loading={resendPending}
              >
                Resend verification email
              </Button>
            )}
          </Alert>
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
                    if (ctx.error.status === 403) {
                      setShowResendVerification(true);
                      setResendEmail(values.email);
                      setGlobalError("Please verify your email address before logging in");
                    } else {
                      setGlobalError(ctx.error?.message ?? "Login failed");
                    }
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
