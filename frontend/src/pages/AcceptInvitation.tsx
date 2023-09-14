import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

import { PageLoader } from '../components/Auth/page-loader';
import withAccessToken from '../components/Auth/with-access-token';
import { useAcceptProjectMutation } from '../graphql/generated/graphql';
const AcceptInvitation = ({ token }: { token: string }): JSX.Element => {
  const [searchParams] = useSearchParams();
  const projectInvitationToken = searchParams.get('token');
  const navigate = useNavigate();

  const [acceptProject, { called }] = useAcceptProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  React.useEffect(() => {
    if (projectInvitationToken && !called) {
      acceptProject({
        variables: {
          token: projectInvitationToken,
        },
      })
        .then((res) => {
          if (res.errors) {
            console.log(res.errors);
          }
          toast(res.data?.acceptProjectInvitation.message, {
            type: 'success',
            toastId: 'acceptInvitationSuccess',
            position: 'bottom-right',
          });
          navigate('/');
        })
        .catch((error) => {
          toast(error?.message, {
            type: 'error',
            toastId: 'acceptInvitationError',
            position: 'bottom-right',
          });
        });
    }
  });

  return (
    <div>
      <ToastContainer />
      <PageLoader />
    </div>
  );
};

const AcceptInvitationWithAccessToken = withAccessToken(AcceptInvitation);

export default AcceptInvitationWithAccessToken;
