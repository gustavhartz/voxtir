import HTMLtoDOCX from 'html-to-docx';

const htmlPreprocessing = (htmlString: string): string => {
  htmlString = convertTimestampsToSpans(htmlString);
  htmlString = styleMentionSpans(htmlString);
  const htmlTemplate = `
<html>
<head>
</head>
<body>
    ${htmlString}
</body>
</html>`;
  return htmlTemplate;
};

export const generateWordFileFromHTML = async (
  htmlString: string
): Promise<Blob | Buffer> => {
  const doc = await HTMLtoDOCX(htmlPreprocessing(htmlString), '', {}, '');
  return doc;
};

function convertTimestampsToSpans(htmlString: string): string {
  // Create a regular expression to match the timestamp-button element
  const timestampButtonRegex =
    /<timestamp-button[^>]*>(.*?)<\/timestamp-button>/g;

  // Use the replace method with a callback function to replace each match
  const replacedHtmlString = htmlString.replace(
    timestampButtonRegex,
    (match) => {
      // Extract the timestamp value using a regular expression
      const timestampRegex = /timestamp="([^"]+)"/;
      const timestampMatch = match.match(timestampRegex)?.[1];
      // Create the new span element wrapped in a p tag
      if (timestampMatch) {
        return `<p><span style="color: green;">${timestampMatch}</span></p>`;
      }
      return '';
    }
  );

  return replacedHtmlString;
}

function styleMentionSpans(htmlString: string): string {
  // Create a regular expression to match the mentioned spans
  const mentionSpanRegex = /<span data-type="mention"[^>]*>@([^<]+)<\/span>/g;

  // Use the replace method with a callback function to replace each match
  const replacedHtmlString = htmlString.replace(
    mentionSpanRegex,
    (match, mentionText) => {
      // Create the new span element with the desired style
      const spanElement = `<span style="color: blue; font-weight: bold;">@${mentionText}</span>`;
      return spanElement;
    }
  );

  return replacedHtmlString;
}
