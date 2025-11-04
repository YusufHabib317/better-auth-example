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
  Divider,
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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error: any) {
      setGlobalError(error?.message ?? `Failed to sign in with ${provider}`);
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
        
        <Stack gap="sm" mb="md">
          <Button
            variant="default"
            leftSection={
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
            onClick={() => handleOAuthSignIn("google")}
          >
            Continue with Google
          </Button>
          <Button
            variant="default"
            leftSection={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            }
            onClick={() => handleOAuthSignIn("github")}
          >
            Continue with GitHub
          </Button>
        </Stack>

        <Divider label="Or continue with email" labelPosition="center" mb="md" />

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
