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

interface TranscriptionStatusEmailProps {
  documentName: string;
  documentLink: string;
  transcriptionStatus: 'DONE' | 'FAILED';
}

export const TranscriptionStatusEmail = (
  props: TranscriptionStatusEmailProps
): React.JSX.Element => {
  // Set default values for react-email render
  const {
    documentName = 'My new document',
    transcriptionStatus = 'FAILED',
    documentLink = 'https://voxtir.com',
  } = props;

  return (
    <Html>
      <Head />
      <Preview>We hope you find it useful</Preview>
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
              <strong>{documentName}</strong> has
              {transcriptionStatus === 'DONE' && (
                <strong className="mr-1 text-green-600">{' finished'}</strong>
              )}
              {transcriptionStatus === 'FAILED' && (
                <strong className="mr-1 text-red-700">{' failed'}</strong>
              )}
              transcription
            </Heading>
            {transcriptionStatus === 'DONE' && (
              <Text className="text-center text-black text-[14px] leading-[24px]">
                <Link
                  href={documentLink}
                  className="text-blue-600 no-underline mr-1"
                >
                  {documentName}
                </Link>
                has finished transcription. Go to the document to see the
                results.
              </Text>
            )}
            {transcriptionStatus === 'FAILED' && (
              <Text className="text-center text-black text-[14px] leading-[24px]">
                <Link
                  href={documentLink}
                  className="text-blue-600 no-underline mr-1"
                >
                  {documentName}
                </Link>
                could not be transcribed. Please validate this and contact
                support if the issues persists.
              </Text>
            )}
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                pX={20}
                pY={12}
                className="bg-[#000000] rounded text-white text-[14px] font-semibold no-underline text-center"
                href={documentLink}
              >
                Go to {documentName}
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

export default TranscriptionStatusEmail;
