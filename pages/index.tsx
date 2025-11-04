import { Title, Stack, Anchor } from "@mantine/core";
import Link from "next/link";

export default function IndexPage() {
  return (
    <Stack mt={50} align="center" gap="md">
      <Title order={1}>Welcome to Better Auth!</Title>
      <Anchor component={Link} href="/login" size="lg">
        Go to Login
      </Anchor>
    </Stack>
  );
}
