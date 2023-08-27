import { useParams } from "react-router-dom";

import withAccessToken from "../components/Auth/with-access-token";
import { useProjectsQuery } from "../graphql/generated/graphql";

const Documents = ({ token }: { token: string}) => {
  const { data, loading } = useProjectsQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`
      },
    }
  });
  const projectID = useParams().projectID;
  const project = data?.projects?.find((project) => project?.id === projectID);
  if (loading) {
    return <div>Loading...</div>;
  }
  return <div>
    {project?.documents?.map((document) => {
      return <div>{document?.title}</div>;
    })
    }
  </div>;
};

const DocumentsWithAccessToken = withAccessToken(Documents);

export default DocumentsWithAccessToken;
