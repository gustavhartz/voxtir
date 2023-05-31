import React from 'react';
import {
  useGetStatusQuery,
  useUploadDocumentsMutation,
} from '../graphql/generated/graphql.ts';

function App() {
  const { data: statusData } = useGetStatusQuery();
  const [updateDocuments, updateDocsResult] = useUploadDocumentsMutation();
  const onChange = async ({ target: { validity, files } }: any) => {
    console.log(files);

    if (validity.valid) {
      try {
        const docs = Array.from(files, (file: any) => ({
          docType: file.type,
          file,
        }));
        await updateDocuments({ variables: { docs } });
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log('Files are not valid');
    }
  };
  return (
    <div className="App">
      <h1>GraphQL Upload Sample</h1>

      <h2>Query</h2>

      <pre>{JSON.stringify(statusData)}</pre>

      <hr />

      <h2>Mutation</h2>

      <input type="file" multiple required onChange={onChange} />

      <div>{updateDocsResult.loading && 'Uploading....'}</div>
      <pre>
        {updateDocsResult.data && JSON.stringify(updateDocsResult.data)}
      </pre>
      <pre>
        {!!updateDocsResult.error && JSON.stringify(updateDocsResult.error)}
      </pre>
    </div>
  );
}

export default App;
