import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import * as React from "react";

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  chakra,
} from "@chakra-ui/react";
import { getUserId } from "~/services/session.server";

import { ChakraRemixLink } from "~/components/factory";
import { getUserAgent } from "~/utils/client";
import { join } from "~/services/auth/join.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  return await join(request);
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const transition = useTransition();
  const isLoading = !!transition.submission;

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  const agent = getUserAgent();

  return (
    <Flex minH="full" direction="column" justify="center">
      <chakra.div mx="auto" w="full" maxW="md" px="8">
        <Form method="post" className="space-y-6" noValidate>
          <input type="hidden" name="userAgent" value={JSON.stringify(agent)} />
          <Flex direction="column" gap="6">
            <FormControl
              isInvalid={actionData?.errors?.email ? true : undefined}
            >
              <FormLabel
                htmlFor="email"
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
              >
                Email address
              </FormLabel>
              <Input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                mt="1"
              />
              <FormErrorMessage>{actionData?.errors?.email}</FormErrorMessage>
            </FormControl>

            <FormControl
              isInvalid={actionData?.errors?.password ? true : undefined}
            >
              <FormLabel
                htmlFor="password"
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
              >
                Password
              </FormLabel>
              <Input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                mt="1"
              />
              <FormErrorMessage>
                {actionData?.errors?.password}
              </FormErrorMessage>
            </FormControl>

            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Create Account
            </Button>
            <chakra.div textAlign="center" fontSize="sm" color="gray.500">
              Already have an account?{" "}
              <ChakraRemixLink
                color="blue.500"
                textDecor="underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </ChakraRemixLink>
            </chakra.div>
          </Flex>
        </Form>
      </chakra.div>
    </Flex>
  );
}
