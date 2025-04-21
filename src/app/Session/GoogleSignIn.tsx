import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Strong, Text } from "@/components/text";

export function GoogleSignIn({ onSubmit }: { onSubmit: () => void }) {
  return (
    <AuthLayout>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <Heading className="text-center">Sign in to your account</Heading>

        <Button type="submit" className="w-full">
          Login
        </Button>
        <Text>
          Don’t have an account? <Strong>You'll have to wait</Strong>
        </Text>
      </form>
    </AuthLayout>
  );
}
