import { Title, Stack, Anchor, Card, Avatar, Text, Group, Loader, Alert, Button } from "@mantine/core";
import Link from "next/link";
import { useSession } from "../lib/auth-client";

function User() {
    const {
        data: session,
        isPending,
        error, 
        refetch
    } = useSession();

    if (isPending) {
        return (
            <Group justify="center">
                <Loader size="lg" />
                <Text>Loading user info...</Text>
            </Group>
        );
    }

    if (error) {
        return (
            <Alert color="red" title="Error">
              {JSON.stringify(error)}
                Failed to load user info: {error.message}
                <Button onClick={() => refetch()} variant="light" mt="sm">
                    Retry
                </Button>
            </Alert>
        );
    }

    if (!session) {
        return (
            <Stack align="center" gap="md">
                <Title order={2}>You are not logged in</Title>
                <Anchor component={Link} href="/login" size="lg">
                    Go to Login
                </Anchor>
            </Stack>
        );
    }

    const user = session.user;

    return (
        <Card withBorder padding="lg" radius="md" maw={400} w="100%">
            <Group>
                <Avatar src={user.image} size="lg" radius="xl" />
                <div>
                    <Text size="lg" fw={500}>{user.name}</Text>
                    <Text size="sm" c="dimmed">{user.email}</Text>
                    <Text size="xs" c="dimmed">
                        Email verified: {user.emailVerified ? "Yes" : "No"}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Member since: {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                </div>
            </Group>
        </Card>
    );
}

export default function IndexPage() {
    return (
        <Stack mt={50} align="center" gap="md">
            <Title order={1}>Welcome to Better Auth!</Title>
            <User />
        </Stack>
    );
}
