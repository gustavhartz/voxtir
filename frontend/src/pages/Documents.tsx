import { CgFileDocument } from "react-icons/cg";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

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

  if (!project?.documents || project?.documents?.length === 0) {
    <div className="text-gray-900">
      <h1>No documents</h1>
    </div>
  }


  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl mb-4 font-bold text-gray-900">Documents</h1>
      <div className="grid grid-cols-1 gap-4 w-full">
        {project?.documents?.map((document) => {
            return ( 
              <Link to={`/document/${document?.id}`}>
                <div className="hover:scale-[1.03] hover:bg-slate-800 bg-slate-900 text-white duration-500 transition-all w-full cursor-pointer shadow-md rounded-md flex flex-row justify-between items-center px-4 py-4 font-semibold
                ">
                  <div className="flex flex-row items-center w-full">
                    <CgFileDocument className="text-inherit text-4xl mr-4" />
                    <span className=" w-full text-start text-2xl font-bold">{document?.title}</span>
                  </div>
                  {document?.lastModified && <div className="text-end">
                    {new Date(document?.lastModified).toDateString()}
                  </div>}
                </div>
              </Link>
            )
          })
        }
      </div>
    </div>
  );
};

const DocumentsWithAccessToken = withAccessToken(Documents);

export default DocumentsWithAccessToken;