import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Alert,
  Loader,
  Group,
} from "@mantine/core";
import { authClient } from "../lib/auth-client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = router.query.token as string;

      if (!token) {
        setStatus("error");
        setErrorMessage("No verification token provided");
        return;
      }

      try {
        await authClient.verifyEmail({
          query: {
            token,
          },
        });
        setStatus("success");
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error?.message || "Failed to verify email");
      }
    };

    if (router.isReady) {
      verifyEmail();
    }
  }, [router.isReady, router.query.token]);

  return (
    <Container size="sm" mt={100}>
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="md">
          {status === "loading" && (
            <>
              <Loader size="lg" />
              <Title order={2}>Verifying your email...</Title>
              <Text c="dimmed">Please wait while we verify your email address.</Text>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: "48px" }}>✅</div>
              <Title order={2}>Email Verified!</Title>
              <Text c="dimmed" ta="center">
                Your email has been successfully verified. You will be redirected to the home page shortly.
              </Text>
              <Button component={Link} href="/" mt="md">
                Go to Home
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: "48px" }}>❌</div>
              <Title order={2}>Verification Failed</Title>
              <Alert color="red" w="100%">
                {errorMessage}
              </Alert>
              <Text c="dimmed" ta="center">
                The verification link may have expired or is invalid.
              </Text>
              <Group mt="md">
                <Button component={Link} href="/login" variant="default">
                  Go to Login
                </Button>
                <Button component={Link} href="/register">
                  Create New Account
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

