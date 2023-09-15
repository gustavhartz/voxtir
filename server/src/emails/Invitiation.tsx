import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VercelInviteUserEmailProps {
  projectName: string;
  senderName: string;
  invitation: string;
}

export const VoxtirInviteProjectEmail = (
  props: VercelInviteUserEmailProps
): React.JSX.Element => {
  const { projectName, senderName, invitation } = props;
  const previewText = `Join ${projectName} on Vercel`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border bg-white border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="w-full mt-[46px]">
              <center>
                <Img
                  src={'https://i.imgur.com/VP7hPI5.png'}
                  alt="Voxtir"
                  className="w-[50px] h-[50px]"
                />
              </center>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{projectName}</strong> on <strong>Voxtir</strong>
            </Heading>
            <Text className="text-center text-black text-[14px] leading-[24px]">
              <strong>{senderName}</strong> (
              <Link href={invitation} className="text-blue-600 no-underline">
                {projectName}
              </Link>
              ) has invited you to the <strong>{projectName}</strong> team on{' '}
              <strong>Voxtir.</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                pX={20}
                pY={12}
                className="bg-[#000000] rounded text-white text-[14px] font-semibold no-underline text-center"
                href={invitation}
              >
                Join {projectName}
              </Button>
            </Section>
            <Text className="text-gray-400 text-center text-[12px] leading-[24px]">
              Voxtir is a leading collaborative voice-to-text and insights
              company.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VoxtirInviteProjectEmail;
